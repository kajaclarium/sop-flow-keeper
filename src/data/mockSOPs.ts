export interface SOPRecord {
  id: string;
  title: string;
  format: "block" | "file";
  owner: string;
  lastEditedBy: string;
  approvedBy: string | null;
  version: string;
  status: "Draft" | "In Review" | "Effective";
  effectiveDate: string | null;
}

export const mockSOPs: SOPRecord[] = [
  {
    id: "SOP-001",
    title: "Facility Cleaning Protocol",
    format: "block",
    owner: "Sarah Chen",
    lastEditedBy: "Sarah Chen",
    approvedBy: "James Rodriguez",
    version: "v2.1",
    status: "Effective",
    effectiveDate: "2026-01-15",
  },
  {
    id: "SOP-002",
    title: "Equipment Calibration Procedure",
    format: "file",
    owner: "Mike Torres",
    lastEditedBy: "Mike Torres",
    approvedBy: "Sarah Chen",
    version: "v1.3",
    status: "Effective",
    effectiveDate: "2025-11-01",
  },
  {
    id: "SOP-003",
    title: "Incident Response Plan",
    format: "block",
    owner: "Emily Park",
    lastEditedBy: "Emily Park",
    approvedBy: null,
    version: "v1.0",
    status: "In Review",
    effectiveDate: null,
  },
  {
    id: "SOP-004",
    title: "Chemical Waste Disposal",
    format: "block",
    owner: "James Rodriguez",
    lastEditedBy: "James Rodriguez",
    approvedBy: null,
    version: "v0.3",
    status: "Draft",
    effectiveDate: null,
  },
  {
    id: "SOP-005",
    title: "Employee Onboarding Checklist",
    format: "file",
    owner: "Lisa Wang",
    lastEditedBy: "Lisa Wang",
    approvedBy: null,
    version: "v1.0",
    status: "In Review",
    effectiveDate: null,
  },
  {
    id: "SOP-006",
    title: "Data Backup & Recovery",
    format: "block",
    owner: "David Kim",
    lastEditedBy: "Sarah Chen",
    approvedBy: "James Rodriguez",
    version: "v3.0",
    status: "Effective",
    effectiveDate: "2026-02-01",
  },
  {
    id: "SOP-007",
    title: "Visitor Access Control",
    format: "file",
    owner: "Sarah Chen",
    lastEditedBy: "Emily Park",
    approvedBy: null,
    version: "v0.1",
    status: "Draft",
    effectiveDate: null,
  },
  {
    id: "SOP-008",
    title: "Quality Inspection Standards",
    format: "block",
    owner: "Mike Torres",
    lastEditedBy: "Mike Torres",
    approvedBy: "James Rodriguez",
    version: "v1.2",
    status: "Effective",
    effectiveDate: "2026-01-20",
  },
];
