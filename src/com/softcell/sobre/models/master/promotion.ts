export interface Promotion {
    _id: string;
    soberId: string;
    INSTITUTION_ID: number;
    requestId: number;
    requestName: string;
    sourceName: string;
    sourceType: string;
    requestType: string;
    sourceId: number;
    createdUpdatedBy: string;
    createDate: Date;
    activeStatus: string;
    toEnvironment: string;
    fromEnvironment: string;
    status: string;
    data: any;
    policy: any;
}
