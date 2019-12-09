import { MasterConfig } from "./master/masterConfig";

export class SoBREPolicyModel {

    public _id: string;
    public INSTITUTION_ID: number;
    public CritList: CritList[];
    public createdDate: Date;
    public createdby?: any;
    public ProdList: ProdList[];
    public name: string;
    public priority: number;
    public History: History[];
    public AppList: AppList2[];
    public PolicyID: number;
    public status: string;
    public TableID: TableID2[];
    public RuleID: any[];
    public valid: Valid2;
    public derivedTableId: string;
    public ElgbltyID: any[];
    public breJsCriterion: string;
    public masterConfig: MasterConfig[];
    public breJsCriterionScript2: any;
    public breJsCriterionFunc: any;
    public updateDate: Date;
}
export interface CritList {
    val1: string;
    exp1: string;
    fieldname: string;
    displayname: string;
    ExpType: string;
    FType: string;
    DType: string;
    AFSpec: string;
    exp2: string;
    val2: string;
    operator: string;
    outOperator: string;
    ref: any[];
}

export interface ProdList {
    name: string;
    value: string;
}

export interface TableID {
    index: number;
    value: string;
    name: string;
}

export interface ProdList2 {
    name: string;
    value: string;
}

export interface CritList2 {
    val1: string;
    exp1: string;
    fieldname: string;
    displayname: string;
    ExpType: string;
    FType: string;
    DType: string;
    AFSpec: string;
    exp2: string;
    val2: string;
    operator: string;
    outOperator: string;
    ref: any[];
}

export interface Valid {
    val1: string;
    val2: string;
}

export interface AppList {
    name: string;
    value: string;
}

export interface DraftData {
    TableID: TableID[];
    ProdList: ProdList2[];
    RuleID: string;
    priority: number;
    CritList: CritList2[];
    valid: Valid;
    createdDate: Date;
    createdby: string;
    derivedTableId: string;
    ElgbltyID: string;
    AppList: AppList[];
    status: string;
}

export interface History {
    Action: string;
    ActionBy: string;
    Date: Date;
    draftData: DraftData;
}

export interface AppList2 {
    name: string;
    value: string;
}

export interface TableID2 {
    index: number;
    value: string;
    name: string;
}

export interface Valid2 {
    val1: string;
    val2: string;
}

export default SoBREPolicyModel;
