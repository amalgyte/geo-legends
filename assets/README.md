# Game Spritesheet

This folder contains a single large vector spritesheet and metadata so your engine can slice frames and play animations.

- Image: `spritesheet.svg` — 8x4 grid, each tile 64x64 px (sheet size 512x256)
- Metadata: `spritesheet.json` — frame rectangles, pivots, and animation sequences

## Contents
- Hero (top-down, 4 directions)
  - `hero_*_walk_0..2` — 3-frame walk cycles for up/down/left/right
- Slime
  - `slime_idle_0..3` — subtle squish idle loop
- Coin
  - `coin_spin_0..5` — full spin loop
- Explosion
  - `explosion_0..5` — 6-frame non-looping burst

## Export PNG (optional)
Some engines prefer PNG over SVG. Export at the native size (512x256):

- Inkscape GUI: File → Export PNG → Width 512, Height 256 → Export
- Inkscape CLI:
  ```bash
  inkscape --export-type=png --export-filename=/workspace/assets/spritesheet.png \
           --export-width=512 --export-height=256 /workspace/assets/spritesheet.svg
  ```
- rsvg-convert:
  ```bash
  rsvg-convert -w 512 -h 256 -o /workspace/assets/spritesheet.png /workspace/assets/spritesheet.svg
  ```

## Using the metadata
Each frame is defined by its `x,y,w,h` within the sheet. `pivot` is the normalized anchor point (0..1) relative to the frame rect. Example loader logic:

```json
{
  "frames": {
    "hero_down_walk_0": { "frame": { "x": 0, "y": 0, "w": 64, "h": 64 }, "pivot": {"x": 0.5, "y": 0.78} }
  }
}
```

- Slice a subtexture for each frame
- Set display origin to `pivot.x * w`, `pivot.y * h`
- Play sequences listed under `animations` at the given `fps`

## Notes
- The SVG includes subtle variations between frames to give life to the animations.
- You can scale this spritesheet to higher resolutions; being vector, it will stay crisp.
- If your engine mirrors right/left, you may reuse the left walk for right to save memory.