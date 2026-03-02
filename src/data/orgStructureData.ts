export const DEPARTMENTS = ["All", "Executive", "Operations", "Finance", "Human Resources", "Technology", "Sales & Marketing"];
export const DEPT_OPTIONS = ["Executive", "Operations", "Finance", "Human Resources", "Technology", "Sales & Marketing", "Customer Support"];
export const ICON_OPTIONS = ["👤", "🎯", "⚙️", "📊", "🛡️", "🤝", "💡", "💰", "📱", "🏢"];

/** Initial data for role registry, migrated to string IDs. */
export const DWM_ROLES = [
    {
        id: "ROLE-0001",
        title: "CEO",
        dept: "Executive",
        icon: "👤",
        parent: null,
        sops: 12,
        notes: "Strategic leadership and vision",
        multi: false,
        raci: { R: "Strategy", A: "Everything", C: "Executive Team", I: "Board" }
    },
    {
        id: "ROLE-0002",
        title: "COO",
        dept: "Executive",
        icon: "⚙️",
        parent: "ROLE-0001",
        sops: 25,
        notes: "Operational oversight",
        multi: false,
        raci: { R: "Operations", A: "CEO", C: "Dept Heads", I: "All staff" }
    },
    {
        id: "ROLE-0003",
        title: "Operations Director",
        dept: "Operations",
        icon: "📊",
        parent: "ROLE-0002",
        sops: 45,
        notes: "Day-to-day ops management",
        multi: false,
        raci: { R: "Work Inventory", A: "COO", C: "Managers", I: "Team" }
    }
];
