import React, { createContext, useContext, useState, useCallback } from "react";
import { WorkModule, WorkTask, TaskIO, RiskLevel, WorkInventoryView, ControlStatus } from "@/types/workInventory";

const generateModuleId = () => `MOD-${String(Math.floor(Math.random() * 900) + 100).padStart(3, "0")}`;
const generateTaskId = () => `TSK-${String(Math.floor(Math.random() * 900) + 100).padStart(3, "0")}`;

/** Available SOPs for linking — acts as the single source of truth for SOP metadata. */
export const AVAILABLE_SOPS = [
  { id: "SOP-001", title: "Facility Cleaning Protocol" },
  { id: "SOP-002", title: "Equipment Calibration Procedure" },
  { id: "SOP-003", title: "Incident Response Plan" },
  { id: "SOP-004", title: "Chemical Waste Disposal" },
  { id: "SOP-005", title: "Employee Onboarding Checklist" },
  { id: "SOP-006", title: "Data Backup & Recovery" },
];

/** Map for quick SOP title lookup by ID. */
export const SOP_TITLE_MAP: Record<string, string> = Object.fromEntries(
  AVAILABLE_SOPS.map((s) => [s.id, s.title])
);

const INITIAL_MODULES: WorkModule[] = [
  { id: "MOD-001", name: "Maintenance Operations", description: "Preventive and corrective maintenance across all facilities and equipment. Covers scheduled inspections, unplanned repairs, facility cleaning, and equipment calibration to ensure operational continuity and compliance.", owner: "Maintenance Manager", riskLevel: "High", createdAt: "2025-06-01" },
  { id: "MOD-002", name: "Quality Control", description: "Inspection, testing and quality assurance for all production outputs. Includes incoming material inspection, in-process checks, final product testing, and supplier quality management.", owner: "QC Lead", riskLevel: "Critical", createdAt: "2025-06-01" },
  { id: "MOD-003", name: "Logistics & Warehousing", description: "Inbound receiving, storage, inventory management and outbound dispatch. Manages goods receipt, cycle counting, pick-pack-ship, and carrier coordination.", owner: "Logistics Coordinator", riskLevel: "Medium", createdAt: "2025-06-15" },
  { id: "MOD-004", name: "Safety & Environment", description: "Workplace safety protocols, environmental compliance and incident response. Encompasses hazard identification, safety training, emergency drills, waste handling, and regulatory reporting.", owner: "HSE Officer", riskLevel: "Critical", createdAt: "2025-07-01" },
  { id: "MOD-005", name: "IT Infrastructure", description: "Network management, system backups, cybersecurity and help desk operations. Covers server administration, data protection policies, user access management, and disaster recovery planning.", owner: "IT Manager", riskLevel: "High", createdAt: "2025-07-10" },
];

const INITIAL_TASKS: WorkTask[] = [
  {
    id: "TSK-001", moduleId: "MOD-001", name: "Preventive Maintenance Schedule", description: "Routine scheduled maintenance for all production equipment",
    owner: "Maintenance Technician", riskLevel: "High",
    inputs: [
      { id: "io-1", label: "Equipment Registry", type: "data", description: "List of all equipment with maintenance intervals" },
      { id: "io-2", label: "Spare Parts Inventory", type: "material", description: "Available spare parts and consumables" },
    ],
    outputs: [
      { id: "io-3", label: "Maintenance Log", type: "document", description: "Completed maintenance record with findings" },
      { id: "io-4", label: "Equipment Status Report", type: "data", description: "Updated equipment health status" },
    ],
    linkedSopIds: ["SOP-002"], createdAt: "2025-06-10",
  },
  {
    id: "TSK-002", moduleId: "MOD-001", name: "Corrective Maintenance Response", description: "Unplanned breakdown repair and root cause analysis",
    owner: "Senior Technician", riskLevel: "Critical",
    inputs: [
      { id: "io-5", label: "Breakdown Notification", type: "data", description: "Alert from monitoring system or operator report" },
      { id: "io-6", label: "Equipment Manual", type: "document", description: "OEM technical documentation" },
    ],
    outputs: [
      { id: "io-7", label: "Repair Report", type: "document", description: "Details of repair actions and parts replaced" },
      { id: "io-8", label: "Root Cause Analysis", type: "document", description: "Investigation findings and preventive recommendations" },
    ],
    linkedSopIds: [], createdAt: "2025-06-12",
  },
  {
    id: "TSK-003", moduleId: "MOD-001", name: "Facility Cleaning & Hygiene", description: "Scheduled cleaning of production and office areas",
    owner: "Facility Supervisor", riskLevel: "Medium",
    inputs: [
      { id: "io-9", label: "Cleaning Schedule", type: "data", description: "Weekly/monthly cleaning rotation plan" },
      { id: "io-10", label: "Cleaning Supplies", type: "material", description: "Approved cleaning agents and tools" },
    ],
    outputs: [
      { id: "io-11", label: "Cleaning Checklist", type: "document", description: "Signed checklist confirming completion" },
    ],
    linkedSopIds: ["SOP-001"], createdAt: "2025-06-15",
  },
  {
    id: "TSK-004", moduleId: "MOD-002", name: "Incoming Material Inspection", description: "Quality check on raw materials and components upon receipt",
    owner: "QC Inspector", riskLevel: "High",
    inputs: [
      { id: "io-12", label: "Purchase Order", type: "document", description: "PO with material specifications" },
      { id: "io-13", label: "Supplier COA", type: "document", description: "Certificate of analysis from vendor" },
    ],
    outputs: [
      { id: "io-14", label: "Inspection Report", type: "document", description: "Pass/fail results with measurements" },
      { id: "io-15", label: "Material Release", type: "approval", description: "Authorization to use material in production" },
    ],
    linkedSopIds: [], createdAt: "2025-06-20",
  },
  {
    id: "TSK-005", moduleId: "MOD-004", name: "Incident Investigation & Reporting", description: "Investigate workplace incidents and file regulatory reports",
    owner: "HSE Officer", riskLevel: "Critical",
    inputs: [
      { id: "io-16", label: "Incident Notification", type: "data", description: "Initial incident report from site" },
      { id: "io-17", label: "Witness Statements", type: "document", description: "Written accounts from witnesses" },
    ],
    outputs: [
      { id: "io-18", label: "Investigation Report", type: "document", description: "Full investigation with root cause and corrective actions" },
      { id: "io-19", label: "Regulatory Filing", type: "document", description: "OSHA/EPA filing if required" },
    ],
    linkedSopIds: ["SOP-003"], createdAt: "2025-07-05",
  },
  {
    id: "TSK-006", moduleId: "MOD-005", name: "Data Backup & Disaster Recovery", description: "Daily backup procedures and quarterly DR drills",
    owner: "System Administrator", riskLevel: "High",
    inputs: [
      { id: "io-20", label: "Backup Policy", type: "document", description: "Defined RPO/RTO targets and backup scope" },
      { id: "io-21", label: "System Inventory", type: "data", description: "Servers and databases in scope" },
    ],
    outputs: [
      { id: "io-22", label: "Backup Verification Log", type: "document", description: "Checksum validation and restore test results" },
      { id: "io-23", label: "DR Test Report", type: "document", description: "Quarterly disaster recovery drill outcome" },
    ],
    linkedSopIds: ["SOP-006"], createdAt: "2025-07-15",
  },
];


interface WorkInventoryContextType {
  modules: WorkModule[];
  tasks: WorkTask[];
  currentView: WorkInventoryView;
  selectedModuleId: string | null;
  selectedTaskId: string | null;
  setCurrentView: (view: WorkInventoryView) => void;
  createModule: (name: string, description: string, owner: string, riskLevel: RiskLevel) => void;
  updateModule: (id: string, updates: Partial<WorkModule>) => void;
  deleteModule: (id: string) => void;
  createTask: (moduleId: string, name: string, description: string, owner: string, riskLevel: RiskLevel, inputs: TaskIO[], outputs: TaskIO[], linkedSopIds: string[]) => void;
  updateTask: (id: string, updates: Partial<WorkTask>) => void;
  deleteTask: (id: string) => void;
  navigateToModules: () => void;
  navigateToTasks: (moduleId: string) => void;
  navigateToTaskDetail: (taskId: string) => void;
  getSelectedModule: () => WorkModule | undefined;
  getSelectedTask: () => WorkTask | undefined;
  getTaskControlStatus: (task: WorkTask) => ControlStatus;
  getModuleTasks: (moduleId: string) => WorkTask[];
}

const WorkInventoryContext = createContext<WorkInventoryContextType | undefined>(undefined);

export function WorkInventoryProvider({ children }: { children: React.ReactNode }) {
  const [modules, setModules] = useState<WorkModule[]>(INITIAL_MODULES);
  const [tasks, setTasks] = useState<WorkTask[]>(INITIAL_TASKS);
  const [currentView, setCurrentView] = useState<WorkInventoryView>("modules");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const createModule = useCallback((name: string, description: string, owner: string, riskLevel: RiskLevel) => {
    const mod: WorkModule = {
      id: generateModuleId(), name, description, owner, riskLevel,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setModules((prev) => [mod, ...prev]);
  }, []);

  const updateModule = useCallback((id: string, updates: Partial<WorkModule>) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  }, []);

  const deleteModule = useCallback((id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
    setTasks((prev) => prev.filter((t) => t.moduleId !== id));
    if (selectedModuleId === id) { setSelectedModuleId(null); setCurrentView("modules"); }
  }, [selectedModuleId]);

  const createTask = useCallback(
    (moduleId: string, name: string, description: string, owner: string, riskLevel: RiskLevel, inputs: TaskIO[], outputs: TaskIO[], linkedSopIds: string[]) => {
      const task: WorkTask = {
        id: generateTaskId(), moduleId, name, description, owner, riskLevel,
        inputs, outputs, linkedSopIds,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setTasks((prev) => [task, ...prev]);
    }, []);

  const updateTask = useCallback((id: string, updates: Partial<WorkTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTaskId === id) { setSelectedTaskId(null); setCurrentView("tasks"); }
  }, [selectedTaskId]);

  const navigateToModules = useCallback(() => {
    setSelectedModuleId(null); setSelectedTaskId(null); setCurrentView("modules");
  }, []);

  const navigateToTasks = useCallback((moduleId: string) => {
    setSelectedModuleId(moduleId); setSelectedTaskId(null); setCurrentView("tasks");
  }, []);

  const navigateToTaskDetail = useCallback((taskId: string) => {
    setSelectedTaskId(taskId); setCurrentView("taskDetail");
  }, []);

  const getSelectedModule = useCallback(() => modules.find((m) => m.id === selectedModuleId), [modules, selectedModuleId]);
  const getSelectedTask = useCallback(() => tasks.find((t) => t.id === selectedTaskId), [tasks, selectedTaskId]);
  const getTaskControlStatus = useCallback((task: WorkTask): ControlStatus => task.linkedSopIds.length > 0 ? "Controlled" : "Uncontrolled", []);
  const getModuleTasks = useCallback((moduleId: string) => tasks.filter((t) => t.moduleId === moduleId), [tasks]);


  return (
    <WorkInventoryContext.Provider value={{
      modules, tasks, currentView, selectedModuleId, selectedTaskId, setCurrentView,
      createModule, updateModule, deleteModule,
      createTask, updateTask, deleteTask,
      navigateToModules, navigateToTasks, navigateToTaskDetail,
      getSelectedModule, getSelectedTask, getTaskControlStatus, getModuleTasks,
    }}>
      {children}
    </WorkInventoryContext.Provider>
  );
}

export function useWorkInventory() {
  const context = useContext(WorkInventoryContext);
  if (!context) throw new Error("useWorkInventory must be used within WorkInventoryProvider");
  return context;
}
