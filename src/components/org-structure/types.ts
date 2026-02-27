export interface RACI {
  R: string;
  A: string;
  C: string;
  I: string;
}

export interface Role {
  id: number;
  title: string;
  dept: string;
  icon: string;
  person: string;
  parent: number | null;
  sops: number;
  notes: string;
  multi: boolean;
  raci: RACI;
}

export type Department = 'Operations' | 'Quality' | 'Manufacturing' | 'Regulatory' | 'Engineering' | 'HSE';

export const DEPARTMENTS: Department[] = [
  'Operations',
  'Quality',
  'Manufacturing',
  'Regulatory',
  'Engineering',
  'HSE',
];

export const ICONS = [
  { value: '🏭', label: 'Plant' },
  { value: '🔬', label: 'Lab/QC' },
  { value: '⚙️', label: 'Engineering' },
  { value: '📋', label: 'Operations' },
  { value: '🛡️', label: 'Regulatory' },
  { value: '🧪', label: 'Manufacturing' },
  { value: '👤', label: 'General' },
  { value: '🏗️', label: 'Management' },
];
