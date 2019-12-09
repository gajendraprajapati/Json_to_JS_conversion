import { CONSTANTS } from "../constants/constants";
import * as IFFHelper from "../helper/IFFHelper";
import { generateExpForArrayField } from "../helper/OperandHelper";
import * as OperationsUtil from "../util/OperationsUtil";
import { ExpressionMaker, OperandMaker } from "./breClass";
import { Ref } from "./matchingFieldsRef";
import { PolicyBase } from "./policyBase";
import { IBasePolicy } from "./policyModel";

export class Condition extends PolicyBase implements IBasePolicy {
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
    public ref: Ref[];
    public operationFlag: boolean;

    constructor(props?: Condition, iffData?: any) {
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
        const { ref = [] } = props;
        this.ref = ref.map((x) => new Ref(x, this.iffData));
        this.operationFlag = props.operationFlag;
    }

    public generate(isAddress?) {
        const condOperand = [];
        const conditionOperandExp = this.getFieldBasedOnIffStr();
        condOperand.push(conditionOperandExp);

        this.ref.forEach((ref: Ref) => {
            condOperand.push(ref.generate());
        });

        let rightOperandConcat;
        if (isAddress && isAddress == true) {
            rightOperandConcat = new ExpressionMaker(CONSTANTS.INTERSECTION_OPERATION, CONSTANTS.operators.ZIP, [], this.fieldname, `${CONSTANTS.MATCHING_FIELDS}_CONDITION - ${this.displayname}`, CONSTANTS.MATCHING_FIELDS);
        }
        else {
            rightOperandConcat = new ExpressionMaker(CONSTANTS.INTERSECTION_OPERATION, CONSTANTS.operators.CONCAT, [], this.fieldname, `${CONSTANTS.MATCHING_FIELDS}_CONDITION - ${this.displayname}`, CONSTANTS.MATCHING_FIELDS);
        }

        rightOperandConcat.operands.push(...condOperand);
        return rightOperandConcat;
    }

    private getFieldBasedOnIffStr() {
        const iffStr = IFFHelper.iffStructure(this.FType, this.fieldname, this.iffData);
        const occurance = iffStr && iffStr.OCCURANCE;
        const fieldname = OperationsUtil.getFieldBasedOnStructure(this.FType, this.fieldname, "", this.AFSpec);

        if (occurance == "N") {
            return generateExpForArrayField(fieldname);
        }
        else {
            return new OperandMaker(fieldname, CONSTANTS.FIELD, "string");
        }
    }

}
