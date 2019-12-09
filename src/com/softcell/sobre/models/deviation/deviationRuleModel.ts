import { PolicyBase } from "../policyBase";

import { IBasePolicy } from "../policyModel";
import { DeviationRefModel } from "./deviationRefModel";
import { DeviationRuleListModel } from "./deviationRuleListModel";
import { ExpressionMaker, OperandMaker } from "../breClass";
import { CONNREFUSED } from "dns";
import * as OperandHelper from "../../helper/OperandHelper";
import { CONSTANTS } from "../../constants/constants";
import { CustomField } from "../customFieldModel";
import * as OperationsUtil from "../../util/OperationsUtil";
import * as IFFhelper from "../../helper/IFFHelper";

export class DeviationRuleModel extends PolicyBase implements IBasePolicy {
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
    public outOperator : string;
    public customFields : CustomField[];
    public ref : DeviationRefModel[];

    constructor(props: DeviationRuleModel, iffData: any, customFields: CustomField[]) {
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
        this.outOperator = props.outOperator;
        this.customFields = customFields;
        const {ref = []} = props;
        this.ref = ref ? ref.map((x)=>{return new DeviationRefModel(x,iffData,customFields)}): [];
    }

    public generate() {
        const outerOperand = new ExpressionMaker(CONSTANTS.STATEMENT, " ", [], this.fieldname, this.displayname, CONSTANTS.CREDIT_RULE);
        const innerOperands = [];
        let innerOperand;
        outerOperand.operands = innerOperands;
        const isTradeLevelOperand = OperationsUtil.isTradeLevelCustomFieldCustomField(this.fieldname, this.customFields);
        if (isTradeLevelOperand) {
            const baseField = OperandHelper.tradeLevelBaseField(this.fieldname, this.FType, this.customFields, this.iffData);
            innerOperand = OperandHelper.prepareOperands(this, false, baseField, "", this.iffData);
        } else {
            innerOperand = OperandHelper.prepareLeafOperands(this, false, false, "", "", this.iffData);
        }

        innerOperands.push(innerOperand);

        this.ref.forEach((ref: DeviationRefModel, index: number) => {
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
        this.ref.forEach((ref: DeviationRefModel, index: number) => {
            const iffObj = IFFhelper.iffStructure(ref.FType, ref.fieldname, this.iffData);
            const iffStrFlag = OperationsUtil.isArrayInIFFOccurance(iffObj);
            const fieldname = OperationsUtil.getFieldBasedOnStructure(ref.FType, ref.fieldname, "", ref.AFSpec);
            refVal.push(DeviationRuleListModel.createValExp(`outputObjIterator.Values["${ref.displayname}"]`, fieldname, "string", iffStrFlag));
        });
        return refVal;
    }
    public getExp() {
        const tempRefExp = [];
        this.ref.forEach((ref: DeviationRefModel) => {
            let tempExp = "";
            if (ref.val1 == "" && ref.exp1 == "") {
                tempRefExp.push(`( ${ref.fieldname} ${ref.exp2} ${ref.val2} ) `);
                tempRefExp.push(ref.operator);
            } else {

                tempExp = `( ( ${ref.val1} ${ref.exp1} ${ref.fieldname} ) && ( ${ref.fieldname} ${ref.exp2} ${ref.val2} ) ) ${ref.operator}`;

            }
            tempRefExp.push(tempExp);
        });
        return tempRefExp.join("");

    }

}