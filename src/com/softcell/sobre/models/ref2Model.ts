import { prepareLeafOperands } from "../helper/OperandHelper";
import { PolicyBase } from "./policyBase";
import { CustomField } from "./customFieldModel";
import * as OperationsUtil from "../util/OperationsUtil";
import * as OperandHelper from "../helper/OperandHelper";

export class Ref2 extends PolicyBase {
    public val1: string;
    public exp1: string;
    public fieldname: string;
    public displayname: string;
    public ExpType: string;
    public exp2: string;
    public val2: string;
    public AFSpec: string;
    public FType: string;
    public DType: string;
    public operator: string;
    public customFields : CustomField[];

    constructor(props?: Ref2, iffData?: any, customFields?: CustomField[]) {
        super(iffData);
        if (!props) {
            return;
        }
        this.val1 = props.val1;
        this.exp1 = props.exp1;
        this.fieldname = props.fieldname;
        this.displayname = props.displayname;
        this.ExpType = props.ExpType;
        this.exp2 = props.exp2;
        this.val2 = props.val2;
        this.AFSpec = props.AFSpec;
        this.FType = props.FType;
        this.DType = props.DType;
        this.customFields = customFields;
        this.operator = props.operator;
    }

    public generate() {
        const isTradeLevelOperand = OperationsUtil.isTradeLevelCustomFieldCustomField(this.fieldname, this.customFields);
        let innerOperand;
        if (isTradeLevelOperand) {
            const baseField = OperandHelper.tradeLevelBaseField(this.fieldname, this.FType, this.customFields, this.iffData);
            innerOperand = OperandHelper.prepareOperands(this, false, baseField, "", this.iffData);
        } else {
            innerOperand = OperandHelper.prepareLeafOperands(this, false, false, "", "", this.iffData);
        }
        return innerOperand;
    }
}
