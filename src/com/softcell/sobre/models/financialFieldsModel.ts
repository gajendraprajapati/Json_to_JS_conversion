import { CONSTANTS } from "../constants/constants";
import * as IFFHelper from "../helper/IFFHelper";
import * as OperationsUtil from "../util/OperationsUtil";
import {  ExpressionMaker, ExpressionsMaker, IFConditionExpressionMaker, OperandMaker, OutputAliasMaker } from "./breClass";
import { FinancialFieldList } from "./financialFieldListModel";
import { PolicyBase } from "./policyBase";
import { PolicyModel } from "./policyModel";
import * as EncDecryptUtil from "../util/EncDecryptUtil";

export class FinancialFieldModel extends PolicyBase {
    public FIELD_TYPE: string;
    public INSTITUTION_ID: number;
    public createdby: string;
    public FIELD_NAME: string;
    public LEVEL: string;
    public DISPLAY_NAME: string;
    public FINANCIAL_FIELD_LIST: FinancialFieldList[];
    public FORMULA_EXPRESSION: string;
    public OPERATION_TYPE: string;
    public approveRejectBy: string;
    public status: string;
    public custom_type: string;
    public iffData: any;
    public version: number;

    constructor(props?: FinancialFieldModel, policyModel?: PolicyModel, iffData?: any) {
        super(iffData);
        this.FIELD_TYPE = props.FIELD_TYPE;
        this.INSTITUTION_ID = props.INSTITUTION_ID;
        this.createdby = props.createdby;
        this.FIELD_NAME = props.FIELD_NAME;
        this.LEVEL = props.LEVEL;
        this.DISPLAY_NAME = props.DISPLAY_NAME;
        const { FINANCIAL_FIELD_LIST = [] } = props;
        this.FINANCIAL_FIELD_LIST = FINANCIAL_FIELD_LIST.map((x) => new FinancialFieldList(x));
        this.FORMULA_EXPRESSION = props.FORMULA_EXPRESSION;
        this.OPERATION_TYPE = props.OPERATION_TYPE;
        this.approveRejectBy = props.approveRejectBy;
        this.iffData = iffData;
        this.custom_type = CONSTANTS.FINANCIAL;
        this.status = props.status;
    }

    public generate() {
        const financialField = this;
        const iffData = this.iffData;
        const operationType = OperationsUtil.financialFieldOperation(financialField.OPERATION_TYPE);
        const financialFieldName = OperationsUtil.getFieldBasedOnStructure(CONSTANTS.FINANCIAL, financialField.DISPLAY_NAME, "");
        const customFieldLeftOperand = new OperandMaker(financialFieldName, CONSTANTS.FIELD, CONSTANTS.types.ANY);

        // Add FINANCIAL_FIELDS$<FIELD_NAME> also in derived fields
        const alternateFinancialFieldName = financialFieldName.replace(CONSTANTS.CALCULATED_FIELDS, CONSTANTS.FINANCIAL_FIELDS);
        const alternateFinancialLeftOperand = new OperandMaker(alternateFinancialFieldName, CONSTANTS.FIELD, CONSTANTS.types.ANY);
        const alternateFinancialRightOperand = new OperandMaker(financialFieldName, CONSTANTS.FIELD, CONSTANTS.types.ANY);
        const alternateFinancialExpression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        alternateFinancialExpression.operands.push(alternateFinancialLeftOperand);
        alternateFinancialExpression.operands.push(alternateFinancialRightOperand);

        if (operationType == CONSTANTS.types.CUSTOM) {
            const formula = financialField.FORMULA_EXPRESSION;
            const customFieldRightOperand = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);

            for (let fieldCount = 0; fieldCount < financialField.FINANCIAL_FIELD_LIST.length; fieldCount++) {
                const financialFieldList = financialField.FINANCIAL_FIELD_LIST[fieldCount];
                const iffStructure = IFFHelper.iffStructure(financialFieldList.FIELD_TYPE, financialFieldList.FIELD_NAME, iffData);
                const field = OperationsUtil.getFieldBasedOnStructure(financialFieldList.FIELD_TYPE, financialFieldList.FIELD_NAME, "");
                const exp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
                const left = new OperandMaker(financialFieldList.variable, CONSTANTS.FIELD, CONSTANTS.types.ANY);
                let right;
                if (OperationsUtil.isArrayInIFFOccurance(iffStructure)) {
                    const split = IFFHelper.splitIffField(field, ".");
                    const rightOperator = split[0] + "[" + split[0] + ".length - 1" + "]." + split[1];
                    right = new OperandMaker(rightOperator, CONSTANTS.FIELD, CONSTANTS.types.CUSTOM);
                } else {
                    right = new OperandMaker(field, CONSTANTS.FIELD, CONSTANTS.types.ANY);
                }

                exp.operands.push(left);
                exp.operands.push(right);

                customFieldRightOperand.expressions.push(exp);
            }
            const exp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", [], EncDecryptUtil.encrypt(financialField.FIELD_NAME), `${CONSTANTS.FINANCIAL_FIELDS}_NAME - ${this.DISPLAY_NAME}`, CONSTANTS.FINANCIAL_FIELDS);
            const right = new OperandMaker(financialField.FORMULA_EXPRESSION, CONSTANTS.FIELD, CONSTANTS.types.CUSTOM);
            exp.operands.push(customFieldLeftOperand);
            exp.operands.push(right);
            customFieldRightOperand.expressions.push(exp);
            customFieldRightOperand.expressions.push(alternateFinancialExpression);
            return customFieldRightOperand;
        } else {
            const customFieldForEach = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);
            const financialFieldExpression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", [], financialField.FIELD_NAME, `${CONSTANTS.FINANCIAL_FIELDS}_NAME - ${this.DISPLAY_NAME}`, CONSTANTS.FINANCIAL_FIELDS);
            financialFieldExpression.operands.push(customFieldLeftOperand);
            const operandDataType = OperationsUtil.longDataType(financialField.FIELD_TYPE);

            const customFieldRightOperand = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, operationType, []);
            const customFieldRightInnerOperand = new ExpressionMaker(CONSTANTS.INTERSECTION_OPERATION, CONSTANTS.operators.CONCAT, []);
            customFieldRightOperand.operands.push(customFieldRightInnerOperand);

            for (let fieldCount = 0; fieldCount < financialField.FINANCIAL_FIELD_LIST.length; fieldCount++) {
                const financialFieldList = financialField.FINANCIAL_FIELD_LIST[fieldCount];
                const iffStructure = IFFHelper.iffStructure(financialFieldList.FIELD_TYPE, financialFieldList.FIELD_NAME, iffData);
                const field = OperationsUtil.getFieldBasedOnStructure(financialFieldList.FIELD_TYPE, financialFieldList.FIELD_NAME, "");

                if (OperationsUtil.isArrayInIFFOccurance(iffStructure)) {
                    const arrayOperands = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.MAP, []);
                    const split = IFFHelper.splitIffField(field, ".");
                    const left = new OperandMaker(split[0], CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
                    const right = new OperandMaker("obj." + split[1], CONSTANTS.FIELD, operandDataType);
                    arrayOperands.operands.push(left);
                    arrayOperands.operands.push(right);
                    customFieldRightInnerOperand.operands.push(arrayOperands);
                } else {
                    customFieldRightInnerOperand.operands.push(new OperandMaker(field, CONSTANTS.FIELD, operandDataType));
                }
            }
            financialFieldExpression.operands.push(customFieldRightOperand);
            customFieldForEach.expressions.push(financialFieldExpression);
            customFieldForEach.expressions.push(alternateFinancialExpression);
            return customFieldForEach;
        }
    }

}
