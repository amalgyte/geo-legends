import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {
  @Input() FetchTerrainData: boolean = true;
  @Input() FetchCountryData: boolean = true;
  @Output() cellEvent = new EventEmitter<{
    type: string;
    cellGUID: string;
    terrain?: any[];
    country?: string;
  }>();

  private map!: L.Map;
  private gpsMarker!: L.CircleMarker; // Change from L.Marker to L.CircleMarker
  private gridLayer!: L.LayerGroup;
  private cellMap: Map<string, L.LatLngBounds> = new Map(); // Maps GUIDs to cell bounds
  private camps = [
    { id: 'cell_58650_-944', type: 'town_center', owned: true },
    { id: 'cell_58650_-942', type: 'stone_mine', owned: true },
    { id: 'cell_58651_-945', type: 'gold_mine', owned: false },
    { id: 'cell_58651_-946', type: '', owned: false },
  ];

  private gridSize = 50; // Grid cell size in meters
  private metersPerDegreeLatitude = 111320;
  private offscreenBufferFactor = 2; // Multiplier for extending bounds off-screen
  private zoomThreshold = 16; // Minimum zoom level for rendering the grid
  private clickTimeout: any = null; // Timer for single and double click detection
  private longClickTimeout: any = null; // Timer for long click detection
  private longClickDuration = 1000; // Time in ms to consider a long click
  private isLongClick = false; // Track if the current action is a long click
  private campLayer!: L.LayerGroup; // Layer for rendering camps as dots
  private centerLatitude!: number;

  constructor() {}

  ngAfterViewInit(): void {
    this.initMap();

    setTimeout(() => {
      this.map.invalidateSize(); // Ensures the map resizes properly
    }, 0);

    this.overlayGrid();
    const debouncedOverlayGrid = this.debounce(() => this.overlayGrid(), 200);
    this.map.on('moveend', debouncedOverlayGrid);
    this.getPlayerLocation();
  }

  ngOnInit(): void {
    // Precompute a fixed center latitude (e.g., based on the first camp or a default)
    this.centerLatitude = this.camps.length
      ? parseInt(this.camps[0].id.split('_')[1], 10) *
        (this.gridSize / this.metersPerDegreeLatitude)
      : 0;
  }

  private getPlayerLocation(): void {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Player location: ${latitude}, ${longitude}`);

        // Add a blue circle marker at the player's location
        // change this to get the location from a gps service.
        // Then make it possible for the gps service to imitate walking around the map for debug purposes.
        this.gpsMarker = L.circleMarker([latitude, longitude], {
          radius: 8, // Adjust the size of the circle
          color: 'blue', // Border color
          fillColor: 'blue', // Fill color
          fillOpacity: 0.8, // Transparency of the circle
        }).addTo(this.map);

        // Center the map on the player's location
        this.map.setView([latitude, longitude], 17);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location.');
      },
      {
        enableHighAccuracy: true, // Request high accuracy for GPS
        timeout: 10000, // Maximum time to wait for location
        maximumAge: 0, // No caching of location
      }
    );
  }

  private debounce(func: Function, wait: number): () => void {
    let timeout: any;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(), wait);
    };
  }

  private initMap(): void {
    const defaultCamp = this.camps[0];
    const defaultCenter = this.getCellCenterFromGUID(defaultCamp.id);

    this.map = L.map('map', {
      renderer: L.canvas(),
      doubleClickZoom: false, // Disable double-click zoom
    }).setView(defaultCenter || [51.505, -0.09], 17); // Fallback to default center

    L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      minZoom: 1,
      attribution: '© OpenStreetMap',
    }).addTo(this.map);

    this.gridLayer = L.layerGroup().addTo(this.map);
    this.campLayer = L.layerGroup().addTo(this.map); // Add camp layer
  }

  private getCellCenterFromGUID(guid: string): L.LatLng | null {
    const match = guid.match(/^cell_(\d+)_(-?\d+)$/);
    if (!match) {
      console.error(`Invalid cell GUID: ${guid}`);
      return null;
    }

    const [_, rowStr, colStr] = match;
    const row = parseInt(rowStr, 10);
    const col = parseInt(colStr, 10);

    // Use the precomputed center latitude for longitude scaling
    const metersPerDegreeLongitude =
      this.metersPerDegreeLatitude *
      Math.cos((this.centerLatitude * Math.PI) / 180);

    const cellHeight = this.gridSize / this.metersPerDegreeLatitude;
    const cellWidth = this.gridSize / metersPerDegreeLongitude;

    const lat = row * cellHeight + cellHeight / 2;
    const lng = col * cellWidth + cellWidth / 2;

    return L.latLng(lat, lng);
  }

  private overlayGrid(): void {
    // Clear both grid and camp layers
    this.gridLayer.clearLayers();
    this.campLayer.clearLayers();

    const currentZoom = this.map.getZoom();

    if (currentZoom < this.zoomThreshold) {
      // Render camps as red circles when the grid is not displayed
      this.renderCamps();
      return;
    }

    // Render grid (including yellow cells for camps) when zoom is above threshold
    const bounds = this.map.getBounds();
    const extendedBounds = this.extendBounds(
      bounds,
      this.offscreenBufferFactor
    );
    const gridCells = this.generateStaticGrid(extendedBounds, this.gridSize);

    gridCells.forEach((cell) => {
      const camp = this.camps.find((camp) => camp.id === cell.ref);
      const isCampHere = !!camp;

      let fillColor = '#000000'; // Default color for non-camp cells
      let fillOpacity = 0.5;

      if (isCampHere) {
        if (camp?.type && camp.type.trim() !== '') {
          fillColor = camp.owned ? '#fffc00' : '#aaffff'; // Yellow for owned camps, green for non-owned camps
        } else {
          fillColor = 'none'; // Transparent if type is null or blank
          fillOpacity = 0;
        }
      }

      const gridBox = L.rectangle(cell.bounds, {
        color: '#000000',
        weight: 0.5,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
      });

      // Add event listeners for click and long click
      gridBox.on('mousedown', () => this.startLongClick(cell.ref));
      gridBox.on('mouseup', () => this.handleCellClick(cell.ref, cell.bounds));
      gridBox.on('mouseout', () => this.cancelLongClick());

      // Store the cell reference and bounds in the map
      this.cellMap.set(cell.ref, cell.bounds);

      this.gridLayer.addLayer(gridBox);
    });
  }

  private renderCamps(): void {
    this.camps.forEach((camp) => {
      const center = this.getCellCenterFromGUID(camp.id);
      if (!center) {
        console.error(`Could not determine center for camp ID: ${camp.id}`);
        return;
      }

      const markerColor = camp.owned ? 'green' : 'grey'; // Red for owned camps, blue for non-owned camps
      const fillColor = camp.owned ? '#ff6666' : '#eeeeee'; // Light red for owned camps, light blue for non-owned camps

      const marker = L.circleMarker(center, {
        radius: 6, // Fixed size for visibility
        color: markerColor, // Border color based on ownership
        fillColor: fillColor, // Fill color based on ownership
        fillOpacity: 0.8, // Semi-transparent
      });

      marker.bindTooltip(camp.type || 'Unknown', {
        permanent: false,
        direction: 'top',
      });
      this.campLayer.addLayer(marker);
    });
  }

  private extendBounds(bounds: L.LatLngBounds, factor: number): L.LatLngBounds {
    const latDiff = bounds.getNorth() - bounds.getSouth();
    const lngDiff = bounds.getEast() - bounds.getWest();

    const extendedSouthWest = L.latLng(
      bounds.getSouth() - latDiff * factor,
      bounds.getWest() - lngDiff * factor
    );
    const extendedNorthEast = L.latLng(
      bounds.getNorth() + latDiff * factor,
      bounds.getEast() + lngDiff * factor
    );

    return L.latLngBounds(extendedSouthWest, extendedNorthEast);
  }

  private generateStaticGrid(
    bounds: L.LatLngBounds,
    cellSizeMeters: number
  ): { bounds: L.LatLngBounds; ref: string }[] {
    const cells: { bounds: L.LatLngBounds; ref: string }[] = [];

    // Use the center latitude for consistent scaling
    const centerLat = (bounds.getNorth() + bounds.getSouth()) / 2;

    // Calculate degrees per meter for longitude at the center latitude
    const metersPerDegreeLongitude =
      this.metersPerDegreeLatitude * Math.cos((centerLat * Math.PI) / 180);

    const cellHeight = cellSizeMeters / this.metersPerDegreeLatitude;
    const cellWidth = cellSizeMeters / metersPerDegreeLongitude;

    // Calculate row and column bounds relative to the static origin
    const originLat = 0;
    const originLng = 0;

    const startRow = Math.floor((bounds.getSouth() - originLat) / cellHeight);
    const endRow = Math.ceil((bounds.getNorth() - originLat) / cellHeight);
    const startCol = Math.floor((bounds.getWest() - originLng) / cellWidth);
    const endCol = Math.ceil((bounds.getEast() - originLng) / cellWidth);

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const southWest = L.latLng(
          originLat + row * cellHeight,
          originLng + col * cellWidth
        );
        const northEast = L.latLng(
          originLat + (row + 1) * cellHeight,
          originLng + (col + 1) * cellWidth
        );

        const ref = `cell_${row}_${col}`;
        cells.push({ bounds: L.latLngBounds(southWest, northEast), ref });
      }
    }

    return cells;
  }

  private drawTemporaryCircle(center: L.LatLng): void {
    // Create a circle with a blue outline
    const circle = L.circle(center, {
      color: 'blue', // Circle border color
      fillColor: '#0000ff', // Circle fill color
      fillOpacity: 0.2, // Circle transparency
      radius: this.gridSize * 0.75, // Radius in meters
    }).addTo(this.map);

    // Remove the circle after 1 second
    setTimeout(() => {
      this.map.removeLayer(circle);
    }, 1000);
  }

  private startLongClick(guid: string): void {
    // Start a long click timer
    this.longClickTimeout = setTimeout(async () => {
      this.longClickTimeout = null;
      this.isLongClick = true; // Set the long click flag

      const center = this.getCellCenterFromGUID(guid);
      if (!center) {
        console.error(`Invalid cell GUID: ${guid}`);
        return;
      }

      const [terrainData, country] = await Promise.all([
        this.fetchTerrainData(center),
        this.fetchCountry(center),
      ]);

      this.cellEvent.emit({
        type: 'long-click',
        cellGUID: guid,
        terrain: terrainData,
        country: country || 'Unknown',
      });
    }, this.longClickDuration);
  }

  private async handleCellClick(
    guid: string,
    bounds: L.LatLngBounds
  ): Promise<void> {
    // Cancel any long click timer
    this.cancelLongClick();

    const center = bounds.getCenter();
    const [terrainData, country] = await Promise.all([
      this.fetchTerrainData(center),
      this.fetchCountry(center),
    ]);
    if (this.isLongClick) {
      this.isLongClick = false;
      this.drawTemporaryCircle(center); // Draw temporary circle
      return;
    }

    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;

      this.map.setView(center, this.map.getZoom());
      this.cellEvent.emit({
        type: 'double-click',
        cellGUID: guid,
        terrain: terrainData,
        country: country || 'Unknown',
      });

      this.drawTemporaryCircle(center); // Draw temporary circle
    } else {
      this.clickTimeout = setTimeout(() => {
        this.clickTimeout = null;

        // Center the map on the cell
        // this.map.setView(center, this.map.getZoom());
        this.cellEvent.emit({
          type: 'single-click',
          cellGUID: guid,
          terrain: terrainData,
          country: country || 'Unknown',
        });
        // this.drawTemporaryCircle(center);
      }, 300);
    }
  }

  private async fetchTerrainData(center: L.LatLng): Promise<any[]> {
    if (!this.FetchTerrainData) return [];
    const lat = center.lat;
    const lng = center.lng;

    const query = `
      [out:json];
      (
        node["landuse"](${lat - 0.001},${lng - 0.001},${lat + 0.001},${
      lng + 0.001
    });
        way["landuse"](${lat - 0.001},${lng - 0.001},${lat + 0.001},${
      lng + 0.001
    });
        relation["landuse"](${lat - 0.001},${lng - 0.001},${lat + 0.001},${
      lng + 0.001
    });
        node["natural"](${lat - 0.001},${lng - 0.001},${lat + 0.001},${
      lng + 0.001
    });
        way["natural"](${lat - 0.001},${lng - 0.001},${lat + 0.001},${
      lng + 0.001
    });
        relation["natural"](${lat - 0.001},${lng - 0.001},${lat + 0.001},${
      lng + 0.001
    });
      );
      out body;
    `;

    const url = 'https://overpass-api.de/api/interpreter';
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: query,
      });

      if (!response.ok) {
        console.error('Error fetching terrain data:', response.statusText);
        return [];
      }

      const data = await response.json();

      // Extract relevant information
      const terrainData = data.elements
        .filter((el: any) => el.tags) // Only include elements with tags
        .map((el: any) => ({
          id: el.id,
          type: el.type,
          tags: el.tags,
        }));

      return terrainData;
    } catch (error) {
      console.error('Error querying Overpass API:', error);
      return [];
    }
  }

  private async fetchCountry(center: L.LatLng): Promise<string | null> {
    if (!this.FetchCountryData) return null;

    const lat = center.lat;
    const lng = center.lng;
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Error fetching country:', response.statusText);
        return null;
      }

      const data = await response.json();
      return data.address?.country || null; // Return country name or null if not found
    } catch (error) {
      console.error('Error querying Nominatim API:', error);
      return null;
    }
  }

  private cancelLongClick(): void {
    // Clear the long click timer
    if (this.longClickTimeout) {
      clearTimeout(this.longClickTimeout);
      this.longClickTimeout = null;
    }
  }
}
