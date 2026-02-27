import React, { useState, useEffect } from 'react';
import { EzButton } from "@clarium/ezui-react-components";
import { X } from "lucide-react";
import { Role, DEPARTMENTS, ICONS } from './types';
import styles from '../../styles/OrgStructure.module.css';

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Role>) => void;
    editingRole: Role | null;
    roles: Role[];
}

export const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, onSave, editingRole, roles }) => {
    const [formData, setFormData] = useState<Partial<Role>>({
        title: '',
        dept: '',
        icon: '👤',
        parent: null,
        sops: 0,
        notes: '',
    });

    useEffect(() => {
        if (editingRole) {
            setFormData(editingRole);
        } else {
            setFormData({
                title: '',
                dept: '',
                icon: '👤',
                parent: null,
                sops: 0,
                notes: '',
            });
        }
    }, [editingRole, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!formData.title || !formData.dept) {
            alert('Title and Department are required');
            return;
        }
        onSave(formData);
    };

    return (
        <div className={`${styles.modalOverlay} ${isOpen ? styles.open : ''}`} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.modalTitle}>{editingRole ? 'Edit Role' : 'Add New Role'}</div>
                    <button className={styles.modalClose} onClick={onClose}><X className="h-4 w-4" /></button>
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Role Title *</label>
                            <input
                                className={styles.formInput}
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. QA Manager"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Department *</label>
                            <select
                                className={styles.formSelect}
                                value={formData.dept}
                                onChange={e => setFormData({ ...formData, dept: e.target.value })}
                            >
                                <option value="">Select…</option>
                                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Reports To</label>
                            <select
                                className={styles.formSelect}
                                value={formData.parent || ''}
                                onChange={e => setFormData({ ...formData, parent: e.target.value ? parseInt(e.target.value) : null })}
                            >
                                <option value="">— Top Level —</option>
                                {roles.filter(r => r.id !== editingRole?.id).map(r => (
                                    <option key={r.id} value={r.id}>{r.icon} {r.title} ({r.dept})</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Icon</label>
                            <select
                                className={styles.formSelect}
                                value={formData.icon}
                                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                            >
                                {ICONS.map(i => <option key={i.value} value={i.value}>{i.value} {i.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Number of SOPs Owned</label>
                        <input
                            className={styles.formInput}
                            type="number"
                            value={formData.sops}
                            onChange={e => setFormData({ ...formData, sops: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                            min="0"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Permissions / Notes</label>
                        <input
                            className={styles.formInput}
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="e.g. Can approve SOPs, manage KPIs"
                        />
                    </div>
                </div>
                <div className={styles.modalFooter}>
                    <EzButton variant="ghost" onClick={onClose}>Cancel</EzButton>
                    <EzButton variant="primary" onClick={handleSubmit}>Save Role</EzButton>
                </div>
            </div>
        </div>
    );
};
