import { CONSTANTS } from "../../constants/constants";
import * as OperandHelper from "../../helper/OperandHelper";
import * as OperationsUtil from "../../util/OperationsUtil";
import * as StringUtil from "../../util/StringUtil";
import * as EncDecryptUtil from "../../util/EncDecryptUtil";
import { ExpressionMaker, ExpressionsMaker, IFConditionExpressionMaker, OperandMaker } from "../breClass";
import { RULE } from "../customFieldRuleModel";
import { PolicyBase } from "../policyBase";
import { DEFAULTVALUE, PolicyModel, PUSH } from "../policyModel";
import { Condition } from "../customRuleConditionModel";
import { CustomField } from "../customFieldModel";

export class AnalyticalRatio extends PolicyBase {
    public FIELD_ID: number
    public ACTIVE: number
    public DISPLAY_NAME: string
    public FIELD_NAME: string
    public RATIO: Condition[]
    public FIELD_TYPE: string
    public DEFF_TYPE: string
    public INSTITUTION_ID: number
    public OCCURENCE: number
   // public customeFields: CustomField[]
    constructor(analyticalField?: AnalyticalRatio, iffData?: any) {
        super(iffData);
        //this.customeFields = customFields;
        this.FIELD_ID = analyticalField.FIELD_ID;
        this.FIELD_TYPE = analyticalField.FIELD_TYPE;
        this.FIELD_NAME = analyticalField.FIELD_NAME;
        this.DISPLAY_NAME = analyticalField.DISPLAY_NAME;
        this.OCCURENCE = analyticalField.OCCURENCE;
        this.INSTITUTION_ID = analyticalField.INSTITUTION_ID;
        this.ACTIVE = analyticalField.ACTIVE;
        this.DEFF_TYPE = CONSTANTS.outcomeType.DIVISION;
        this.RATIO = analyticalField.RATIO;

    }

    public generate() {
        const analyticalField = this;
        const expressions = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);
        const customFieldExpression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        expressions.expressions.push(customFieldExpression);
        const customFieldLeftOperand = new OperandMaker(OperationsUtil.tradeCustomFieldName(analyticalField.FIELD_NAME), "field", CONSTANTS.types.INTEGER);
        const operator = OperationsUtil.operatorByStrOperation(CONSTANTS.outcomeType.DIVISION);
        const numberOperationExpression = new ExpressionMaker(CONSTANTS.NUMBER_OPERATION, operator, []);
        let baseFieldName = new OperandMaker(OperationsUtil.getFieldBasedOnStructure(this.RATIO[0].FType, this.RATIO[0].fieldname, undefined),"field", CONSTANTS.types.INTEGER,);
        let compareFieldName =new OperandMaker(OperationsUtil.getFieldBasedOnStructure(this.RATIO[0].ref, this.RATIO[0].ref[0].fieldname, undefined),"field",CONSTANTS.types.INTEGER);
        numberOperationExpression.operands.push(baseFieldName);
        numberOperationExpression.operands.push(compareFieldName);
        customFieldExpression.operands.push(customFieldLeftOperand);
        customFieldExpression.operands.push(numberOperationExpression);
        return expressions;
    }

}
