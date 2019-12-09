import { CONSTANTS } from "../constants/constants";
import * as IFFHelper from "../helper/IFFHelper";
import * as OperationsUtil from "../util/OperationsUtil";
import { ExpressionMaker, OperandMaker } from "./breClass";
import { PolicyBase } from "./policyBase";
import { IBasePolicy } from "./policyModel";

export class Ref extends PolicyBase implements IBasePolicy {
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

    constructor(props?: Ref, iffData?: any) {
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
    }

    public generate() {
       return this.getFieldBasedOnIffStr();

    }

    private getFieldBasedOnIffStr() {
        const iffStr = IFFHelper.iffStructure(this.FType, this.fieldname, this.iffData);
        const occurance = iffStr && iffStr.OCCURANCE;
        const fieldname = OperationsUtil.getFieldBasedOnStructure(this.FType, this.fieldname, "", this.AFSpec);

        if (occurance == "N") {
            const rightOperandArray = fieldname.split(".");
            const leftOperandStr = rightOperandArray.pop();
            const rightStr = rightOperandArray.join(".");

            const conditionMapOperation = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, "map", [], this.fieldname, `${CONSTANTS.MATCHING_FIELDS}_CONDITION_REF - ${this.displayname}`, CONSTANTS.MATCHING_FIELDS);
            const conditionMapLeftOperand = new OperandMaker(rightStr, CONSTANTS.FIELD, "string");
            const conditionMapRightOperand = new OperandMaker("obj." + leftOperandStr, CONSTANTS.VALUE, "string");
            conditionMapOperation.operands.push(conditionMapLeftOperand);
            conditionMapOperation.operands.push(conditionMapRightOperand);

            return conditionMapOperation;

        } else {
            const operand = new OperandMaker(fieldname, CONSTANTS.FIELD, "string");
            return operand;
        }
    }
}
