export class WorkFLowConfigModel  {
    public _id: string;
    public intitutionId: number;
    public flowConfiguration: FlowConfiguration[];
}

export interface FlowConfiguration {
    productType: string;
    productKey: string;
    applicationProcess: boolean;
    matrixProcess: boolean;
    productProcess: boolean;
    decisionProcess: boolean;
    scoreProcess: boolean;
    criteriaProcess: boolean;
    eligibiltyAllowed: boolean;
    calculateCustomField: boolean;
    contionalScore: boolean;
}
