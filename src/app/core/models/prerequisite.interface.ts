export interface Prerequisite {
    type: 'building' | 'technology' | 'resource'; // Type of prerequisite
    id: string; // ID of the required building, technology, or resource
    level?: number; // Level required (for buildings/technologies)
    amount?: number; // Amount required (for resources)
  }
  