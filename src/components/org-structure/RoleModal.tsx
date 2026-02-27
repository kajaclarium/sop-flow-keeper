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
            <style>{`
        .${styles.modalOverlay} {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 1000;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(3px);
        }
        .${styles.modalOverlay}.${styles.open} {
          display: flex;
        }
        .${styles.modal} {
          background: var(--surface);
          border-radius: 14px;
          width: 480px;
          max-width: 95vw;
          box-shadow: var(--shadow-md);
          overflow: hidden;
          animation: modalIn 0.2s ease;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px) }
          to { opacity: 1; transform: scale(1) translateY(0) }
        }
        .${styles.modalHeader} {
          padding: 1.2rem 1.4rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .${styles.modalTitle} {
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 700;
        }
        .${styles.modalClose} {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--surface2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          color: var(--muted);
        }
        .${styles.modalClose}:hover {
          background: var(--red);
          color: #fff;
          border-color: var(--red);
        }
        .${styles.modalBody} {
          padding: 1.4rem;
        }
        .${styles.formGroup} {
          margin-bottom: 1rem;
        }
        .${styles.formLabel} {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--muted);
          display: block;
          margin-bottom: 0.4rem;
        }
        .${styles.formInput}, .${styles.formSelect} {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--border);
          border-radius: 7px;
          font-size: 0.75rem;
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
          background: var(--surface2);
          outline: none;
          transition: border-color 0.15s;
        }
        .${styles.formInput}:focus, .${styles.formSelect}:focus {
          border-color: var(--accent);
          background: var(--surface);
        }
        .${styles.formRow} {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.8rem;
        }
        .${styles.modalFooter} {
          padding: 1rem 1.4rem;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: flex-end;
          gap: 0.6rem;
          background: var(--surface2);
        }
      `}</style>
        </div>
    );
};
