import React, { createContext, useContext, useState, useCallback } from "react";
import { SOPRecord, SOPStep, SOPStatus, SOPFormat, SOPVersion, AppView, BusinessProcess } from "@/types/sop";

const generateId = () => `SOP-${String(Math.floor(Math.random() * 900) + 100).padStart(3, "0")}`;
const generateBPId = () => `BP-${String(Math.floor(Math.random() * 900) + 100).padStart(3, "0")}`;
const generateStepId = () => crypto.randomUUID();

const INITIAL_BUSINESS_PROCESSES: BusinessProcess[] = [
  { id: "BP-001", name: "Facility Management", description: "Cleaning, maintenance and facility operations", createdAt: "2025-06-01" },
  { id: "BP-002", name: "IT & Data Operations", description: "Data backup, recovery and IT infrastructure", createdAt: "2025-06-01" },
  { id: "BP-003", name: "Safety & Compliance", description: "Incident response, chemical handling and regulatory compliance", createdAt: "2025-06-01" },
  { id: "BP-004", name: "Human Resources", description: "Employee onboarding, training and HR procedures", createdAt: "2025-06-01" },
];

const INITIAL_SOPS: SOPRecord[] = [
  {
    id: "SOP-001", title: "Facility Cleaning Protocol", format: "block", owner: "Sarah Chen",
    lastEditedBy: "Sarah Chen", approvedBy: "James Rodriguez", currentVersion: "v2.1",
    status: "Effective", effectiveDate: "2026-01-15", createdAt: "2025-08-10", businessProcessId: "BP-001",
    steps: [
      { id: "s1", instruction: "Prepare cleaning solution according to MSDS guidelines.", requirePhoto: false, requireEvidenceFile: false, requireMeasurement: true },
      { id: "s2", instruction: "Begin with high-touch surfaces: door handles, light switches, railings.", requirePhoto: true, requireEvidenceFile: false, requireMeasurement: false },
      { id: "s3", instruction: "Mop floors using approved disinfectant. Allow 10-minute dwell time.", requirePhoto: false, requireEvidenceFile: true, requireMeasurement: true },
      { id: "s4", instruction: "Document completion and any anomalies in the facility log.", requirePhoto: true, requireEvidenceFile: false, requireMeasurement: false },
    ],
    versions: [
      { version: "v1.0", createdAt: "2025-08-10", createdBy: "Sarah Chen", status: "Effective", steps: [] },
      { version: "v2.0", createdAt: "2025-12-01", createdBy: "Sarah Chen", status: "Effective", steps: [] },
      { version: "v2.1", createdAt: "2026-01-15", createdBy: "Sarah Chen", status: "Effective", steps: [] },
    ],
  },
  {
    id: "SOP-002", title: "Equipment Calibration Procedure", format: "file", owner: "Mike Torres",
    lastEditedBy: "Mike Torres", approvedBy: "Sarah Chen", currentVersion: "v1.3",
    status: "Effective", effectiveDate: "2025-11-01", createdAt: "2025-06-15", businessProcessId: "BP-001",
    steps: [], fileName: "calibration-procedure-v1.3.pdf",
    versions: [
      { version: "v1.0", createdAt: "2025-06-15", createdBy: "Mike Torres", status: "Effective", steps: [] },
      { version: "v1.3", createdAt: "2025-11-01", createdBy: "Mike Torres", status: "Effective", steps: [] },
    ],
  },
  {
    id: "SOP-003", title: "Incident Response Plan", format: "block", owner: "Emily Park",
    lastEditedBy: "Emily Park", approvedBy: null, currentVersion: "v1.0",
    status: "In Review", effectiveDate: null, createdAt: "2026-02-01", businessProcessId: "BP-003",
    steps: [
      { id: "s1", instruction: "Identify and classify the incident severity (Critical, Major, Minor).", requirePhoto: false, requireEvidenceFile: false, requireMeasurement: false },
      { id: "s2", instruction: "Notify the incident commander and assemble the response team.", requirePhoto: false, requireEvidenceFile: false, requireMeasurement: false },
      { id: "s3", instruction: "Contain the incident and document initial findings with photos.", requirePhoto: true, requireEvidenceFile: true, requireMeasurement: false },
    ],
    versions: [{ version: "v1.0", createdAt: "2026-02-01", createdBy: "Emily Park", status: "In Review", steps: [] }],
  },
  {
    id: "SOP-004", title: "Chemical Waste Disposal", format: "block", owner: "James Rodriguez",
    lastEditedBy: "James Rodriguez", approvedBy: null, currentVersion: "v0.3",
    status: "Draft", effectiveDate: null, createdAt: "2026-02-10", businessProcessId: "BP-003",
    steps: [
      { id: "s1", instruction: "Categorize waste type per EPA classification.", requirePhoto: false, requireEvidenceFile: true, requireMeasurement: true },
      { id: "s2", instruction: "Use appropriate PPE and containment vessels.", requirePhoto: true, requireEvidenceFile: false, requireMeasurement: false },
    ],
    versions: [
      { version: "v0.1", createdAt: "2026-02-10", createdBy: "James Rodriguez", status: "Draft", steps: [] },
      { version: "v0.3", createdAt: "2026-02-18", createdBy: "James Rodriguez", status: "Draft", steps: [] },
    ],
  },
  {
    id: "SOP-005", title: "Employee Onboarding Checklist", format: "file", owner: "Lisa Wang",
    lastEditedBy: "Lisa Wang", approvedBy: null, currentVersion: "v1.0",
    status: "Approved", effectiveDate: null, createdAt: "2026-01-20", businessProcessId: "BP-004",
    steps: [], fileName: "onboarding-checklist-v1.pdf",
    versions: [{ version: "v1.0", createdAt: "2026-01-20", createdBy: "Lisa Wang", status: "Approved", steps: [] }],
  },
  {
    id: "SOP-006", title: "Data Backup & Recovery", format: "block", owner: "David Kim",
    lastEditedBy: "Sarah Chen", approvedBy: "James Rodriguez", currentVersion: "v3.0",
    status: "Effective", effectiveDate: "2026-02-01", createdAt: "2025-03-10", businessProcessId: "BP-002",
    steps: [
      { id: "s1", instruction: "Verify all critical databases are included in the backup scope.", requirePhoto: false, requireEvidenceFile: false, requireMeasurement: false },
      { id: "s2", instruction: "Run incremental backup and verify checksums.", requirePhoto: false, requireEvidenceFile: true, requireMeasurement: true },
      { id: "s3", instruction: "Test recovery on staging environment. Record RTO/RPO metrics.", requirePhoto: true, requireEvidenceFile: true, requireMeasurement: true },
    ],
    versions: [
      { version: "v1.0", createdAt: "2025-03-10", createdBy: "David Kim", status: "Effective", steps: [] },
      { version: "v2.0", createdAt: "2025-09-01", createdBy: "David Kim", status: "Effective", steps: [] },
      { version: "v3.0", createdAt: "2026-02-01", createdBy: "Sarah Chen", status: "Effective", steps: [] },
    ],
  },
];

interface SOPContextType {
  sops: SOPRecord[];
  businessProcesses: BusinessProcess[];
  currentView: AppView;
  selectedSopId: string | null;
  selectedProcessId: string | null;
  setCurrentView: (view: AppView) => void;
  selectSop: (id: string | null) => void;
  createSop: (title: string, format: SOPFormat, owner: string, steps?: SOPStep[]) => string;
  updateSop: (id: string, updates: Partial<SOPRecord>) => void;
  deleteSop: (id: string) => void;
  transitionStatus: (id: string, newStatus: SOPStatus) => void;
  createNewVersion: (id: string) => void;
  addStep: (sopId: string) => void;
  updateStep: (sopId: string, stepId: string, updates: Partial<SOPStep>) => void;
  removeStep: (sopId: string, stepId: string) => void;
  reorderSteps: (sopId: string, steps: SOPStep[]) => void;
  getSelectedSop: () => SOPRecord | undefined;
  getSelectedProcess: () => BusinessProcess | undefined;
  navigateToCreate: () => void;
  navigateToEdit: (id: string) => void;
  navigateToView: (id: string) => void;
  navigateToList: () => void;
  navigateToProcesses: () => void;
  navigateToProcessSops: (processId: string) => void;
  createBusinessProcess: (name: string, description: string) => void;
  updateBusinessProcess: (id: string, updates: Partial<BusinessProcess>) => void;
  deleteBusinessProcess: (id: string) => void;
}

const SOPContext = createContext<SOPContextType | undefined>(undefined);

export function SOPProvider({ children }: { children: React.ReactNode }) {
  const [sops, setSops] = useState<SOPRecord[]>(INITIAL_SOPS);
  const [businessProcesses, setBusinessProcesses] = useState<BusinessProcess[]>(INITIAL_BUSINESS_PROCESSES);
  const [currentView, setCurrentView] = useState<AppView>("processes");
  const [selectedSopId, setSelectedSopId] = useState<string | null>(null);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);

  const selectSop = useCallback((id: string | null) => setSelectedSopId(id), []);

  const getSelectedSop = useCallback(() => sops.find((s) => s.id === selectedSopId), [sops, selectedSopId]);
  const getSelectedProcess = useCallback(() => businessProcesses.find((b) => b.id === selectedProcessId), [businessProcesses, selectedProcessId]);

  const createSop = useCallback((title: string, format: SOPFormat, owner: string, steps?: SOPStep[]) => {
    const id = generateId();
    const now = new Date().toISOString().split("T")[0];
    const defaultSteps = format === "block"
      ? [{ id: generateStepId(), instruction: "", requirePhoto: false, requireEvidenceFile: false, requireMeasurement: false }]
      : [];
    const newSop: SOPRecord = {
      id, title, format, owner, lastEditedBy: owner, approvedBy: null,
      currentVersion: "v0.1", status: "Draft", effectiveDate: null, createdAt: now,
      steps: steps && steps.length > 0 ? steps : defaultSteps,
      versions: [{ version: "v0.1", createdAt: now, createdBy: owner, status: "Draft", steps: [] }],
      businessProcessId: selectedProcessId || undefined,
    };
    setSops((prev) => [newSop, ...prev]);
    return id;
  }, [selectedProcessId]);

  const updateSop = useCallback((id: string, updates: Partial<SOPRecord>) => {
    setSops((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const deleteSop = useCallback((id: string) => {
    setSops((prev) => prev.filter((s) => s.id !== id));
    if (selectedSopId === id) { setSelectedSopId(null); setCurrentView("list"); }
  }, [selectedSopId]);

  const transitionStatus = useCallback((id: string, newStatus: SOPStatus) => {
    setSops((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      return {
        ...s, status: newStatus,
        effectiveDate: newStatus === "Effective" ? new Date().toISOString().split("T")[0] : s.effectiveDate,
        approvedBy: newStatus === "Approved" || newStatus === "Effective" ? "System Admin" : s.approvedBy,
      };
    }));
  }, []);

  const createNewVersion = useCallback((id: string) => {
    setSops((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      const parts = s.currentVersion.replace("v", "").split(".");
      const newVersion = `v${parseInt(parts[0]) + 1}.0`;
      return {
        ...s, currentVersion: newVersion, status: "Draft" as SOPStatus, approvedBy: null,
        versions: [...s.versions, { version: newVersion, createdAt: new Date().toISOString().split("T")[0], createdBy: s.owner, status: "Draft", steps: [...s.steps] }],
      };
    }));
  }, []);

  const addStep = useCallback((sopId: string) => {
    setSops((prev) => prev.map((s) =>
      s.id === sopId ? { ...s, steps: [...s.steps, { id: generateStepId(), instruction: "", requirePhoto: false, requireEvidenceFile: false, requireMeasurement: false }] } : s
    ));
  }, []);

  const updateStep = useCallback((sopId: string, stepId: string, updates: Partial<SOPStep>) => {
    setSops((prev) => prev.map((s) =>
      s.id === sopId ? { ...s, steps: s.steps.map((step) => (step.id === stepId ? { ...step, ...updates } : step)) } : s
    ));
  }, []);

  const removeStep = useCallback((sopId: string, stepId: string) => {
    setSops((prev) => prev.map((s) => s.id === sopId ? { ...s, steps: s.steps.filter((step) => step.id !== stepId) } : s));
  }, []);

  const reorderSteps = useCallback((sopId: string, steps: SOPStep[]) => {
    setSops((prev) => prev.map((s) => (s.id === sopId ? { ...s, steps } : s)));
  }, []);

  // Business Process CRUD
  const createBusinessProcess = useCallback((name: string, description: string) => {
    const bp: BusinessProcess = { id: generateBPId(), name, description, createdAt: new Date().toISOString().split("T")[0] };
    setBusinessProcesses((prev) => [...prev, bp]);
  }, []);

  const updateBusinessProcess = useCallback((id: string, updates: Partial<BusinessProcess>) => {
    setBusinessProcesses((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  }, []);

  const deleteBusinessProcess = useCallback((id: string) => {
    setBusinessProcesses((prev) => prev.filter((b) => b.id !== id));
    // Unlink SOPs
    setSops((prev) => prev.map((s) => s.businessProcessId === id ? { ...s, businessProcessId: undefined } : s));
  }, []);

  // Navigation
  const navigateToCreate = useCallback(() => { setSelectedSopId(null); setCurrentView("create"); }, []);
  const navigateToEdit = useCallback((id: string) => { setSelectedSopId(id); setCurrentView("edit"); }, []);
  const navigateToView = useCallback((id: string) => { setSelectedSopId(id); setCurrentView("view"); }, []);
  const navigateToList = useCallback(() => { setSelectedSopId(null); setCurrentView("list"); }, []);
  const navigateToProcesses = useCallback(() => { setSelectedSopId(null); setSelectedProcessId(null); setCurrentView("processes"); }, []);
  const navigateToProcessSops = useCallback((processId: string) => { setSelectedProcessId(processId); setCurrentView("list"); }, []);

  return (
    <SOPContext.Provider value={{
      sops, businessProcesses, currentView, selectedSopId, selectedProcessId,
      setCurrentView, selectSop, createSop, updateSop, deleteSop, transitionStatus,
      createNewVersion, addStep, updateStep, removeStep, reorderSteps,
      getSelectedSop, getSelectedProcess,
      navigateToCreate, navigateToEdit, navigateToView, navigateToList,
      navigateToProcesses, navigateToProcessSops,
      createBusinessProcess, updateBusinessProcess, deleteBusinessProcess,
    }}>
      {children}
    </SOPContext.Provider>
  );
}

export function useSOP() {
  const context = useContext(SOPContext);
  if (!context) throw new Error("useSOP must be used within SOPProvider");
  return context;
}
