export enum ClaimRelationshipType {
    DEMONSTRATED_THROUGH = "DEMONSTRATED_THROUGH",
    SUPPORTED_BY = "SUPPORTED_BY",
    RELATED_TO = "RELATED_TO",
    DUPLICATES = "DUPLICATES",
    EXTENDS = "EXTENDS",
    CONTEXT_FOR = "CONTEXT_FOR",
}

export interface ClaimRelationship {
    fromClaimId: string;
    toClaimId: string;
    relation: ClaimRelationshipType;
}