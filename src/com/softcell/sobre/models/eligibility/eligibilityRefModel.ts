import { PolicyBase } from "../policyBase";

import { IBasePolicy } from "../policyModel";
import { prepareLeafOperands } from "../../helper/OperandHelper";
import { CustomField } from "../customFieldModel";
import * as OperationsUtil from "../../util/OperationsUtil";
import * as OperandHelper from "../../helper/OperandHelper";
import { CONSTANTS } from "../../constants/constants";
import { ExpressionMaker, OperandMaker } from "../breClass";


export class EligibilityRefModel extends PolicyBase implements IBasePolicy {
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
    public customField: CustomField[];


    constructor(props: EligibilityRefModel, iffData: any, customFields: CustomField[]) {
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
        this.ExpType = props.ExpType;
        this.DiffOpr = props.DiffOpr;
        this.Difference = props.Difference;
        this.FType = props.FType;
        this.customField = customFields;
    }

    public generate() {
        return prepareLeafOperands(this, false, false, "", "", this.iffData);
    }

    public generateWithTrade() {
        let innerOperand;
        if(this.fieldname.split("$")[0] == CONSTANTS.CUSTOM_FIELDS){
            innerOperand = OperandHelper.prepareTradeLeafOperands(this);
        }else{
            innerOperand = prepareLeafOperands(this, false, false, "", "", this.iffData);
        }
        return innerOperand;
    }
    public generateValue(){
        const innerExp = new ExpressionMaker(CONSTANTS.STATEMENT,"=",[]);
        const innerLeftOperand = new OperandMaker(`outputObjIterator.VALUES["${this.displayname}"]`,CONSTANTS.FIELD,CONSTANTS.types.STRING);
        const innerRightOperand = OperandHelper.valueRightOperand(this,this.iffData);
        innerExp.operands.push(innerLeftOperand);
        innerExp.operands.push(innerRightOperand);
        return innerExp;
    }
}