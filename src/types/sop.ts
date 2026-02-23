export type SOPStatus = "Draft" | "In Review" | "Approved" | "Effective";
export type SOPFormat = "block" | "file";

export interface SOPStep {
  id: string;
  instruction: string;
  requirePhoto: boolean;
  requireMeasurement: boolean;
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
}

export type AppView = "list" | "create" | "edit" | "view";
