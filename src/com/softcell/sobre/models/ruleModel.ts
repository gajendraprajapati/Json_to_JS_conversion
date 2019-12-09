import { CONSTANTS } from "../constants/constants";
import { ExpressionMaker, ExpressionsMaker, IFConditionExpressionMaker, OperandMaker, OutputAliasMaker } from "./breClass";
import { Counter } from "./counter";
import { PolicyBase } from "./policyBase";
import { IBasePolicy } from "./policyModel";
import { Ref2 } from "./ref2Model";
import { RuleList } from "./ruleListModel";
import * as OperandHelper from "../helper/OperandHelper";
import * as IFFhelper from "../helper/IFFHelper";
import { CustomField } from "./customFieldModel";
import * as OperationsUtil from "../util/OperationsUtil";

export class Rule extends PolicyBase implements IBasePolicy {
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
    public outOperator: string;
    public ref: Ref2[];
    public refVal: ExpressionMaker;
    public customFields : CustomField[];

    constructor(props?: Rule, iffData?: any, customFields?: CustomField[]) {
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
        this.operator = props.operator;
        this.outOperator = props.outOperator;
        this.customFields = customFields;
        const { ref = [] } = props;
        this.ref = ref.map((x) => new Ref2(x, iffData, customFields));
    }

    public generate() {
        const outerOperand = new ExpressionMaker(CONSTANTS.STATEMENT, " ", [], this.fieldname, this.displayname, CONSTANTS.CREDIT_RULE);
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

        this.ref.forEach((ref: Ref2, index: number) => {
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

    public generateValue() {
        const refVal = [];
        this.ref.forEach((ref: Ref2, index: number) => {
            const iffObj = IFFhelper.iffStructure(ref.FType, ref.fieldname, this.iffData);
            const iffStrFlag = OperationsUtil.isArrayInIFFOccurance(iffObj);
            const fieldname = OperationsUtil.getFieldBasedOnStructure(ref.FType, ref.fieldname, "", ref.AFSpec);
            refVal.push(RuleList.createValExp(`outputObjIterator.Values["${ref.displayname}"]`, fieldname, "string", iffStrFlag));
        });
        return refVal;
    }

    public getExpressionForPolicyCriterion() {
        const defaultOutputAlias = new OutputAliasMaker(true, false);
        // return ;

        // let exp1=new ExpressionsMaker(CONSTANTS.FOR_EACH, []);
        const exp = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);
        const outerexp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", [], this.fieldname, this.displayname, CONSTANTS.CREDIT_RULE);
        const leftOperand = new OperandMaker("loanResObj.ruleResult", "field", "string");
        outerexp.operands.push(leftOperand);
        const ifCon = new IFConditionExpressionMaker(CONSTANTS.IF_COND, defaultOutputAlias, this.generate()[0], this.fieldname, this.displayname, CONSTANTS.CREDIT_RULE);

        outerexp.operands.push(ifCon);

        exp.expressions.push(outerexp);

        return [exp];
    }
    public getExp() {
        const tempRefExp = [];
        this.ref.forEach((ref: Ref2) => {
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
