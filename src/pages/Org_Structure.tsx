import React, { useState, useMemo, useCallback } from 'react';
import { EzButton } from "@clarium/ezui-react-components";
import { Search, Download, Plus } from "lucide-react";
import { Role, RACI } from '@/components/org-structure/types';
import { RoleTable } from '@/components/org-structure/RoleTable';
import { OrgTree } from '@/components/org-structure/OrgTree';
import { RoleModal } from '@/components/org-structure/RoleModal';
import { RaciModal } from '@/components/org-structure/RaciModal';
import { RoleDetail } from '@/components/org-structure/RoleDetail';
import styles from '@/styles/OrgStructure.module.css';

// Initial data from HTML
const INITIAL_ROLES: Role[] = [
    { id: 1, title: 'Plant Manager', dept: 'Operations', icon: '🏭', person: '', parent: null, sops: 0, notes: 'Full plant authority', multi: false, raci: { R: 'Plant Manager', A: 'Plant Manager', C: 'Production Manager', I: 'Safety Officer' } },
    { id: 2, title: 'Production Manager', dept: 'Manufacturing', icon: '🧪', person: '', parent: 1, sops: 5, notes: 'Manages all production lines', multi: false, raci: { R: 'Production Manager', A: 'Plant Manager', C: 'QA Manager', I: 'Regulatory Affairs Lead' } },
    { id: 3, title: 'QA Manager', dept: 'Quality', icon: '🔬', person: '', parent: 1, sops: 18, notes: 'QMS ownership, SOP approvals', multi: false, raci: { R: 'QA Manager', A: 'Plant Manager', C: 'Regulatory Affairs Lead', I: 'Production Manager' } },
    { id: 4, title: 'Regulatory Affairs Lead', dept: 'Regulatory', icon: '🛡️', person: '', parent: 1, sops: 8, notes: 'Dossier & submission authority', multi: false, raci: { R: 'Regulatory Affairs Lead', A: 'Plant Manager', C: 'QA Manager', I: 'Production Manager' } },
    { id: 5, title: 'Sterile Mfg Supervisor', dept: 'Manufacturing', icon: '🧪', person: '', parent: 2, sops: 12, notes: 'Cleanroom operations', multi: false, raci: { R: 'Sterile Mfg Supervisor', A: 'Production Manager', C: 'QA Officer', I: 'QA Manager' } },
    { id: 6, title: 'QA Officer', dept: 'Quality', icon: '🔬', person: '', parent: 3, sops: 9, notes: 'IPQC, deviation management', multi: false, raci: { R: 'QA Officer', A: 'QA Manager', C: 'Validation Engineer', I: 'Production Manager' } },
    { id: 7, title: 'Manufacturing Operator', dept: 'Manufacturing', icon: '📋', person: '', parent: 5, sops: 0, notes: 'Executes batch operations', multi: false, raci: { R: 'Manufacturing Operator', A: 'Sterile Mfg Supervisor', C: 'QA Officer', I: 'Production Manager' } },
    { id: 8, title: 'Validation Engineer', dept: 'Engineering', icon: '⚙️', person: '', parent: 3, sops: 6, notes: 'Process & cleaning validation', multi: true, raci: { R: 'Validation Engineer', A: 'QA Manager', C: 'QA Officer', I: 'Regulatory Affairs Lead' } },
    { id: 9, title: 'Safety Officer', dept: 'HSE', icon: '🛡️', person: '', parent: 1, sops: 4, notes: 'GMP & HSE compliance', multi: false, raci: { R: 'Safety Officer', A: 'Plant Manager', C: 'Production Manager', I: 'QA Manager' } },
    { id: 10, title: 'QC Analyst', dept: 'Quality', icon: '🔬', person: '', parent: 6, sops: 7, notes: 'Lab testing & release', multi: false, raci: { R: 'QC Analyst', A: 'QA Officer', C: 'QA Manager', I: 'Regulatory Affairs Lead' } },
];

export default function OrgStructure() {
    const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
    const [searchQ, setSearchQ] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isRaciModalOpen, setIsRaciModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [raciRole, setRaciRole] = useState<Role | null>(null);
    const [nextId, setNextId] = useState(11);

    // Memoized stats
    const stats = useMemo(() => ({
        total: roles.length,
        multi: roles.filter(r => r.multi).length,
        depts: new Set(roles.map(r => r.dept)).size
    }), [roles]);

    // Filtered roles for Table
    const filteredRoles = useMemo(() => {
        return roles.filter(r => {
            const deptOk = activeFilter === 'all' || r.dept === activeFilter;
            const q = searchQ.toLowerCase();
            const searchOk = !q || (r.title.toLowerCase().includes(q) || r.dept.toLowerCase().includes(q));
            return deptOk && searchOk;
        });
    }, [roles, activeFilter, searchQ]);

    const handleSelectRole = useCallback((id: number) => {
        setSelectedRoleId(prev => prev === id ? null : id);
    }, []);

    const handleEditRole = useCallback((id: number) => {
        const role = roles.find(r => r.id === id);
        if (role) {
            setEditingRole(role);
            setIsRoleModalOpen(true);
        }
    }, [roles]);

    const handleDeleteRole = useCallback((id: number) => {
        const roleToDelete = roles.find(r => r.id === id);
        const hasChildren = roles.some(r => r.parent === id);

        if (hasChildren) {
            alert(`Cannot delete — ${roleToDelete?.title} has direct reports. Re-parent them first.`);
            return;
        }

        if (window.confirm(`Delete "${roleToDelete?.title}"? This cannot be undone.`)) {
            setRoles(prev => prev.filter(r => r.id !== id));
            if (selectedRoleId === id) setSelectedRoleId(null);
        }
    }, [roles, selectedRoleId]);

    const handleSaveRole = useCallback((data: Partial<Role>) => {
        if (editingRole) {
            setRoles(prev => prev.map(r => r.id === editingRole.id ? { ...r, ...data } as Role : r));
        } else {
            const newRole: Role = {
                id: nextId,
                raci: { R: '', A: '', C: '', I: '' },
                multi: false,
                person: '',
                ...data
            } as Role;
            setRoles(prev => [...prev, newRole]);
            setNextId(prev => prev + 1);
        }
        setIsRoleModalOpen(false);
        setEditingRole(null);
    }, [editingRole, nextId]);

    const handleOpenRaci = useCallback((id: number) => {
        const role = roles.find(r => r.id === id);
        if (role) {
            setRaciRole(role);
            setIsRaciModalOpen(true);
        }
    }, [roles]);

    const handleRaciChange = useCallback((roleId: number, key: keyof RACI, value: string) => {
        setRoles(prev => prev.map(r => r.id === roleId ? { ...r, raci: { ...r.raci, [key]: value } } : r));
        // Also update raciRole state to reflect changes in modal if needed, 
        // but usually in React we let the parent state drive it.
        setRaciRole(prev => prev && prev.id === roleId ? { ...prev, raci: { ...prev.raci, [key]: value } } : prev);
    }, []);

    const handleReparent = useCallback((draggedId: number, targetId: number) => {
        const dragged = roles.find(r => r.id === draggedId);
        const target = roles.find(r => r.id === targetId);
        if (dragged && target) {
            setRoles(prev => prev.map(r => r.id === draggedId ? { ...r, parent: targetId } : r));
            // showToast replacement in real app would be here
        }
    }, [roles]);

    const handleExport = useCallback(() => {
        let csv = 'Role,Department,Reports To,SOPs,Notes\n';
        roles.forEach(r => {
            const parent = r.parent ? roles.find(pr => pr.id === r.parent)?.title || '' : 'Top Level';
            csv += `"${r.title}","${r.dept}","${parent}","${r.sops}","${r.notes || ''}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'DWM_Org_Structure.csv';
        a.click();
    }, [roles]);

    const selectedRole = useMemo(() => roles.find(r => r.id === selectedRoleId) || null, [roles, selectedRoleId]);

    return (
        <div className={styles.container}>
            {/* Topbar */}
            <div className={styles.topbar}>
                <div className={styles.topbarLeft}>
                    <div className={styles.pageTitle}>Org Structure & RACI</div>
                    <div className={styles.searchWrap}>
                        <Search className="h-3.5 w-3.5" style={{ color: 'var(--muted2)' }} />
                        <input
                            type="text"
                            placeholder="Search roles or people…"
                            value={searchQ}
                            onChange={(e) => setSearchQ(e.target.value)}
                        />
                    </div>
                    <div className={styles.filterRow}>
                        {['all', 'Operations', 'Quality', 'Manufacturing', 'Regulatory'].map(dept => (
                            <div
                                key={dept}
                                className={`${styles.chip} ${activeFilter === dept ? styles.active : ''}`}
                                onClick={() => setActiveFilter(dept)}
                            >
                                {dept.charAt(0).toUpperCase() + dept.slice(1)}
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.topbarRight}>
                    <EzButton variant="ghost" onClick={handleExport} size="sm" className="gap-2">
                        <Download className="h-3.5 w-3.5" /> Export
                    </EzButton>
                    <EzButton variant="primary" onClick={() => { setEditingRole(null); setIsRoleModalOpen(true); }} size="sm" className="gap-2">
                        <Plus className="h-3.5 w-3.5" /> Add Role
                    </EzButton>
                </div>
            </div>

            {/* Stats Strip */}
            <div className={styles.statsStrip}>
                <div className={styles.stat}>
                    <div className={styles.statDot} style={{ background: 'var(--accent)' }}></div>
                    <span className={styles.statLabel}>Total Roles:</span>
                    <span className={styles.statVal}>{stats.total}</span>
                </div>
                <div className={styles.stat}>
                    <div className={styles.statDot} style={{ background: 'var(--purple)' }}></div>
                    <span className={styles.statLabel}>Multi-Hat:</span>
                    <span className={styles.statVal}>{stats.multi}</span>
                </div>
                <div className={styles.stat}>
                    <div className={styles.statDot} style={{ background: 'var(--amber)' }}></div>
                    <span className={styles.statLabel}>Departments:</span>
                    <span className={styles.statVal}>{stats.depts}</span>
                </div>
            </div>

            <div className={styles.main}>
                {/* Visual Org Tree Panel */}
                <div className={styles.treePanel}>
                    <div className={styles.panelHeader}>
                        <div className={styles.panelTitle}>Visual Org Tree</div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--muted2)' }}>Drag nodes to re-parent · Click to select</div>
                    </div>
                    <div className={styles.treeScroll}>
                        <OrgTree
                            roles={roles}
                            selectedRoleId={selectedRoleId}
                            onSelectRole={handleSelectRole}
                            onEditRole={handleEditRole}
                            onDeleteRole={handleDeleteRole}
                            onReparent={handleReparent}
                        />
                    </div>
                </div>

                {/* Role Registry Table Panel */}
                <div className={styles.tablePanel}>
                    <div className={styles.panelHeader}>
                        <div className={styles.panelTitle}>Role Registry</div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--muted2)' }}>{filteredRoles.length} roles</div>
                    </div>
                    <div className={styles.tableScroll}>
                        <RoleTable
                            roles={filteredRoles}
                            allRoles={roles}
                            selectedRoleId={selectedRoleId}
                            onSelectRole={handleSelectRole}
                            onEditRole={handleEditRole}
                            onDeleteRole={handleDeleteRole}
                            onOpenRaci={handleOpenRaci}
                        />
                    </div>
                </div>
            </div>

            {/* Side Detail Panel */}
            <RoleDetail
                role={selectedRole}
                isOpen={!!selectedRoleId}
                onClose={() => setSelectedRoleId(null)}
                onEdit={handleEditRole}
                onDelete={handleDeleteRole}
                onOpenRaci={handleOpenRaci}
                allRoles={roles}
            />

            {/* Modals */}
            <RoleModal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                onSave={handleSaveRole}
                editingRole={editingRole}
                roles={roles}
            />

            <RaciModal
                isOpen={isRaciModalOpen}
                onClose={() => setIsRaciModalOpen(false)}
                role={raciRole}
                allRoles={roles}
                onRaciChange={handleRaciChange}
            />
        </div>
    );
}
