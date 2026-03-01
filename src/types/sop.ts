import { TaskIO } from "./common";

export type SOPStatus = "Draft" | "In Review" | "Approved" | "Effective";
export type SOPFormat = "block" | "file";

export interface SOPStep {
  id: string;
  instruction: string;
  requirePhoto: boolean;
  requireEvidenceFile: boolean;
  requireMeasurement: boolean;
  inputs: TaskIO[];
  outputs: TaskIO[];
}

export interface SOPVersion {
  version: string;
  createdAt: string;
  createdBy: string;
  status: SOPStatus;
  steps: SOPStep[];
  fileUrl?: string;
  fileName?: string;
  aiAnalysis?: string;
}

export interface SOPRecord {
  id: string;
  title: string;
  format: SOPFormat;
  owner: string;
  lastEditedBy: string;
  approvedBy: string | null;
  currentVersion: string;
  status: SOPStatus;
  effectiveDate: string | null;
  createdAt: string;
  steps: SOPStep[];
  fileUrl?: string;
  fileName?: string;
  aiAnalysis?: string;
  versions: SOPVersion[];
  businessProcessId?: string;
}

export interface BusinessProcess {
  id: string;
  departmentId: string;
  name: string;
  description: string;
  createdAt: string;
}

export type AppView = "processes" | "list" | "create" | "edit" | "view";
