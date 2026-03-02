export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type ControlStatus = "SOP Mapped" | "SOP Unmapped";

export interface WorkModule {
    id: string;
    departmentId: string;
    name: string;
    description: string;
    owner: string;
    riskLevel: RiskLevel;
    createdAt: string;
}
export interface WorkOperation {
    id: string;
    moduleId: string;
    name: string;
    description: string;
    createdAt: string;
}

export interface WorkTask {
    id: string;
    moduleId: string;
    operationId?: string;
    name: string;
    description: string;
    owner: string;
    riskLevel: RiskLevel;
    linkedSopIds: string[];
    createdAt: string;
}

export type WorkInventoryView = "modules" | "tasks" | "taskDetail";
