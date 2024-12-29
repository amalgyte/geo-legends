import { BuildingId } from '../enumerators/building-id.enum';
import { ConditionType } from '../enumerators/condition-type.enum';
import { ResourceId } from '../enumerators/resource-id.enum';
import { TechnologyId } from '../enumerators/technology-id.enum';
import { UnitId } from '../enumerators/unit-id.enum';

export interface UnlockRequirement {
  type: ConditionType; // Condition type
  id: ResourceId | TechnologyId | BuildingId | UnitId; // ID of the resource, technology, or building
  amount?: number; // Amount required (if applicable)
}
