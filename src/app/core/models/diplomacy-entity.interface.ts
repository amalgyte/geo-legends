import { EntityType } from "../enumerators/entity-type.enum";
import { Relationship } from "./relationship.interface";

export interface DiplomaticEntity {
    id: string;                 // Unique identifier
    name: string;               // Name of the entity (e.g., faction, player)
    type: EntityType; // Type of entity
    reputation: number;         // Global reputation score (-100 to +100)
    influence: number;          // Ability to sway others' decisions (0 to 100)
    relationships: Relationship[]; // Relationships with other entities
  }
  