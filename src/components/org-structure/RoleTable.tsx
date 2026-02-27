import React from 'react';
import { Role } from './types';
import styles from '../../styles/OrgStructure.module.css';

interface RoleTableProps {
    roles: Role[];
    selectedRoleId: number | null;
    onSelectRole: (id: number) => void;
    onEditRole: (id: number) => void;
    onDeleteRole: (id: number) => void;
    onOpenRaci: (id: number) => void;
    allRoles: Role[];
}

export const RoleTable: React.FC<RoleTableProps> = ({
    roles,
    selectedRoleId,
    onSelectRole,
    onEditRole,
    onDeleteRole,
    onOpenRaci,
    allRoles
}) => {
    return (
        <table className={styles.rolesTable}>
            <thead>
                <tr>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Reports To</th>
                    <th>RACI</th>
                    <th>SOPs</th>
                    <th>Status</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {roles.map(r => {
                    const parentRole = r.parent ? allRoles.find(pr => pr.id === r.parent) : null;
                    return (
                        <tr
                            key={r.id}
                            className={selectedRoleId === r.id ? styles.selected : ''}
                            onClick={() => onSelectRole(r.id)}
                        >
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1rem' }}>{r.icon}</span>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{r.title}</div>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--muted2)' }}>{r.notes || ''}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                    {r.dept}
                                </span>
                            </td>
                            <td style={{ color: 'var(--muted)', fontSize: '0.68rem' }}>
                                {parentRole ? parentRole.title : '—'}
                            </td>
                            <td>
                                <div className={styles.raciMini}>
                                    <span className={`${styles.rp} ${styles.rpR}`} title={`R: ${r.raci?.R || 'Unset'}`}>R</span>
                                    <span className={`${styles.rp} ${styles.rpA}`} title={`A: ${r.raci?.A || 'Unset'}`}>A</span>
                                    <span className={`${styles.rp} ${styles.rpC}`} title={`C: ${r.raci?.C || 'Unset'}`}>C</span>
                                    <span className={`${styles.rp} ${styles.rpI}`} title={`I: ${r.raci?.I || 'Unset'}`}>I</span>
                                </div>
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--accent)' }}>{r.sops}</td>
                            <td>
                                <span className={`${styles.nbadge} ${styles.nbadgeActive}`}>Active</span>
                            </td>
                            <td>
                                <div className={styles.tblActions}>
                                    <button
                                        className={styles.tblBtn}
                                        onClick={(e) => { e.stopPropagation(); onEditRole(r.id); }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className={styles.tblBtn}
                                        onClick={(e) => { e.stopPropagation(); onOpenRaci(r.id); }}
                                    >
                                        RACI
                                    </button>
                                    <button
                                        className={`${styles.tblBtn} ${styles.tblBtnDel}`}
                                        onClick={(e) => { e.stopPropagation(); onDeleteRole(r.id); }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};
