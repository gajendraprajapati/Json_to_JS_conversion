import { PolicyBase } from "../policyBase";

import { IBasePolicy } from "../policyModel";
import { EligibilityRefModel } from "./eligibilityRefModel";
import { ExpressionsMaker, OperandMaker, ExpressionMaker } from "../breClass";
import { CONSTANTS } from "../../constants/constants";
import * as OperandHelper from "../../helper/OperandHelper";
import * as OperationsUtill from "../../util/OperationsUtil";
import { CustomField } from "../customFieldModel";
import * as IFFHelper from "../../helper/IFFHelper";
export class EligibilityConditionModel extends PolicyBase implements IBasePolicy {
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
    public outOperator: string;
    public ref: EligibilityRefModel[];
    public isTrade : boolean;
    public  customFields : CustomField[];

    constructor(props: EligibilityConditionModel, iffData: any,  customFields: CustomField[] ) {
        super(iffData);
        if (!props) {
            return;
        }

        this.val1 = props.val1;
        const { ref = [] } = props;
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
        this.ref = ref ? ref.map((x) => { return new EligibilityRefModel(x, iffData, customFields) }) : [];
        this.isTrade = props.isTrade;
        this.customFields = customFields;
    }

    public generate() {
        const outerOperand = new ExpressionMaker(CONSTANTS.STATEMENT, " ", [], this.fieldname, this.displayname, CONSTANTS.CREDIT_RULE);
        const innerOperands = [];
        outerOperand.operands = innerOperands;
        let innerOperand;
        innerOperand = OperandHelper.prepareLeafOperands(this, false, false, "", "", this.iffData);
        innerOperands.push(innerOperand);

        for (let refCount = 0; refCount < this.ref.length; refCount++) {
            const ref = this.ref[refCount];

            if (refCount == 0) {
                outerOperand.operator = this.operator;
            }
            const innerOperand = ref.generate();
            innerOperands.push(innerOperand);
        }
        if (this.ref.length == 0) {
            outerOperand.template = innerOperand.template;
            outerOperand.operator = innerOperand.operator;
            outerOperand.operands = innerOperand.operands;
        }
        return outerOperand;
    }

    public generateTradeEligibility(baseField){
        const fieldToCompare = OperationsUtill.getFieldBasedOnStructure(CONSTANTS.IFF_STRUCTURE, this.fieldname,"", this.AFSpec);
        const outerOperand = new ExpressionMaker(CONSTANTS.STATEMENT, " ", [], this.fieldname, this.displayname, CONSTANTS.CREDIT_RULE);
        const innerOperands = [];
        outerOperand.operands = innerOperands;
        let innerOperand;
        if(this.fieldname.split("$")[0] == CONSTANTS.CUSTOM_FIELDS){
            const baseFieldOfRule = OperandHelper.summaryLevelBaseField(this.fieldname, this.FType, this.customFields, this.iffData);
            const arrayBaseField = OperationsUtill.getFieldBasedOnStructure(CONSTANTS.IFF_STRUCTURE, baseFieldOfRule,"", this.AFSpec);
            const splitRuleField = IFFHelper.splitIffField(arrayBaseField, ".");
            if(splitRuleField[0] == baseField){
                innerOperand = OperandHelper.prepareTradeLeafOperands(this);
            }else{
                innerOperand = OperandHelper.prepareLeafOperands(this, false, false, "", "", this.iffData);
            }
        }else if(baseField != IFFHelper.splitIffField(fieldToCompare, ".")[0]){
            innerOperand = OperandHelper.prepareLeafOperands(this, false, false, "", "", this.iffData);
        } else{
            innerOperand = OperandHelper.prepareLeafOperands(this, false, true, "", "", this.iffData);
        }
        innerOperands.push(innerOperand);

        for (let refCount = 0; refCount < this.ref.length; refCount++) {
            const ref = this.ref[refCount];

            if (refCount == 0) {
                if (this.operator == CONSTANTS.operators.AND) {
                    outerOperand.operator = CONSTANTS.operators.AND;
                } else if (this.operator == CONSTANTS.operators.OR) {
                    outerOperand.operator =CONSTANTS.operators.OR;
                }
            }
            const innerOperand = ref.generateWithTrade();
            innerOperands.push(innerOperand);
        }
        if (this.ref.length == 0) {
            outerOperand.template = innerOperand.template;
            outerOperand.operator = innerOperand.operator;
            outerOperand.operands = innerOperand.operands;
        }
        return outerOperand; 
        
    }

    public generateValues(){
        const valueArray = [];
        const innerExp = new ExpressionMaker(CONSTANTS.STATEMENT,"=",[]);
        const innerLeftOperand = new OperandMaker(`outputObjIterator.VALUES["${this.displayname}"]`,CONSTANTS.FIELD,CONSTANTS.types.STRING);
        const innerRightOperand = OperandHelper.valueRightOperand(this,this.iffData);
        innerExp.operands.push(innerLeftOperand);
        innerExp.operands.push(innerRightOperand);
        valueArray.push(innerExp)
        this.ref.forEach((elem)=>{
            valueArray.push(elem.generateValue());


        });
        return valueArray;
    }
    public getExp() {
        const tempRefExp = [];
        this.ref.forEach((ref: EligibilityRefModel) => {
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