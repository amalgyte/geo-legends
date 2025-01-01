// import { Ages } from "../enumerators/ages.enum";
import { UnitType } from "../enumerators/unit-type.enum";
import { ResourceCost } from "./resource-cost.interface";
import { UnitStats } from "./unit-stats.interface";
import { UpgradeDefinition } from "./upgrade-definition.interface";

export interface UnitDefinition {
    id: string;                 // Unique identifier
    name: string;               // Display name
    description: string;        // Description of the unit
    age: string;                // ID of the age this unit belongs to
    cost: ResourceCost[];       // Cost to train
    stats: UnitStats;           // Combat or utility stats
    category: UnitType; // Type of unit

    upgrades: UpgradeDefinition[]; // Upgrade paths
  }
  