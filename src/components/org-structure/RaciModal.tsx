import React from 'react';
import { EzButton } from "@clarium/ezui-react-components";
import { X } from "lucide-react";
import { Role, RACI } from './types';
import styles from '../../styles/OrgStructure.module.css';

interface RaciModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: Role | null;
    allRoles: Role[];
    onRaciChange: (roleId: number, key: keyof RACI, value: string) => void;
}

export const RaciModal: React.FC<RaciModalProps> = ({ isOpen, onClose, role, allRoles, onRaciChange }) => {
    if (!isOpen || !role) return null;

    const defs = [
        { key: 'R', label: 'R — Responsible', meaning: 'Executes the work · does the task', cls: styles.rpR },
        { key: 'A', label: 'A — Accountable', meaning: 'Owns the outcome · signs off · answerable', cls: styles.rpA },
        { key: 'C', label: 'C — Consulted', meaning: 'Provides input before decision · two-way communication', cls: styles.rpC },
        { key: 'I', label: 'I — Informed', meaning: 'Notified after decision · one-way communication', cls: styles.rpI },
    ];

    const roleOptions = ['— None —', ...allRoles.map(x => x.title)];

    return (
        <div className={`${styles.modalOverlay} ${isOpen ? styles.open : ''}`} onClick={onClose}>
            <div className={styles.modal} style={{ width: '560px' }} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div>
                        <div className={styles.modalTitle}>RACI — {role.icon} {role.title}</div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                            Select the role responsible for each RACI position
                        </div>
                    </div>
                    <button className={styles.modalClose} onClick={onClose}><X className="h-4 w-4" /></button>
                </div>
                <div className={styles.modalBody} style={{ padding: 0 }}>
                    <div style={{ padding: '0.8rem 1.2rem', background: 'var(--surface2)', borderBottom: '1px solid var(--border)', fontSize: '0.68rem', color: 'var(--muted)' }}>
                        Defining how <strong>{role.title}</strong> ({role.dept}) participates across processes and decisions.
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', padding: '0.6rem 1rem', background: 'var(--surface2)', borderBottom: '1px solid var(--border)', textAlign: 'left', fontWeight: 600, width: '160px' }}>
                                    RACI Role
                                </th>
                                <th style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', padding: '0.6rem 1rem', background: 'var(--surface2)', borderBottom: '1px solid var(--border)', textAlign: 'left', fontWeight: 600 }}>
                                    Assigned To
                                </th>
                                <th style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', padding: '0.6rem 1rem', background: 'var(--surface2)', borderBottom: '1px solid var(--border)', textAlign: 'left', fontWeight: 600 }}>
                                    Meaning
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {defs.map(def => {
                                const key = def.key as keyof RACI;
                                const current = role.raci?.[key] || '— None —';
                                return (
                                    <tr key={key} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.75rem 1rem', verticalAlign: 'middle' }}>
                                            <span className={`${styles.rp} ${def.cls}`} style={{ fontSize: '0.68rem', padding: '0.25rem 0.7rem', whiteSpace: 'nowrap' }}>
                                                {def.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', verticalAlign: 'middle' }}>
                                            <select
                                                className={styles.formSelect}
                                                style={{ fontSize: '0.72rem', padding: '0.35rem 0.6rem' }}
                                                value={current || '— None —'}
                                                onChange={(e) => onRaciChange(role.id, key, e.target.value === '— None —' ? '' : e.target.value)}
                                            >
                                                {roleOptions.map(opt => <option key={opt}>{opt}</option>)}
                                            </select>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', verticalAlign: 'middle', fontSize: '0.65rem', color: 'var(--muted)' }}>
                                            {def.meaning}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div style={{ margin: '1rem 1.2rem', padding: '0.7rem 0.9rem', background: '#fffbeb', borderLeft: '3px solid var(--amber)', borderRadius: '0 6px 6px 0', fontSize: '0.67rem', color: '#92400e' }}>
                        <strong>Note:</strong> Changes are saved immediately. Detailed process-level RACI is managed in the Ownership module per SOP.
                    </div>
                </div>
                <div className={styles.modalFooter}>
                    <EzButton variant="ghost" onClick={onClose}>Close</EzButton>
                </div>
            </div>
        </div>
    );
};
