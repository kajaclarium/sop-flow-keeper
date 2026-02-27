import React from 'react';
import { EzButton } from "@clarium/ezui-react-components";
import { X, Pencil, Trash2 } from "lucide-react";
import { Role } from './types';
import styles from '../../styles/OrgStructure.module.css';

interface RoleDetailProps {
    role: Role | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onOpenRaci: (id: number) => void;
    allRoles: Role[];
}

export const RoleDetail: React.FC<RoleDetailProps> = ({
    role,
    isOpen,
    onClose,
    onEdit,
    onDelete,
    onOpenRaci,
    allRoles
}) => {
    if (!role) return null;

    const children = allRoles.filter(r => r.parent === role.id);
    const parent = role.parent ? allRoles.find(r => r.id === role.parent) : null;

    return (
        <div className={`${styles.detailPanel} ${isOpen ? styles.open : ''}`}>
            <div className={styles.detailHeader}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>
                    Role Detail
                </div>
                <button className={styles.modalClose} onClick={onClose}><X className="h-4 w-4" /></button>
            </div>
            <div className={styles.detailBody}>
                <div className={styles.detailSection}>
                    <div className={styles.detailSectionTitle}>Role Info</div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>Icon</span>
                        <span className={styles.detailVal}>{role.icon}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>Department</span>
                        <span className={styles.detailVal}>{role.dept}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>Reports To</span>
                        <span className={styles.detailVal}>{parent ? parent.title : 'Top Level'}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>SOPs Owned</span>
                        <span className={styles.detailVal} style={{ color: 'var(--accent)', fontWeight: 700 }}>{role.sops}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>Notes</span>
                        <span className={styles.detailVal} style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{role.notes || '—'}</span>
                    </div>
                </div>

                <div className={styles.detailSection}>
                    <div className={styles.detailSectionTitle}>Direct Reports ({children.length})</div>
                    {children.length ? children.map(c => (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', padding: '0.4rem', borderRadius: '6px', background: 'var(--surface2)' }}>
                            <span>{c.icon}</span>
                            <div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 500 }}>{c.title}</div>
                            </div>
                        </div>
                    )) : (
                        <div style={{ fontSize: '0.68rem', color: 'var(--muted2)' }}>No direct reports</div>
                    )}
                </div>

                <div className={styles.detailSection}>
                    <div className={styles.detailSectionTitle}>RACI Assignment</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.6rem' }}>
                        <div style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', background: '#d1fae5' }}>
                            <div style={{ fontSize: '0.52rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', marginBottom: '0.15rem' }}>R — Responsible</div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 500, color: '#064e3b' }}>{role.raci?.R || <span style={{ color: 'var(--muted2)' }}>Unset</span>}</div>
                        </div>
                        <div style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', background: '#fef3c7' }}>
                            <div style={{ fontSize: '0.52rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', marginBottom: '0.15rem' }}>A — Accountable</div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 500, color: '#78350f' }}>{role.raci?.A || <span style={{ color: 'var(--muted2)' }}>Unset</span>}</div>
                        </div>
                        <div style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', background: '#dbeafe' }}>
                            <div style={{ fontSize: '0.52rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', marginBottom: '0.15rem' }}>C — Consulted</div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 500, color: '#1e3a8a' }}>{role.raci?.C || <span style={{ color: 'var(--muted2)' }}>Unset</span>}</div>
                        </div>
                        <div style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', background: '#f1f5f9' }}>
                            <div style={{ fontSize: '0.52rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.15rem' }}>I — Informed</div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 500, color: '#334155' }}>{role.raci?.I || <span style={{ color: 'var(--muted2)' }}>Unset</span>}</div>
                        </div>
                    </div>
                    <EzButton variant="ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '0.68rem' }} onClick={() => onOpenRaci(role.id)}>
                        <Pencil className="h-3 w-3 mr-2" /> Edit RACI
                    </EzButton>
                </div>

                <div className={styles.detailSection}>
                    <div className={styles.detailSectionTitle}>Quick Actions</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <EzButton variant="ghost" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => onEdit(role.id)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Role
                        </EzButton>
                        <EzButton variant="ghost" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--red)' }} onClick={() => onDelete(role.id)}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Role
                        </EzButton>
                    </div>
                </div>
            </div>
        </div>
    );
};
