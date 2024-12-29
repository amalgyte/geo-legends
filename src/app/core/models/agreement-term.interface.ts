import { AgreementTermType } from "../enumerators/agreement-term-type.enum";
import { Condition } from "./condition.interface";

export interface AgreementTerm {
    type: AgreementTermType; // Type of term
    resourceId?: string;        // Resource involved (if applicable)
    amount?: number;            // Amount of resource (if applicable)
    duration?: number;          // Duration in turns or real-time
    conditions: Condition[];    // Conditions to fulfill the term
  }
  