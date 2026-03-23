export const extractionStatuses = ["pending", "processing", "completed", "failed"] as const;

export type ExtractionStatus = (typeof extractionStatuses)[number];
