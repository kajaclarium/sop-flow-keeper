export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type ControlStatus = "Controlled" | "Uncontrolled";
export type IOType = "document" | "material" | "data" | "approval" | "other";

export interface TaskIO {
    id: string;
    label: string;
    type: IOType;
    description: string;
}

export interface WorkModule {
    id: string;
    name: string;
    description: string;
    owner: string;
    riskLevel: RiskLevel;
    createdAt: string;
}

export interface WorkTask {
    id: string;
    moduleId: string;
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
