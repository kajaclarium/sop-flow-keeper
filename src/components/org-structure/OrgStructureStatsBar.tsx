interface OrgStructureStatsBarProps {
    totalRoles: number;
    multiHatCount: number;
    departmentCount: number;
}

/** Stats summary strip showing key org metrics. */
export function OrgStructureStatsBar({ totalRoles, multiHatCount, departmentCount }: OrgStructureStatsBarProps) {
    const stats = [
        { dotClass: "bg-primary", label: "Total Roles", value: totalRoles },
        { dotClass: "bg-violet-500", label: "Multi-Hat", value: multiHatCount },
        { dotClass: "bg-amber-500", label: "Departments", value: departmentCount },
    ];

    return (
        <div className="flex items-center gap-8 px-6 py-2 border-b bg-card shrink-0">
            {stats.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${s.dotClass}`} />
                    <span className="text-[11px] text-muted-foreground">{s.label}:</span>
                    <span className="text-sm font-bold text-foreground">{s.value}</span>
                </div>
            ))}
        </div>
    );
}
