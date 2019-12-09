import { CONSTANTS } from "../../constants/constants";
import * as OperandHelper from "../../helper/OperandHelper";
import * as OperationsUtil from "../../util/OperationsUtil";
import { ExpressionMaker, IFConditionExpressionMaker, OperandMaker, OutputAliasMaker } from "../breClass";
import { PolicyBase } from "../policyBase";
import { IBasePolicy } from "../policyModel";
import { LogicRefModel } from "./categoryRefModel";
import { CustomField } from "../customFieldModel";

export class LogicModel extends PolicyBase {
    public val1: string;
    public exp1: string;
    public fieldname: string;
    public displayname: string;
    public ExpType: string;
    public exp2: string;
    public val2: string;
    public score: string;
    public AFSpec: string;
    public FType: string;
    public DType: string;
    public operator: string;
    public ref: LogicRefModel[];
    public weight: any;
    public customFields: CustomField[];

    constructor(props: LogicModel, iffData: any, customFields: CustomField[]) {
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
        this.score = props.score;
        this.AFSpec = props.AFSpec;
        this.FType = props.FType;
        this.DType = props.DType;
        this.operator = props.operator;
        const { ref = [] } = props;
        this.ref = ref.map((x) => new LogicRefModel(x, this.iffData, customFields));
        this.weight = props.weight;
        this.customFields = customFields;
    }

    public generate() {
        const outerOperand = new ExpressionMaker(CONSTANTS.STATEMENT, " ", []);
        const innerOperands = [];
        outerOperand.operands = innerOperands;
        let innerOperand;
        const isTradeLevelOperand = OperationsUtil.isTradeLevelCustomFieldCustomField(this.fieldname, this.customFields);
        if (isTradeLevelOperand) {
            const baseField = OperandHelper.tradeLevelBaseField(this.fieldname, this.FType, this.customFields, this.iffData);
            innerOperand = OperandHelper.prepareOperands(this, false, baseField, "", this.iffData);
        } else {
            innerOperand = OperandHelper.prepareLeafOperands(this, false, false, "", "", this.iffData);
        }
        innerOperands.push(innerOperand);

        this.ref.forEach((ref: LogicRefModel, index: number) => {
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
        return new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(new OperandMaker(this.score, "value", "number"), 0), outerOperand);
    }

    public getExp() {
        const tempRefExp = [];
        this.ref.forEach((ref: LogicRefModel) => {
            let tempExp = "";
            if (ref.val1 == "" && ref.exp1 == "") {
                tempRefExp.push(`( ${ref.displayname} ${ref.exp2} ${ref.val2} ) `);
                tempRefExp.push(ref.operator);
            } else {

                tempExp = `( ( ${ref.val1} ${ref.exp1} ${ref.displayname} ) && ( ${ref.displayname} ${ref.exp2} ${ref.val2} ) ) ${ref.operator}`;

            }
            tempRefExp.push(tempExp);
        });
        return tempRefExp.join("");

    }

}
