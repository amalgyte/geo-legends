import { RelationshipStatus } from "../enumerators/relationship-status.enum";
import { Agreement } from "./agreement.interface";

export interface Relationship {
    targetEntityId: string;     // ID of the other entity
    status: RelationshipStatus; // Current relationship status
    trustLevel: number;         // Trust score (-100 to +100)
    agreements: Agreement[];    // List of active agreements
  }
  