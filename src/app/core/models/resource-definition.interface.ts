import { ResourceCategory } from "../enumerators/resource-category.enum";

export interface ResourceDefinition {
    id: string;                 // Unique identifier
    name: string;               // Display name
    description: string;        // Description of the resource
    baseValue: number;          // Base value for trading or calculation
    category: ResourceCategory; // Category of resource
  }
  