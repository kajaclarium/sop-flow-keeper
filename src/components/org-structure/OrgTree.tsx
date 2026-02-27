import React, { useCallback } from 'react';
import { Role } from './types';
import styles from '../../styles/OrgStructure.module.css';
import { Pencil, Trash2 } from 'lucide-react';

interface OrgTreeProps {
    roles: Role[];
    selectedRoleId: number | null;
    onSelectRole: (id: number) => void;
    onEditRole: (id: number) => void;
    onDeleteRole: (id: number) => void;
    onReparent: (draggedId: number, targetId: number) => void;
}

export const OrgTree: React.FC<OrgTreeProps> = ({
    roles,
    selectedRoleId,
    onSelectRole,
    onEditRole,
    onDeleteRole,
    onReparent
}) => {
    const roots = roles.filter(r => r.parent === null);

    const isDescendant = (potentialAncestorId: number, childId: number) => {
        let current = roles.find(r => r.id === potentialAncestorId);
        while (current && current.parent !== null) {
            if (current.parent === childId) return true;
            current = roles.find(r => r.id === current?.parent);
        }
        return false;
    };

    const renderNode = (role: Role, isRoot: boolean = false) => {
        const children = roles.filter(r => r.parent === role.id);

        return (
            <div
                key={role.id}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
                {!isRoot && (
                    <div style={{ width: '2px', height: '20px', background: '#e2e8f0', margin: '0 auto' }} />
                )}

                <div
                    className={`${styles.orgNode} ${selectedRoleId === role.id ? styles.selected : ''}`}
                    draggable
                    onDragStart={(e) => {
                        e.dataTransfer.setData('roleId', role.id.toString());
                        e.currentTarget.classList.add(styles.dragging);
                    }}
                    onDragEnd={(e) => {
                        e.currentTarget.classList.remove(styles.dragging);
                        document.querySelectorAll(`.${styles.orgNode}`).forEach(n => n.classList.remove(styles.dragOver));
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        const draggedId = parseInt(e.dataTransfer.types.includes('roleId') ? '' : ''); // simplified for logic
                        // In a real app we'd track dragId in state as well
                        e.currentTarget.classList.add(styles.dragOver);
                    }}
                    onDragLeave={(e) => {
                        e.currentTarget.classList.remove(styles.dragOver);
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove(styles.dragOver);
                        const draggedId = parseInt(e.dataTransfer.getData('roleId'));
                        if (draggedId && draggedId !== role.id && !isDescendant(role.id, draggedId)) {
                            onReparent(draggedId, role.id);
                        }
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelectRole(role.id);
                    }}
                >
                    <div className={styles.nodeActions}>
                        <div
                            className={styles.nodeBtn}
                            onClick={(e) => { e.stopPropagation(); onEditRole(role.id); }}
                            title="Edit"
                        >
                            <Pencil className="h-2.5 w-2.5" />
                        </div>
                        <div
                            className={`${styles.nodeBtn} ${styles.nodeBtnDel}`}
                            onClick={(e) => { e.stopPropagation(); onDeleteRole(role.id); }}
                            title="Delete"
                        >
                            <Trash2 className="h-2.5 w-2.5" />
                        </div>
                    </div>
                    <div className={styles.nodeIcon}>{role.icon}</div>
                    <div className={styles.nodeTitle}>{role.title}</div>
                    <div className={styles.nodeDept}>{role.dept}</div>
                    <div className={styles.nodeBadges}>
                        {role.multi && <span className={`${styles.nbadge} ${styles.nbadgeMulti}`}>Multi-Hat</span>}
                    </div>
                </div>

                {children.length > 0 && (
                    <div style={{ display: 'flex', gap: '1.2rem', paddingTop: '20px', position: 'relative' }}>
                        {children.length > 1 && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: '10%', // Simple horizontal line
                                    right: '10%',
                                    height: '2px',
                                    background: '#e2e8f0'
                                }}
                            />
                        )}
                        {children.map(c => renderNode(c))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 'max-content', paddingBottom: '2rem' }}>
            {roots.map(r => renderNode(r, true))}
        </div>
    );
};
