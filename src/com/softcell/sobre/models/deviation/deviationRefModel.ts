import { PolicyBase } from "../policyBase";

import { IBasePolicy } from "../policyModel";
import { CustomField } from "../customFieldModel";
import * as OperationsUtil from "../../util/OperationsUtil";
import * as OperandHelper from "../../helper/OperandHelper";

export class DeviationRefModel extends PolicyBase implements IBasePolicy{
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
    public Difference: string;
    public DiffOpr: string;
    public customFields : CustomField[];

    constructor(props: DeviationRefModel, iffData: any, customFields: CustomField[]) {
        super(iffData);
        if (!props) {
            return;
        }
        this.val1 = props.val1;
        this.exp1 = props.exp1;
        this.fieldname = props.fieldname;
        this.displayname = props.displayname;
        this.exp2 = props.exp2;
        this.val2 = props.val2;
        this.operator = props.operator;
        this.DType = props.DType;
        this.AFSpec = props.AFSpec;
        this.FType = props.FType;
        this.ExpType = props.ExpType;
        this.Difference = props.Difference;
        this.DiffOpr = props.DiffOpr;
        this.customFields = customFields;
    }

    public generate(){
        let innerOperand;
        const isTradeLevelOperand = OperationsUtil.isTradeLevelCustomFieldCustomField(this.fieldname, this.customFields);
        if (isTradeLevelOperand) {
            const baseField = OperandHelper.tradeLevelBaseField(this.fieldname, this.FType, this.customFields, this.iffData);
            innerOperand = OperandHelper.prepareOperands(this, false, baseField, "", this.iffData);
        } else {
            innerOperand = OperandHelper.prepareLeafOperands(this, false, false, "", "", this.iffData);
        }
        return innerOperand;
    }
}