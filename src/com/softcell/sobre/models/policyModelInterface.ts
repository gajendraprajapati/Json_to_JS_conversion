
export interface DerivedField {
    fieldName: string;
    fieldType: string;
    fieldId: number;
}

export interface DerivedFields {
    createdUpdatedDate: string;
    derivedFields: DerivedField[];
    institutionId: number;
    makerChecker: string;
    activeStatus: number;
    derivedTableId: number;
    createdUpdatedBy: string;
    derivedTableName: string;
}

export interface Ref {
    val1: string;
    exp1: string;
    fieldname: string;
    displayname: string;
    exp2: string;
    val2: string;
    operator: string;
    DType: string;
    AFSpec: string;
    FType: string;
    ExpType: string;
}

export interface Condition {
    val1: string;
    exp1: string;
    fieldname: string;
    displayname: string;
    exp2: string;
    val2: string;
    operator: string;
    outOperator: string;
    DType: string;
    AFSpec: string;
    FType: string;
    ExpType: string;
    ref: Ref[];
}

export interface Outcome {
    TYPE: string;
    OUTCM_VALUE: string;
    BASE_FIELD: string;
    BASE_FNAME: string;
    BASE_DTYPE: string;
    BASE_FTYPE: string;
    AGGR_OPRTR: string;
    COMPR_FIELD: string;
    COMPR_FNAME: string;
    COMPR_FTYPE: string;
    COMPR_VALUE: string;
    EMI_FIELD: string;
    EMI_FNAME: string;
    EMI_DTYPE: string;
    EMI_FTYPE: string;
    ROI_FIELD: string;
    ROI_FNAME: string;
    ROI_DTYPE: string;
    ROI_FTYPE: string;
    TENURE_FIELD: string;
    TENURE_FNAME: string;
    TENURE_FTYPE: string;
    AGGR_TYPE: string;
}

export interface RULE {
    Condition: Condition[];
    Outcome: Outcome;
}

export interface DEFAULTVALUE {
    TYPE: string;
    OUTCM_VALUE: string;
}

export interface History {
    Date: string;
    ActionBy: string;
}

export interface PUSH {
    History: History;
}

export interface CustomField {
    FIELD_NAME: string;
    FIELD_TYPE: string;
    LEVEL: string;
    RULES: RULE[];
    DEFAULT_VALUE: DEFAULTVALUE;
    DISPLAY_NAME: string;
    OCCURENCE: number;
    INSTITUTION_ID: number;
    createdby: string;
    status: string;
    FieldID: number;
    ACTIVE: number;
    updatedby: string;
    promoteDate: string;
    PUSH: PUSH;
}

export interface Ref2 {
    val1: string;
    exp1: string;
    fieldname: string;
    displayname: string;
    ExpType: string;
    exp2: string;
    val2: string;
    AFSpec: string;
    FType: string;
    DType: string;
    operator: string;
}

export interface Rule {
    val1: string;
    exp1: string;
    fieldname: string;
    displayname: string;
    ExpType: string;
    exp2: string;
    val2: string;
    AFSpec: string;
    FType: string;
    DType: string;
    operator: string;
    outOperator: string;
    ref: Ref2[];
}

export interface RuleList {
    CriteriaID: number;
    cname: string;
    Outcome: string;
    remark: string;
    rules: Rule[];
}

export interface CreditRule {
    RuleID: number;
    name: string;
    type: string;
    createdby: string;
    updatedby: string;
    RuleList: RuleList[];
}

export interface AGRTDVALUE {
    FIELD_NAME: string;
    DISP_NAME: string;
    MAX: string;
    MIN: string;
}

export interface Condition2 {
    val1: string;
    exp1: string;
    fieldname: string;
    displayname: string;
    exp2: string;
    val2: string;
    operator: string;
    DType: string;
    AFSpec: string;
    FType: string;
    ExpType: string;
    Difference: string;
    DiffOpr: string;
    outOperator: string;
    ref: any[];
}

export interface Outcome2 {
    DECISION: string;
    COMPUTE_DISP: string;
    COMPUTE_LOGIC: string;
    REMARK: string;
    ADDITIONAL_FIELDS: any[];
}

export interface RULE2 {
    ElgbltyID: number;
    Condition: Condition2[];
    Outcome: Outcome2;
    GridID: number;
    INSTITUTION_ID: number;
    createdby: string;
    createDate: string;
    ACTIVE: boolean;
    updateDate: string;
    updatedby: string;
}

export interface Eligibility {
    INSTITUTION_ID: number;
    ElgbltyID: number;
    name: string;
    status: string;
    createdby: string;
    updatedby: string;
    createDate: string;
    AGRTD_VALUES: AGRTDVALUE[];
    DEC_PRRTY: string[];
    updateDate: string;
    RULES: RULE2[];
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

export interface RuleID {
    index: number;
    value: string;
    name: string;
}

export interface Valid {
    val1: string;
    val2: string;
}

export interface ElgbltyID {
    index: number;
    value: string;
    name: string;
}

export interface AppList {
    name: string;
    value: string;
}

export interface DraftData {
    TableID: TableID[];
    updateDate: string;
    ProdList: ProdList2[];
    RuleID: RuleID[];
    priority: number;
    CritList: any[];
    valid: Valid;
    createdDate: string;
    createdby: string;
    DeviationID: string;
    derivedTableId: string;
    ElgbltyID: ElgbltyID[];
    AppList: AppList[];
    status: string;
}

export interface History2 {
    Action: string;
    ActionBy: string;
    Date: string;
    draftData: DraftData;
}

export interface AppList2 {
    name: string;
    value: string;
}

export interface ElgbltyID2 {
    index: number;
    value: string;
    name: string;
}

export interface RuleID2 {
    index: number;
    value: string;
    name: string;
}

export interface TableID2 {
    index: number;
    value: string;
    name: string;
    TableID: string;
    INSTITUTION_ID: number;
}

export interface Valid2 {
    val1: string;
    val2: string;
}

export interface CreditPolicy {
    INSTITUTION_ID: number;
    CritList: any[];
    createdDate: string;
    createdby: string;
    ProdList: ProdList[];
    name: string;
    priority: number;
    History: History2[];
    AppList: AppList2[];
    PolicyID: number;
    status: string;
    DeviationID: string;
    ElgbltyID: ElgbltyID2[];
    RuleID: RuleID2[];
    TableID: TableID2[];
    derivedTableId: string;
    updateDate: string;
    valid: Valid2;
}

export interface Ref3 {
    val1: string;
    exp1: string;
    fieldname: string;
    displayname: string;
    exp2: string;
    val2: string;
    operator: string;
    DType: string;
    AFSpec: string;
    FType: string;
}

export interface Condition3 {
    val1: string;
    exp1: string;
    fieldname: string;
    displayname: string;
    exp2: string;
    val2: string;
    operator: string;
    DType: string;
    AFSpec: string;
    FType: string;
    ref: Ref3[];
}

export interface RULE3 {
    Condition: Condition3[];
}

export interface MatchingField {
    version: number;
    DISPLAY_NAME: string;
    FIELD_TYPE: string;
    INSTITUTION_ID: number;
    FIELD_DATA_TYPE: string;
    createdby: string;
    FIELD_NAME: string;
    RULES: RULE3[];
    status: string;
}

export interface BandOutcome {
    val1: string;
    exp1: string;
    fieldname: string;
    displayname: string;
    ExpType: string;
    exp2: string;
    val2: string;
    band: string;
    AFSpec: string;
    FType: string;
    DType: string;
    operator: string;
    ref: any[];
}

export interface BandConfig {
    bandCondition: any[];
    bandOutcome: BandOutcome[];
}

export interface Logic {
    val1: string;
    exp1: string;
    fieldname: string;
    displayname: string;
    ExpType: string;
    exp2: string;
    val2: string;
    score: string;
    AFSpec: string;
    FType: string;
    DType: string;
    operator: string;
    ref: any[];
}

export interface ScorRule {
    logic: Logic[];
    weight: number;
    ItemID: number;
}

export interface Attribute {
    name: string;
    scorRules: ScorRule[];
    weight: number;
    color: string;
}

export interface Category {
    name: string;
    attributes: Attribute[];
    weight: number;
    color: string;
}

export interface ScoreCard {
    name: string;
    baseScore: string;
    baseOprtr: string;
    bandConfig: BandConfig[];
    categories: Category[];
    createdby: string;
    createDate: string;
    tableMinScore: string;
    tableMaxScore: string;
}

export interface IPolicyModel {
    derivedFields: DerivedFields;
    customFields: CustomField[];
    creditRule: CreditRule[];
    eligibility: Eligibility;
    masterFields: any[];
    creditPolicy: CreditPolicy;
    analyticalFieldsDeff: any[];
    analyticalFieldsSpec: any[];
    matchingFields: MatchingField[];
    INSTITUTION_ID: number;
    financialField: any[];
    scoreCard: ScoreCard[];
}
