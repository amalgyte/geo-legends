import { EffectDefinitionType } from "../enumerators/effect-definition-type.enum";

export interface EffectDefinition {
    type: EffectDefinitionType; // Type of effect
    targetId: string;          // Target (e.g., a building or unit)
    multiplier: number;        // Effect multiplier (e.g., +10% production)
  }
  