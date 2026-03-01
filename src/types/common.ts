export type IOType = "document" | "material" | "data" | "approval" | "other";

export interface TaskIO {
    id: string;
    label: string;
    type: IOType;
    description: string;
}

export const IO_TYPES: IOType[] = ["document", "material", "data", "approval", "other"];

export const IO_TYPE_OPTIONS = IO_TYPES.map((t) => ({
    label: t.charAt(0).toUpperCase() + t.slice(1),
    value: t
}));
