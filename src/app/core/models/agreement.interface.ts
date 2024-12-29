import { AgreementType } from "../enumerators/agreement-type.enum";
import { AgreementTerm } from "./agreement-term.interface";

export interface Agreement {
    id: string;                 // Unique identifier
    type: AgreementType; // Type of agreement
    terms: AgreementTerm[];     // Specific terms of the agreement
    startDate: number;          // Timestamp when the agreement starts
    endDate?: number;           // Optional end date for temporary agreements
  }
  