import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { WorkModule, WorkTask, WorkOperation, RiskLevel, WorkInventoryView, ControlStatus } from "@/types/workInventory";

const generateModuleId = () => `MOD-${String(Math.floor(Math.random() * 900) + 100).padStart(3, "0")}`;
const generateOperationId = () => `OP-${String(Math.floor(Math.random() * 900) + 100).padStart(3, "0")}`;
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
  { id: "MOD-001", departmentId: "DEP-0001", name: "Maintenance Operations", description: "Preventive and corrective maintenance across all facilities and equipment. Covers scheduled inspections, unplanned repairs, facility cleaning, and equipment calibration to ensure operational continuity and compliance.", owner: "Maintenance Manager", riskLevel: "High", createdAt: "2025-06-01" },
  { id: "MOD-002", departmentId: "DEP-0003", name: "Quality Control", description: "Inspection, testing and quality assurance for all production outputs. Includes incoming material inspection, in-process checks, final product testing, and supplier quality management.", owner: "QC Lead", riskLevel: "Critical", createdAt: "2025-06-01" },
  { id: "MOD-003", departmentId: "DEP-0001", name: "Logistics & Warehousing", description: "Inbound receiving, storage, inventory management and outbound dispatch. Manages goods receipt, cycle counting, pick-pack-ship, and carrier coordination.", owner: "Logistics Coordinator", riskLevel: "Medium", createdAt: "2025-06-15" },
  { id: "MOD-004", departmentId: "DEP-0003", name: "Safety & Environment", description: "Workplace safety protocols, environmental compliance and incident response. Encompasses hazard identification, safety training, emergency drills, waste handling, and regulatory reporting.", owner: "HSE Officer", riskLevel: "Critical", createdAt: "2025-07-01" },
  { id: "MOD-005", departmentId: "DEP-0002", name: "IT Infrastructure", description: "Network management, system backups, cybersecurity and help desk operations. Covers server administration, data protection policies, user access management, and disaster recovery planning.", owner: "IT Manager", riskLevel: "High", createdAt: "2025-07-10" },
  // HR Department (DEP-0004)
  { id: "MOD-HR-001", departmentId: "DEP-0004", name: "Recruitment and Hiring", description: "Finding, screening, and hiring new talent for the organization.", owner: "HR Manager", riskLevel: "Medium", createdAt: "2026-03-01" },
  { id: "MOD-HR-002", departmentId: "DEP-0004", name: "Employee Onboarding", description: "Integrating new hires into the company successfully.", owner: "HR Manager", riskLevel: "Medium", createdAt: "2026-03-01" },
  { id: "MOD-HR-003", departmentId: "DEP-0004", name: "Performance Management", description: "Continuous cycle of evaluating and improving employee performance.", owner: "HR Manager", riskLevel: "Medium", createdAt: "2026-03-01" },
  { id: "MOD-HR-004", departmentId: "DEP-0004", name: "Payroll & Administration", description: "Managing daily operational tasks, leave requests, and payroll processing.", owner: "HR Manager", riskLevel: "High", createdAt: "2026-03-01" },
];

const INITIAL_OPERATIONS: WorkOperation[] = [
  { id: "OP-001", moduleId: "MOD-001", name: "Preventive Maintenance", description: "Routine scheduled maintenance operations", createdAt: "2025-06-05" },
  { id: "OP-002", moduleId: "MOD-001", name: "Corrective Maintenance", description: "Unplanned breakdown repairs", createdAt: "2025-06-05" },
  { id: "OP-003", moduleId: "MOD-001", name: "Facility Management", description: "Cleaning and hygiene of facilities", createdAt: "2025-06-05" },
  { id: "OP-HR-001", moduleId: "MOD-HR-001", name: "Screening", description: "Candidate resume review and screening", createdAt: "2026-03-01" },
  { id: "OP-HR-002", moduleId: "MOD-HR-001", name: "Selection", description: "Interview processes", createdAt: "2026-03-01" },
  { id: "OP-HR-003", moduleId: "MOD-HR-002", name: "Setup", description: "Initial setup for hires", createdAt: "2026-03-01" },
  { id: "OP-HR-004", moduleId: "MOD-HR-002", name: "Compliance", description: "Mandatory compliance forms", createdAt: "2026-03-01" },
  { id: "OP-HR-005", moduleId: "MOD-HR-003", name: "Evaluation", description: "Performance evaluations", createdAt: "2026-03-01" },
  { id: "OP-HR-006", moduleId: "MOD-HR-003", name: "Coaching", description: "Performance improvement", createdAt: "2026-03-01" },
  { id: "OP-HR-007", moduleId: "MOD-HR-004", name: "Processing", description: "Payroll and timecards", createdAt: "2026-03-01" },
];

const INITIAL_TASKS: WorkTask[] = [
  {
    id: "TSK-001", moduleId: "MOD-001", operationId: "OP-001", name: "Preventive Maintenance Schedule", description: "Routine scheduled maintenance for all production equipment",
    owner: "Maintenance Technician", riskLevel: "High",
    linkedSopIds: ["SOP-002"], createdAt: "2025-06-10",
  },
  {
    id: "TSK-002", moduleId: "MOD-001", operationId: "OP-002", name: "Corrective Maintenance Response", description: "Unplanned breakdown repair and root cause analysis",
    owner: "Senior Technician", riskLevel: "Critical",
    linkedSopIds: [], createdAt: "2025-06-12",
  },
  {
    id: "TSK-003", moduleId: "MOD-001", operationId: "OP-003", name: "Facility Cleaning & Hygiene", description: "Scheduled cleaning of production and office areas",
    owner: "Facility Supervisor", riskLevel: "Medium",
    linkedSopIds: ["SOP-001"], createdAt: "2025-06-15",
  },
  // Recruitment Flow
  {
    id: "TSK-HR-001", moduleId: "MOD-HR-001", operationId: "OP-HR-001", name: "Resume Review", description: "Reviewing candidate resumes against job requisitions.",
    owner: "HR Manager", riskLevel: "Low", 
    linkedSopIds: [], createdAt: "2026-03-01",
  },
  {
    id: "TSK-HR-002", moduleId: "MOD-HR-001", operationId: "OP-HR-002", name: "Interview Panel", description: "Conducting panel interviews with qualified candidates.",
    owner: "HR Manager", riskLevel: "Medium", 
    linkedSopIds: [], createdAt: "2026-03-01",
  },
  // Onboarding Flow
  {
    id: "TSK-HR-003", moduleId: "MOD-HR-002", operationId: "OP-HR-003", name: "IT Equipment Provision", description: "Provisioning hardware and system access for new hires.",
    owner: "IT Manager", riskLevel: "Medium", 
    linkedSopIds: [], createdAt: "2026-03-01",
  },
  {
    id: "TSK-HR-004", moduleId: "MOD-HR-002", operationId: "OP-HR-004", name: "Tax Form Submission", description: "Collecting and filing mandatory tax and compliance docs.",
    owner: "HR Manager", riskLevel: "Low", 
    linkedSopIds: [], createdAt: "2026-03-01",
  },
  // Performance Flow
  {
    id: "TSK-HR-005", moduleId: "MOD-HR-003", operationId: "OP-HR-005", name: "Self-Assessment", description: "Employees completing their periodic self-evaluations.",
    owner: "HR Manager", riskLevel: "Low", 
    linkedSopIds: [], createdAt: "2026-03-01",
  },
  {
    id: "TSK-HR-006", moduleId: "MOD-HR-003", operationId: "OP-HR-006", name: "PIP Initiation", description: "Initiating Performance Improvement Plans for low performers.",
    owner: "HR Manager", riskLevel: "High", 
    linkedSopIds: [], createdAt: "2026-03-01",
  },
  // Payroll Flow
  {
    id: "TSK-HR-007", moduleId: "MOD-HR-004", operationId: "OP-HR-007", name: "Timecard Approval", description: "Reviewing and approving employee timecards for payroll.",
    owner: "HR Manager", riskLevel: "Medium", 
    linkedSopIds: [], createdAt: "2026-03-01",
  },
];


interface WorkInventoryContextType {
  modules: WorkModule[];
  tasks: WorkTask[];
  operations: WorkOperation[];
  currentView: WorkInventoryView;
  selectedModuleId: string | null;
  selectedTaskId: string | null;
  selectedOperationId: string | null;
  setSelectedModuleId: (id: string | null) => void;
  setSelectedTaskId: (id: string | null) => void;
  setSelectedOperationId: (id: string | null) => void;
  setCurrentView: (view: WorkInventoryView) => void;
  createModule: (name: string, description: string, owner: string, riskLevel: RiskLevel) => void;
  updateModule: (id: string, updates: Partial<WorkModule>) => void;
  deleteModule: (id: string) => void;
  createOperation: (moduleId: string, name: string, description: string) => string;
  updateOperation: (id: string, updates: Partial<WorkOperation>) => void;
  deleteOperation: (id: string) => void;
  createTask: (moduleId: string, name: string, description: string, owner: string, riskLevel: RiskLevel, linkedSopIds: string[], operationId?: string) => void;
  updateTask: (id: string, updates: Partial<WorkTask>) => void;
  deleteTask: (id: string) => void;
  navigateToModules: () => void;
  navigateToTasks: (moduleId: string) => void;
  navigateToOperation: (moduleId: string, operationId: string) => void;
  navigateToTaskDetail: (taskId: string) => void;
  getSelectedModule: () => WorkModule | undefined;
  getSelectedTask: () => WorkTask | undefined;
  getTaskControlStatus: (task: WorkTask) => ControlStatus;
  getModuleTasks: (moduleId: string) => WorkTask[];
  allModules: WorkModule[]; // Added for global registry access if needed
  allTasks: WorkTask[];    // Added for global registry access if needed
  allOperations: WorkOperation[];
}

const WorkInventoryContext = createContext<WorkInventoryContextType | undefined>(undefined);

export function WorkInventoryProvider({ children, departmentId }: { children: React.ReactNode; departmentId?: string }) {
  const [allModules, setAllModules] = useState<WorkModule[]>(INITIAL_MODULES);
  const [allTasks, setAllTasks] = useState<WorkTask[]>(INITIAL_TASKS);
  const [allOperations, setAllOperations] = useState<WorkOperation[]>(INITIAL_OPERATIONS);
  const [currentView, setCurrentView] = useState<WorkInventoryView>("modules");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedOperationId, setSelectedOperationId] = useState<string | null>(null);

  // Filtered data based on departmentId
  const modules = useMemo(() => 
    departmentId ? allModules.filter(m => m.departmentId === departmentId) : allModules,
  [allModules, departmentId]);

  const tasks = useMemo(() => {
    const moduleIds = new Set(modules.map(m => m.id));
    return allTasks.filter(t => moduleIds.has(t.moduleId));
  }, [allTasks, modules]);

  const operations = useMemo(() => {
    const moduleIds = new Set(modules.map(m => m.id));
    return allOperations.filter(o => moduleIds.has(o.moduleId));
  }, [allOperations, modules]);

  const createModule = useCallback((name: string, description: string, owner: string, riskLevel: RiskLevel) => {
    if (!departmentId) return;
    const mod: WorkModule = {
      id: generateModuleId(), departmentId, name, description, owner, riskLevel,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setAllModules((prev) => [mod, ...prev]);
  }, [departmentId]);

  const updateModule = useCallback((id: string, updates: Partial<WorkModule>) => {
    setAllModules((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  }, []);

  const deleteModule = useCallback((id: string) => {
    setAllModules((prev) => prev.filter((m) => m.id !== id));
    setAllTasks((prev) => prev.filter((t) => t.moduleId !== id));
    setAllOperations((prev) => prev.filter((o) => o.moduleId !== id));
    if (selectedModuleId === id) { setSelectedModuleId(null); setCurrentView("modules"); }
  }, [selectedModuleId]);

  const createOperation = useCallback((moduleId: string, name: string, description: string) => {
    const op: WorkOperation = {
      id: generateOperationId(), moduleId, name, description,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setAllOperations((prev) => [...prev, op]);
    return op.id; // Return ID for immediate usage
  }, []);

  const updateOperation = useCallback((id: string, updates: Partial<WorkOperation>) => {
    setAllOperations((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  }, []);

  const deleteOperation = useCallback((id: string) => {
    setAllOperations((prev) => prev.filter((o) => o.id !== id));
    // When deleting an operation, unset operationId from its tasks or delete tasks? 
    // Unset seems safer, deleting could lose data. Let's unset.
    setAllTasks((prev) => prev.map((t) => t.operationId === id ? { ...t, operationId: undefined } : t));
  }, []);

  const createTask = useCallback(
    (moduleId: string, name: string, description: string, owner: string, riskLevel: RiskLevel, linkedSopIds: string[], operationId?: string) => {
      const task: WorkTask = {
        id: generateTaskId(), moduleId, name, description, owner, riskLevel,
        linkedSopIds, operationId,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setAllTasks((prev) => [task, ...prev]);
    }, []);

  const updateTask = useCallback((id: string, updates: Partial<WorkTask>) => {
    setAllTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setAllTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTaskId === id) { setSelectedTaskId(null); setCurrentView("tasks"); }
  }, [selectedTaskId]);

  const navigateToModules = useCallback(() => {
    setSelectedModuleId(null); setSelectedTaskId(null); setSelectedOperationId(null); setCurrentView("modules");
  }, []);

  const navigateToTasks = useCallback((moduleId: string) => {
    setSelectedModuleId(moduleId); setSelectedTaskId(null); setSelectedOperationId(null); setCurrentView("tasks");
  }, []);

  const navigateToOperation = useCallback((moduleId: string, operationId: string) => {
    setSelectedModuleId(moduleId); setSelectedOperationId(operationId); setSelectedTaskId(null); setCurrentView("tasks");
  }, []);

  const navigateToTaskDetail = useCallback((taskId: string) => {
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
      setSelectedModuleId(task.moduleId);
      setSelectedOperationId(task.operationId || null);
      setSelectedTaskId(taskId);
      setCurrentView("taskDetail");
    }
  }, [allTasks]);

  const getSelectedModule = useCallback(() => modules.find((m) => m.id === selectedModuleId), [modules, selectedModuleId]);
  const getSelectedTask = useCallback(() => tasks.find((t) => t.id === selectedTaskId), [tasks, selectedTaskId]);
  const getTaskControlStatus = useCallback((task: WorkTask): ControlStatus => task.linkedSopIds.length > 0 ? "SOP Mapped" : "SOP Unmapped", []);
  const getModuleTasks = useCallback((moduleId: string) => tasks.filter((t) => t.moduleId === moduleId), [tasks]);


  return (
    <WorkInventoryContext.Provider value={{
      modules, tasks, operations, currentView, selectedModuleId, selectedTaskId, selectedOperationId,
      setSelectedModuleId, setSelectedTaskId, setSelectedOperationId, setCurrentView,
      createModule, updateModule, deleteModule,
      createTask, updateTask, deleteTask,
      createOperation, updateOperation, deleteOperation,
      navigateToModules, navigateToTasks, navigateToOperation, navigateToTaskDetail,
      getSelectedModule, getSelectedTask, getTaskControlStatus, getModuleTasks,
      allModules, allTasks, allOperations
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
