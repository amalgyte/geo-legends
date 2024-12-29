import { ConditionType } from "../enumerators/condition-type.enum";

export interface Condition {
    type: ConditionType; // Type of condition
    resourceId?: string;        // ID of resource (if applicable)
    amount?: number;            // Required amount (if applicable)
    eventId?: string;           // Specific event (e.g., battle won)
  }
  