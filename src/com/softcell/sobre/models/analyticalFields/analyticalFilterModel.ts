import { PolicyBase } from "../policyBase";

import { IBasePolicy } from "../policyModel";
import { CustomField } from "../customFieldModel";
import { FilterRefModel } from "./filterRefModel";
import { ExpressionsMaker, ExpressionMaker } from "../breClass";
import { CONSTANTS } from "../../constants/constants";
import * as OperationsUtil from "../../util/OperationsUtil";
import * as OperandHelper from "../../helper/OperandHelper";


export class AnalyticalFilterModel extends PolicyBase implements IBasePolicy {
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
    public outOperator: string;
    public ref: FilterRefModel[];
    constructor(props?: AnalyticalFilterModel, iffData?: any, customFields?: CustomField[]) {
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
        this.outOperator = props.outOperator;
        const { ref = [] } = props;
        this.ref = ref.map((x) => new FilterRefModel(x, iffData));
    }
    public generate() {
        const outerOperand = new ExpressionMaker(CONSTANTS.STATEMENT, " ", [], this.fieldname, this.displayname, CONSTANTS.CREDIT_RULE);
        const innerOperands = [];
        outerOperand.operands = innerOperands;
        let innerOperand;
        const hasDPDCalculations = OperationsUtil.hasDPDCalculations(this);
        if (hasDPDCalculations) {
            // innerOperand = OperandHelper.prepareLeafOperands(this, true, true, "globalFieldName1", "globalFieldName", this.iffData);
            innerOperand = OperandHelper.prepareDPDConditionOperands(this, "globalFieldName1", "obj", true, this.iffData);
        } else {
            innerOperand = OperandHelper.prepareLeafOperands(this, false, true, "", "", this.iffData);
        }
        innerOperands.push(innerOperand);
        this.ref.forEach((ref: FilterRefModel, index: number) => {
            if (index == 0) {
                outerOperand.operator = this.operator;
            }

            const innerOperand = ref.generate();
            innerOperands.push(innerOperand);
        });

        if (this.ref.length == 0) {
            outerOperand.template = innerOperand.template;
            outerOperand.operator = innerOperand.operator;
            outerOperand.operands = innerOperand.operands;
        }
        return outerOperand;
    }
















}