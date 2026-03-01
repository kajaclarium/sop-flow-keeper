import { TaskIO, IOType } from "../types/common";

interface IORule {
    keywords: string[];
    inputs: Array<{ label: string; type: IOType; description: string }>;
    outputs: Array<{ label: string; type: IOType; description: string }>;
}

const IO_RULES: IORule[] = [
    {
        keywords: ["cleaning", "hygiene", "sanitize"],
        inputs: [
            { label: "Cleaning Supplies", type: "material", description: "Approved cleaning agents and tools" },
            { label: "Safety Protocol", type: "document", description: "Personal protective equipment requirements" }
        ],
        outputs: [
            { label: "Cleaning Log", type: "document", description: "Record of sanitized areas" }
        ]
    },
    {
        keywords: ["calibration", "maintenance", "repair", "service"],
        inputs: [
            { label: "Equipment Manual", type: "document", description: "Technical specifications and procedures" },
            { label: "Spare Parts", type: "material", description: "Components for replacement or service" }
        ],
        outputs: [
            { label: "Service Report", type: "document", description: "Details of work performed" },
            { label: "Equipment Status", type: "data", description: "Current health/calibration state" }
        ]
    },
    {
        keywords: ["review", "assess", "check", "inspect", "audit"],
        inputs: [
            { label: "Standard/Checklist", type: "document", description: "Reference criteria for inspection" },
            { label: "Raw Data/Observations", type: "data", description: "Current state to be reviewed" }
        ],
        outputs: [
            { label: "Audit Findings", type: "document", description: "Discovered gaps or confirmations" },
            { label: "Approval Status", type: "approval", description: "Official sign-off or rejection" }
        ]
    },
    {
        keywords: ["recruit", "hire", "interview", "onboarding"],
        inputs: [
            { label: "Candidate Profile", type: "data", description: "Resume and background information" },
            { label: "Job Description", type: "document", description: "Role requirements and scope" }
        ],
        outputs: [
            { label: "Interview Feedback", type: "document", description: "Assessment of candidate fit" },
            { label: "Hiring Decision", type: "approval", description: "Final selection status" }
        ]
    },
    {
        keywords: ["backup", "data", "it", "setup", "it infrastructure"],
        inputs: [
            { label: "System Config", type: "data", description: "Current environment settings" },
            { label: "Access Rights", type: "approval", description: "Required permissions for tasks" }
        ],
        outputs: [
            { label: "System Log", type: "data", description: "Trace of actions taken" },
            { label: "Configuration Snapshot", type: "document", description: "New state documentation" }
        ]
    },
    {
        keywords: ["payroll", "tax", "timecard"],
        inputs: [
            { label: "Time Records", type: "data", description: "Logged hours for the period" },
            { label: "Tax Regulations", type: "document", description: "Compliance guidelines" }
        ],
        outputs: [
            { label: "Payment Summary", type: "document", description: "Calculated payroll details" },
            { label: "Compliance Filing", type: "document", description: "Submitted records for authority" }
        ]
    }
];

/**
 * Generates TaskIO items based on the task name using keyword matching.
 */
export function generateTaskIOs(name: string): { inputs: TaskIO[]; outputs: TaskIO[] } {
    const lowercaseName = name.toLowerCase();
    const inputs: TaskIO[] = [];
    const outputs: TaskIO[] = [];

    IO_RULES.forEach(rule => {
        if (rule.keywords.some(keyword => lowercaseName.includes(keyword))) {
            rule.inputs.forEach(input => {
                inputs.push({ ...input, id: crypto.randomUUID() });
            });
            rule.outputs.forEach(output => {
                outputs.push({ ...output, id: crypto.randomUUID() });
            });
        }
    });

    // Default if no keywords match - at least provide generic placeholders
    if (inputs.length === 0) {
        inputs.push({
            id: crypto.randomUUID(),
            label: "Prerequisites",
            type: "other",
            description: `Required items for ${name}`
        });
    }
    if (outputs.length === 0) {
        outputs.push({
            id: crypto.randomUUID(),
            label: "Result/Output",
            type: "data",
            description: `Outcome of ${name}`
        });
    }

    return { inputs, outputs };
}
