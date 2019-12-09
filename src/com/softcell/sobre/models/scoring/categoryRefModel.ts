import { PolicyBase } from "../policyBase";
import { IBasePolicy } from "../policyModel";
import * as OperandHelper from "../../helper/OperandHelper";
import * as OperationsUtil from "../../util/OperationsUtil";
import { CustomField } from "../customFieldModel";

export class LogicRefModel extends PolicyBase implements IBasePolicy {
    public AFSpec: string;
    public DType: string;
    public ExpType: string;
    public FType: string;
    public displayname: string;
    public exp1: string;
    public exp2: string;
    public fieldname: string;
    public operator: string;
    public val1: string;
    public val2: string;
    public customFields: CustomField[];

    constructor(props: LogicRefModel, iffData: any, customFields: CustomField[]) {
        super(iffData);
        if (!props) {
            return;
        }

        this.AFSpec = props.AFSpec;
        this.DType = props.DType;
        this.ExpType = props.ExpType;
        this.FType = props.FType;
        this.displayname = props.displayname;
        this.exp1 = props.exp1;
        this.exp2 = props.exp2;
        this.fieldname = props.fieldname;
        this.operator = props.operator;
        this.val1 = props.val1;
        this.val2 = props.val2;
        this.customFields = customFields;
    }

    public generate() {
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
