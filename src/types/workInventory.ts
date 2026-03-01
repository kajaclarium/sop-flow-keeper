import { TaskIO, IOType } from "./common";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type ControlStatus = "Controlled" | "Uncontrolled";

export interface WorkModule {
    id: string;
    departmentId: string;
    name: string;
    description: string;
    owner: string;
    riskLevel: RiskLevel;
    createdAt: string;
}

export interface WorkTask {
    id: string;
    moduleId: string;
    operation?: string;
    name: string;
    description: string;
    owner: string;
    riskLevel: RiskLevel;
    inputs: TaskIO[];
    outputs: TaskIO[];
    linkedSopIds: string[];
    createdAt: string;
}

export type WorkInventoryView = "modules" | "tasks" | "taskDetail";
