import { CONSTANTS } from "../constants/constants";
import * as IFFHelper from "../helper/IFFHelper";
import { ExpressionMaker, ExpressionsMaker, OperandMaker } from "./breClass";
import { Condition } from "./matchingFieldCondition";
import { PolicyBase } from "./policyBase";
import { IBasePolicy } from "./policyModel";

export class Rule extends PolicyBase implements IBasePolicy {
    public Condition: Condition[];
    public operationType: boolean;
    constructor(props?: Rule, iffData?: any) {
        super(iffData);
        if (!props) {
            return;
        }
        this.Condition = props.Condition.map((x) => {
            x.operationFlag = props.operationType;
            return new Condition(x, this.iffData);
        });
    }

    public generate(isAddress?) {
        const conditionOperand = [];
        this.Condition.forEach((condition: Condition, index: number) => {
            conditionOperand.push(condition.generate(isAddress));
        });
        return this.createConditionalExp(conditionOperand);
    }

    public getFieldName() {
        const iffFormatObj = [];
        let dateFormat;
        this.Condition.forEach((condition: Condition) => {
            const iffObj = IFFHelper.iffStructure(condition.FType, condition.fieldname, this.iffData);

            dateFormat = iffObj ? iffObj.DATE_TYPE :  "NA";
            iffFormatObj.push(dateFormat);
        });
        return iffFormatObj;
    }

    private createConditionalExp(conditionOperand: OperandMaker[]) {
        const expression = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);

        const createLeftExpfield = this.createMatchingFieldExp("leftMatchingField", [], "array");
        const createRightExpfield = this.createMatchingFieldExp("rightMatchingField", [], "array");
        const leftExpression = this.createMatchingFieldExp("leftMatchingField", conditionOperand[0], "array", true);
        const rightExpression = this.createMatchingFieldExp("rightMatchingField", conditionOperand[1], "array", true);

        expression.expressions.push(createLeftExpfield);
        expression.expressions.push(createRightExpfield);
        expression.expressions.push(leftExpression);
        expression.expressions.push(rightExpression);

        return expression;
    }

    private createMatchingFieldExp(leftoperand: String, rightOperand: any, operandDataType: string, template?: boolean) {
        const expression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const leftOperandexp = new OperandMaker(leftoperand, CONSTANTS.FIELD, operandDataType);
        const rightOperandexp = template ? rightOperand : (new OperandMaker(rightOperand, CONSTANTS.VALUE, "array"));
        expression.operands.push(leftOperandexp);
        expression.operands.push(rightOperandexp);
        return expression;
    }

}
