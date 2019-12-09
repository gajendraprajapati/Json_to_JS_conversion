import { PolicyBase } from "../policyBase";

import { IBasePolicy } from "../policyModel";
import { CustomField } from "../customFieldModel";
import * as OperandHelper from "../../helper/OperandHelper";
import * as OperationsUtil from "../../util/OperationsUtil";

export class FilterRefModel extends PolicyBase implements IBasePolicy {
    public val1: string;
    public exp1: string;
    public fieldname: string;
    public displayname: string;
    public exp2: string;
    public val2: string;
    public operator: string;
    public DType: string;
    public AFSpec: string;
    public FType: string;
    public ExpType: string;

    constructor(props?: FilterRefModel, iffData?: any, customFields?: CustomField[]) {
        super(iffData);
        if (!props) {
            return;
        }
        this.val1 = props.val1;
        this.exp1 = props.exp1;
        this.fieldname = props.fieldname;
        this.exp2 = props.exp2;
        this.val2 = props.val2;
        this.displayname = props.displayname;
        this.operator = props.operator;
        this.DType = props.DType;
        this.AFSpec = props.AFSpec;
        this.FType = props.FType
        this.ExpType = props.ExpType;
    }
    public generate() {
        const hasDPDCalculations = OperationsUtil.hasDPDCalculations(this);
        let innerOperand
        if (hasDPDCalculations) {
            innerOperand = OperandHelper.prepareDPDConditionOperands(this, "globalFieldName1", "obj", true, this.iffData);
        } else {
            innerOperand = OperandHelper.prepareLeafOperands(this, false, true, "", "", this.iffData);
        }
        return innerOperand;
    }
}