import { ExpressionMaker, IFConditionExpressionMaker, OperandMaker, OutputAliasMaker, ExpressionsMaker } from "../models/breClass";

import { CONSTANTS } from "../constants/constants";
import * as IFFHelper from "../helper/IFFHelper";
import * as OperationsUtil from "../util/OperationsUtil";
import * as StringUtil from "../util/StringUtil";
import { getAllDependentCustomFields } from "../../../../generatePolicyProd";
import { CustomField } from "../models/customFieldModel";
import * as _ from "lodash";

/**
 * This method returns maximum of 2 values depending on dataType
 */
export const prepareLeafOperands = (rule, isCustomFieldOutputAliasFieldAndArray, isTradeLevelCustomField, globalDPDVar, arrayBaseField, iffData) => {
    const iffStructure = IFFHelper.iffStructure(rule.FType, rule.fieldname, iffData);
    let iffStructureVal2;
    if (StringUtil.toLowerCase(rule.ExpType) == CONSTANTS.FIELD) {
        iffStructureVal2 = IFFHelper.iffStructure(CONSTANTS.IFF_STRUCTURE, rule.val2, iffData);
    }
    const innerOperand = new ExpressionMaker( "", "", []);
    const nonIFFStructures: any = [CONSTANTS.CUSTOM, CONSTANTS.FINANCIAL, CONSTANTS.MASTER_STRUCTURE, CONSTANTS.MATCHING_FIELDS];
    let operandDataType;
    if (!rule.DType) {
        if (iffStructure) {
            operandDataType = OperationsUtil.longDataType(iffStructure.FIELD_TYPE);
        } else {
            operandDataType = CONSTANTS.types.STRING;
        }
    } else {
        operandDataType = OperationsUtil.longDataType(rule.DType);
    }
    innerOperand.template = OperationsUtil.getTemplate(operandDataType, CONSTANTS.STATEMENT);
    innerOperand.operator = OperationsUtil.operation(operandDataType, rule.exp1, rule.exp2);
    let fieldName = OperationsUtil.getFieldBasedOnStructure(rule.FType, rule.fieldname, rule.masterKeyField, rule.AFSpec);

    if (isTradeLevelCustomField && OperationsUtil.isDPDValueFilterRequired(rule)) {
        const split = IFFHelper.splitIffField(fieldName, ".");
        innerOperand.template = CONSTANTS.ARRAY_OPERATION;
        innerOperand.operator = CONSTANTS.operators.SOME;
        const left = new OperandMaker(globalDPDVar + "." + split[1], CONSTANTS.FIELD, "array");
        innerOperand.operands.push(left);
        const operator = OperationsUtil.operation(operandDataType, rule.exp1, rule.exp2);
        const right = new ExpressionMaker(CONSTANTS.STATEMENT, operator, []);
        innerOperand.operands.push(right);
        const leftOperand = new OperandMaker("obj", CONSTANTS.FIELD, operandDataType);
        const rightOperand = new OperandMaker(rule.val2, CONSTANTS.VALUE, operandDataType);
        right.operands.push(leftOperand);
        right.operands.push(rightOperand);

        return innerOperand;
    } else if (OperationsUtil.isDPDValueFilterRequired(rule)) {
        const split = IFFHelper.splitIffField(fieldName, ".");
        let left;
        innerOperand.template = CONSTANTS.ARRAY_OPERATION;
        innerOperand.operator = CONSTANTS.operators.FILTER;
        if (StringUtil.notBlank(globalDPDVar)) {
            left = new OperandMaker(globalDPDVar, CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        } else {
            left = new OperandMaker(split[0], CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        }
        innerOperand.operands.push(left);
        const right = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.SOME, []);
        innerOperand.operands.push(right);

        const rightExpressionLeftOperand = new OperandMaker("obj." + split[1], CONSTANTS.FIELD, CONSTANTS.types.DPD);
        right.operands.push(rightExpressionLeftOperand);
        const rightExpressionRightExpression = new ExpressionMaker(CONSTANTS.NUMBER_OPERATION, rule.exp2, []);
        right.operands.push(rightExpressionRightExpression);
        const rightExpressionOperand1 = new OperandMaker("obj", CONSTANTS.FIELD, CONSTANTS.types.STRING);
        rightExpressionRightExpression.operands.push(rightExpressionOperand1);
        const rightExpressiontOperand2 = new OperandMaker(rule.val2, CONSTANTS.VALUE, CONSTANTS.types.STRING);
        rightExpressionRightExpression.operands.push(rightExpressiontOperand2);

        return innerOperand;
    }

    if ((operandDataType == CONSTANTS.types.INTEGER || operandDataType == CONSTANTS.types.DATE) && StringUtil.notBlank(rule.val1) && StringUtil.notBlank(rule.exp1)) {
        if (iffStructure && iffStructure.OCCURANCE == "N" && !isTradeLevelCustomField) {
            const split = IFFHelper.splitIffField(fieldName, ".");

            if (StringUtil.notBlank(globalDPDVar)) {
                split[0] = globalDPDVar;
            }

            innerOperand.template = CONSTANTS.ARRAY_OPERATION;
            if (isCustomFieldOutputAliasFieldAndArray) {
                innerOperand.operator = CONSTANTS.operators.FILTER;
            } else {
                innerOperand.operator = CONSTANTS.operators.SOME;
            }
            const left = new OperandMaker(split[0], CONSTANTS.FIELD, "array");
            const right = new ExpressionMaker( "", "", []);
            right.template = OperationsUtil.getTemplate(operandDataType, CONSTANTS.STATEMENT);
            right.operator = OperationsUtil.operation(operandDataType, rule.exp1, rule.exp2);

            const leftOperand = OperationsUtil.getValue(rule.ExpType, rule.val1, operandDataType);
            const rightOperand = OperationsUtil.getValue(rule.ExpType, rule.val2,  operandDataType);
            const innerLeftOperand = new OperandMaker(OperationsUtil.minValueByDataType(leftOperand, rightOperand, operandDataType), rule.ExpType && rule.ExpType.toLowerCase(), operandDataType);
            const innerMiddleOperand = new OperandMaker("obj." + split[1], CONSTANTS.FIELD, operandDataType);
            const innerRightOperand = new OperandMaker(OperationsUtil.maxValueByDataType(leftOperand, rightOperand, operandDataType), rule.ExpType && rule.ExpType.toLowerCase(), operandDataType);

            if (operandDataType == CONSTANTS.types.DATE) {
                const dateType = (iffStructure && iffStructure.DATE_TYPE) ? iffStructure.DATE_TYPE.toUpperCase() : CONSTANTS.DATE_FROMAT2;
                innerLeftOperand.dateType = dateType;
                innerMiddleOperand.dateType = dateType;
                innerRightOperand.dateType = dateType;

                if (rule.ExpType && rule.ExpType.toLowerCase() == CONSTANTS.VALUE) {
                    innerLeftOperand.dateType = CONSTANTS.DATE_FROMAT1;
                    innerRightOperand.dateType = CONSTANTS.DATE_FROMAT1;
                }
            }

            right.operands.push(innerLeftOperand);
            right.operands.push(innerMiddleOperand);
            right.operands.push(innerRightOperand);

            innerOperand.operands.push(left);
            innerOperand.operands.push(right);
        } else {
            const leftOperand = OperationsUtil.getValue(rule.ExpType, rule.val1, operandDataType);
            const rightOperand = OperationsUtil.getValue(rule.ExpType, rule.val2,  operandDataType);
            const left = new OperandMaker(OperationsUtil.minValueByDataType(leftOperand, rightOperand, operandDataType), rule.ExpTyp && rule.ExpType.toLowerCase(), operandDataType);
            let middle = new OperandMaker(fieldName, CONSTANTS.FIELD, operandDataType );
            const right = new OperandMaker(OperationsUtil.maxValueByDataType(leftOperand, rightOperand, operandDataType), rule.ExpTyp && rule.ExpType.toLowerCase(), operandDataType);

            if (isTradeLevelCustomField && !nonIFFStructures.includes(rule.FType)) {
                const split = IFFHelper.splitIffField(fieldName, ".");
                if (StringUtil.notBlank(globalDPDVar)) {
                    middle = new OperandMaker(globalDPDVar + "." + split[1], CONSTANTS.FIELD, operandDataType );
                } else {
                    middle = new OperandMaker("obj." + split[1], CONSTANTS.FIELD, operandDataType );
                }
            }

            if (operandDataType == CONSTANTS.types.DATE) {
                const dateType = (iffStructure && iffStructure.DATE_TYPE) ? iffStructure.DATE_TYPE.toUpperCase() : CONSTANTS.DATE_FROMAT2;
                left.dateType = dateType;
                middle.dateType = dateType;
                right.dateType = dateType;

                if (StringUtil.toLowerCase(rule.ExpType) == CONSTANTS.VALUE) {
                    left.dateType = CONSTANTS.DATE_FROMAT1;
                    right.dateType = CONSTANTS.DATE_FROMAT1;
                }
            }
            innerOperand.operands.push(left);
            innerOperand.operands.push(middle);
            innerOperand.operands.push(right);
        }
    } else {
        if (((iffStructure && iffStructure.OCCURANCE == "N") || (iffStructureVal2 && iffStructureVal2.OCCURANCE == "N")) && !isTradeLevelCustomField) {
            const fieldNameVal2 = OperationsUtil.getFieldBasedOnStructure(CONSTANTS.IFF_STRUCTURE, rule.val2, rule.masterKeyField,  rule.AFSpec);
            const split = IFFHelper.splitIffField(fieldName, ".");
            const splitVal2 = IFFHelper.splitIffField(fieldNameVal2, ".");

            if (StringUtil.notBlank(globalDPDVar)) {
                split[0] = globalDPDVar;
            }
            let distinctArrayFlag = false;
            if((split[0] != splitVal2[0]) && (iffStructure && iffStructure.OCCURANCE == "N") && (iffStructureVal2 && iffStructureVal2.OCCURANCE == "N")){
                distinctArrayFlag = true;
            }
            let left;
            if(iffStructureVal2 && iffStructureVal2.OCCURANCE == "N") {
                left = new OperandMaker(splitVal2[0], CONSTANTS.FIELD, "array");
            } else {
                left = new OperandMaker(split[0], CONSTANTS.FIELD, "array");
            }

            innerOperand.template = CONSTANTS.ARRAY_OPERATION;
            if (isCustomFieldOutputAliasFieldAndArray) {
                innerOperand.operator = CONSTANTS.operators.FILTER;
            } else if(distinctArrayFlag){
                innerOperand.operator = OperationsUtil.operation(operandDataType, rule.exp1, rule.exp2);
                innerOperand.template = CONSTANTS.MULTI_ARRAY_OPERATION;
            } else{
                innerOperand.operator = CONSTANTS.operators.SOME;
            }

            const leftMultiArry = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.MAP, []);
            const leftInnerOperand = new OperandMaker(split[0],CONSTANTS.FIELD,operandDataType);
            const leftOuterOperand = new OperandMaker("obj."+split[1], CONSTANTS.FIELD,operandDataType);

            if(operandDataType == CONSTANTS.types.DATE){
                const dateType = (iffStructure && iffStructure.DATE_TYPE) ? iffStructure.DATE_TYPE.toUpperCase() : CONSTANTS.DATE_FROMAT2;
                leftInnerOperand.dateType = dateType;
                leftOuterOperand.dateType = dateType;
            }
            leftMultiArry.operands.push(leftInnerOperand);
            leftMultiArry.operands.push(leftOuterOperand);
            let operandDataTypeVal2;
            if (!rule.DType) {
                if (iffStructureVal2) {
                    operandDataTypeVal2 = OperationsUtil.longDataType(iffStructureVal2.FIELD_TYPE);
                } else {
                    operandDataTypeVal2 = CONSTANTS.types.STRING;
                }
            } else {
                operandDataTypeVal2 = OperationsUtil.longDataType(rule.DType);
            }
            const right = new ExpressionMaker("", "", []);
            if(distinctArrayFlag){
                right.template = CONSTANTS.ARRAY_OPERATION;
                right.operator = CONSTANTS.operators.MAP;
            }else{
                right.template = OperationsUtil.getTemplate(operandDataType, CONSTANTS.STATEMENT);
                right.operator = OperationsUtil.operation(operandDataType, rule.exp1, rule.exp2);
            }

            let innerLeftOperand;
            if(iffStructure && iffStructure.OCCURANCE == "N" && !distinctArrayFlag) {
                innerLeftOperand = new OperandMaker("obj." + split[1], CONSTANTS.FIELD, operandDataType);
            } else if(distinctArrayFlag){
                innerLeftOperand = new OperandMaker(splitVal2[0], CONSTANTS.FIELD, operandDataTypeVal2);
            }else{
                innerLeftOperand = new OperandMaker(fieldName, CONSTANTS.FIELD, operandDataType);
            }

            let innerRightOperand;
            if (StringUtil.toLowerCase(rule.ExpType) == CONSTANTS.FIELD) {
                if (iffStructureVal2 && iffStructureVal2.OCCURANCE == "N") {
                    const val2Split = IFFHelper.splitIffField(rule.val2, "$");
                    innerRightOperand = new OperandMaker("obj." + val2Split[1], rule.ExpType && rule.ExpType.toLowerCase(), operandDataType);
                } else {
                    innerRightOperand = new OperandMaker(OperationsUtil.getValue(rule.ExpType, rule.val2,  operandDataType), StringUtil.toLowerCase(rule.ExpType), operandDataType);
                }
            } else {

                innerRightOperand = new OperandMaker(OperationsUtil.getValue(rule.ExpType, rule.val2,  operandDataType), StringUtil.toLowerCase(rule.ExpType), operandDataType);
            }

            if (operandDataType == CONSTANTS.types.DATE) {
                const dateType = (iffStructure && iffStructure.DATE_TYPE) ? iffStructure.DATE_TYPE.toUpperCase() : CONSTANTS.DATE_FROMAT2;
                innerLeftOperand.dateType = dateType;
                innerRightOperand.dateType = dateType;

                if (StringUtil.toLowerCase(rule.ExpType) == CONSTANTS.VALUE) {
                    innerRightOperand.dateType = CONSTANTS.DATE_FROMAT1;

                    right.operands.push(innerLeftOperand);
                    right.operands.push(innerRightOperand);

                    innerOperand.operands.push(left);
                    innerOperand.operands.push(right);
                } else if (StringUtil.toLowerCase(rule.ExpType) == CONSTANTS.FIELD && (rule.exp2.toLowerCase() == CONSTANTS.DIFF_MONTH || rule.exp2.toLowerCase() == CONSTANTS.DIFF_DAYS)) {
                    const innerExpression = new ExpressionMaker(CONSTANTS.NUMBER_OPERATION, rule.DiffOpr, []);
                    const numberOperand = new OperandMaker(rule.Difference, CONSTANTS.VALUE, "number");
                    right.operands.push(innerLeftOperand);
                    right.operands.push(innerRightOperand);
                    innerExpression.operands.push(right);
                    innerExpression.operands.push(numberOperand);

                    innerOperand.operands.push(left);
                    innerOperand.operands.push(innerExpression);
                } else {
                    right.operands.push(innerLeftOperand);
                    right.operands.push(innerRightOperand);

                    if(distinctArrayFlag){
                        innerOperand.operands.push(leftMultiArry);
                    }else{
                        innerOperand.operands.push(left);
                    }

                    innerOperand.operands.push(right);
                }

            } else {
                right.operands.push(innerLeftOperand);
                right.operands.push(innerRightOperand);

                innerOperand.operands.push(left);
                innerOperand.operands.push(right);
            }
        } else {
            if (isCustomFieldOutputAliasFieldAndArray) {
                innerOperand.template = CONSTANTS.ARRAY_OPERATION;
                innerOperand.operator = CONSTANTS.operators.FILTER;
                const arrayBaseFieldName = OperationsUtil.getFieldBasedOnStructure(CONSTANTS.IFF_STRUCTURE, arrayBaseField, rule.masterKeyField,rule.AFSpec);
                const split = IFFHelper.splitIffField(arrayBaseFieldName, ".");
                const leftOperand = new OperandMaker(split[0], CONSTANTS.FIELD, "array");
                innerOperand.operands.push(leftOperand);
                const rightExpression = new ExpressionMaker("", "", []);
                rightExpression.template = OperationsUtil.getTemplate(operandDataType, CONSTANTS.STATEMENT);
                rightExpression.operator = OperationsUtil.operation(operandDataType, rule.exp1, rule.exp2);
                innerOperand.operands.push(rightExpression);

                const left = new OperandMaker(fieldName, CONSTANTS.FIELD, operandDataType);
                const right = new OperandMaker(OperationsUtil.getValue(rule.ExpType, rule.val2, operandDataType), rule.ExpType && rule.ExpType.toLowerCase(), operandDataType);
                if (operandDataType == CONSTANTS.types.DATE) {
                    const dateType = (iffStructure && iffStructure.DATE_TYPE) ? iffStructure.DATE_TYPE.toUpperCase() : CONSTANTS.DATE_FROMAT2;
                    left.dateType = dateType;
                    right.dateType = dateType;
                    if (StringUtil.toLowerCase(rule.ExpType) == CONSTANTS.VALUE) {
                        right.dateType = CONSTANTS.DATE_FROMAT1;
                    }
                }
                rightExpression.operands.push(left);
                rightExpression.operands.push(right);
            } else {
                let left = new OperandMaker(fieldName, CONSTANTS.FIELD, operandDataType);
                let right;
                if ( rule.ExpType) {
                    right = new OperandMaker(OperationsUtil.getValue(rule.ExpType, rule.val2, operandDataType), rule.ExpType.toLowerCase(), operandDataType);
                } else {
                    right = new OperandMaker(OperationsUtil.getValue(rule.ExpType, rule.val2, operandDataType), CONSTANTS.VALUE, operandDataType);
                }

                if (isTradeLevelCustomField && !nonIFFStructures.includes(rule.FType)) {
                    const split = IFFHelper.splitIffField(fieldName, ".");
                    if (StringUtil.notBlank(globalDPDVar)) {
                        left = new OperandMaker(globalDPDVar + "." + split[1], CONSTANTS.FIELD, operandDataType);
                    } else {
                        left = new OperandMaker("obj." + split[1], CONSTANTS.FIELD, operandDataType);
                    }
                }

                if (operandDataType == CONSTANTS.types.DATE) {
                    const dateType = (iffStructure && iffStructure.DATE_TYPE) ? iffStructure.DATE_TYPE.toUpperCase() : CONSTANTS.DATE_FROMAT2;
                    left.dateType = dateType;
                    right.dateType = dateType;
                    if (StringUtil.toLowerCase(rule.ExpType) == CONSTANTS.VALUE) {
                        right.dateType = CONSTANTS.DATE_FROMAT1;
                    }

                    if (StringUtil.toLowerCase(rule.ExpType) == CONSTANTS.FIELD && (StringUtil.toLowerCase(rule.exp2) == CONSTANTS.DIFF_MONTH || StringUtil.toLowerCase(rule.exp2) == CONSTANTS.DIFF_DAYS)) {
                        const innerExpression = new ExpressionMaker(CONSTANTS.NUMBER_OPERATION, rule.DiffOpr, []);
                        const numberOperand = new OperandMaker(rule.Difference, CONSTANTS.VALUE, "number");
                        innerOperand.operands.push(left);
                        innerOperand.operands.push(right);

                        innerExpression.operands.push(innerOperand);
                        innerExpression.operands.push(numberOperand);
                        return innerExpression;
                    } else {
                        innerOperand.operands.push(left);
                        innerOperand.operands.push(right);
                    }
                } else {
                    innerOperand.operands.push(left);
                    innerOperand.operands.push(right);
                }
            }
        }
    }
    return innerOperand;
};

export const prepareTradeLeafOperands = (rule) => {
    const innerOperand = new ExpressionMaker( "", "", []);
    const operandDataType = OperationsUtil.longDataType(rule.DType);
    innerOperand.template = OperationsUtil.getTemplate(operandDataType, CONSTANTS.STATEMENT);
    innerOperand.operator = OperationsUtil.operation(operandDataType, rule.exp1, rule.exp2);
    const split = IFFHelper.splitIffField(rule.fieldname, "$");

    if ((operandDataType == CONSTANTS.types.INTEGER || operandDataType == CONSTANTS.types.DATE) && StringUtil.notBlank(rule.val1) && StringUtil.notBlank(rule.exp1)) {
        const leftOperand = OperationsUtil.getValue(rule.ExpType, rule.val1, operandDataType);
        const rightOperand = OperationsUtil.getValue(rule.ExpType, rule.val2,  operandDataType);
        const left = new OperandMaker(OperationsUtil.minValueByDataType(leftOperand, rightOperand, operandDataType), StringUtil.toLowerCase(rule.ExpType), operandDataType);
        const middle = new OperandMaker(OperationsUtil.tradeCustomFieldName(split[1]) + "(obj)", CONSTANTS.FIELD, operandDataType );
        const right = new OperandMaker(OperationsUtil.maxValueByDataType(leftOperand, rightOperand, operandDataType), StringUtil.toLowerCase(rule.ExpType), operandDataType);

        if (operandDataType == CONSTANTS.types.DATE) {
            left.dateType = CONSTANTS.DATE_FROMAT2;
            middle.dateType = CONSTANTS.DATE_FROMAT2;
            right.dateType = CONSTANTS.DATE_FROMAT2;
        }

        innerOperand.operands.push(left);
        innerOperand.operands.push(middle);
        innerOperand.operands.push(right);
    } else {
        const left = new OperandMaker(OperationsUtil.tradeCustomFieldName(split[1]) + "(obj)", CONSTANTS.FIELD, operandDataType);
        const right = new OperandMaker(OperationsUtil.getValue(rule.ExpType, rule.val2, operandDataType), StringUtil.toLowerCase(rule.ExpType), operandDataType);

        if (operandDataType == CONSTANTS.types.DATE) {
            left.dateType = CONSTANTS.DATE_FROMAT2;
            right.dateType = CONSTANTS.DATE_FROMAT2;
        }

        innerOperand.operands.push(left);
        innerOperand.operands.push(right);
    }
    return innerOperand;
};

export const customFieldOutputAliasTradeLevel = (customField, outcome, customFields, iffData) => {
    const constArray: any = [CONSTANTS.outcomeType.MULTIPLICATION, CONSTANTS.outcomeType.DIVISION, CONSTANTS.outcomeType.ADDITION, CONSTANTS.outcomeType.DIFFERENCE];
    const aggeDateOper: any = [CONSTANTS.MIN_DIFF_DAYS, CONSTANTS.MAX_DIFF_DAYS, CONSTANTS.MAX_DIFF_MONTH, CONSTANTS.MIN_DIFF_MONTH];
    const customFieldDataType = OperationsUtil.longDataType(customField.FIELD_TYPE);
    const isTradeLevel = OperationsUtil.isTradeLevelCustomFieldCustomField(outcome.BASE_FIELD, customFields);
    if (outcome.TYPE == CONSTANTS.outcomeType.FIELD && outcome.AGGR_OPRTR != CONSTANTS.operators.VALUE_OF) {
        const iffStructure = IFFHelper.iffStructure(outcome.BASE_FTYPE, outcome.BASE_FIELD, iffData);
        const iffStructureCompr = IFFHelper.iffStructure(outcome.COMPR_FTYPE, outcome.COMPR_FIELD, iffData);
        const innerOperand = new ExpressionMaker("", "", []);
        let outcomeDType;
        if (iffStructure) {
            outcomeDType = iffStructure.FIELD_TYPE;
        } else {
            outcomeDType = outcome.BASE_DTYPE;
        }
        const operandDataType = OperationsUtil.longDataType(outcomeDType);
        innerOperand.operator =  OperationsUtil.operation(operandDataType, "", outcome.AGGR_OPRTR);
        const fieldName = OperationsUtil.getFieldBasedOnStructure(outcome.BASE_FTYPE, outcome.BASE_FIELD, outcome.masterKeyField);

        if (isTradeLevel) {
            const split = IFFHelper.splitIffField(outcome.BASE_FIELD, "$");
            const left = new OperandMaker(OperationsUtil.tradeCustomFieldName(split[1]) + "(obj)", CONSTANTS.FIELD, operandDataType);
            if (operandDataType == CONSTANTS.types.DATE) {
                left.dateType = CONSTANTS.DATE_FROMAT2;
            }

            innerOperand.operands.push(left);
        } else {
            const split = IFFHelper.splitIffField(fieldName, ".");
            let right;
            if (iffStructure && iffStructure.OCCURANCE == "N") {
                right = new OperandMaker("obj." + split[1], CONSTANTS.FIELD, operandDataType);
            } else {
                right = new OperandMaker(fieldName, CONSTANTS.FIELD, operandDataType);
            }

            if (operandDataType == CONSTANTS.types.DATE) {
                right.dateType = StringUtil.getDateTypeFromIffOrDefault(iffStructure, CONSTANTS.DATE_FROMAT2);
            }
            innerOperand.operands.push(right);
        }
        if (operandDataType == CONSTANTS.types.INTEGER && (innerOperand.operator == CONSTANTS.numberOperators.AVERAGE || innerOperand.operator == CONSTANTS.numberOperators.COUNT || innerOperand.operator == CONSTANTS.numberOperators.COUNT_DIST || innerOperand.operator == CONSTANTS.numberOperators.MAX || innerOperand.operator == CONSTANTS.numberOperators.MIN)) {
            if (innerOperand.operator == CONSTANTS.numberOperators.COUNT || innerOperand.operator == CONSTANTS.numberOperators.COUNT_DIST) {
                innerOperand.operator = CONSTANTS.operators.FILTER;
            } else {
                innerOperand.operator = CONSTANTS.operators.MAP;
            }

            const aggregateOperand = new ExpressionMaker( "", "", []);
            aggregateOperand.template  = CONSTANTS.ARRAY_OPERATION;
            aggregateOperand.operator = OperationsUtil.operation(operandDataType, "", outcome.AGGR_OPRTR);
            aggregateOperand.operands.push(innerOperand);

            return new OutputAliasMaker(aggregateOperand, "");
        } else if (operandDataType == CONSTANTS.types.DATE && (innerOperand.operator == CONSTANTS.dateOperators.COUNT || innerOperand.operator == CONSTANTS.dateOperators.COUNT_DIST || innerOperand.operator == CONSTANTS.dateOperators.MIN || innerOperand.operator == CONSTANTS.dateOperators.MAX)) {
            const comprField = OperationsUtil.getFieldBasedOnStructure(outcome.COMPR_FTYPE, outcome.COMPR_FIELD, outcome.masterKeyField);
            const splitCompr = IFFHelper.splitIffField(comprField, ".");
            if (innerOperand.operator == CONSTANTS.dateOperators.COUNT) {
                innerOperand.operator = CONSTANTS.operators.FILTER;
            } else {
                innerOperand.operator = CONSTANTS.operators.MAP;
            }
            if (aggeDateOper.includes(outcome.AGGR_OPRTR)) {
                innerOperand.template  = CONSTANTS.DATE_OPERATION;

                if (outcome.AGGR_OPRTR == CONSTANTS.MIN_DIFF_DAYS || outcome.AGGR_OPRTR == CONSTANTS.MAX_DIFF_DAYS) {
                    innerOperand.operator = CONSTANTS.dateOperators.DIFF_DAYS;
                } else if (outcome.AGGR_OPRTR == CONSTANTS.MAX_DIFF_MONTH || CONSTANTS.MAX_DIFF_MONTH) {
                    innerOperand.operator = CONSTANTS.dateOperators.DIFF_MONTHS;
                }
                let aggregateInnerRightOperands;

                if (iffStructureCompr && iffStructureCompr.OCCURANCE == "N") {
                    aggregateInnerRightOperands = new OperandMaker("obj." + splitCompr[1], CONSTANTS.FIELD, operandDataType, iffStructureCompr.DATE_TYPE.toUpperCase());
                } else {
                    const dateType = (iffStructureCompr && iffStructureCompr.DATE_TYPE) ? iffStructureCompr.DATE_TYPE.toUpperCase() : CONSTANTS.DATE_FROMAT2;
                    aggregateInnerRightOperands = new OperandMaker(comprField, CONSTANTS.FIELD, operandDataType, dateType);
                }

                innerOperand.operands.push(aggregateInnerRightOperands);
            }
            return new OutputAliasMaker(innerOperand, "");
        } else {
            return new OutputAliasMaker(innerOperand, "");
        }
    } else if (outcome.TYPE == CONSTANTS.outcomeType.FIELD && outcome.AGGR_OPRTR == CONSTANTS.operators.VALUE_OF) {
        const iffStructure = IFFHelper.iffStructure(outcome.BASE_FTYPE, outcome.BASE_FIELD, iffData);
        const fieldName = OperationsUtil.getFieldBasedOnStructure(outcome.BASE_FTYPE, outcome.BASE_FIELD, outcome.masterKeyField);
        const operandDataType = OperationsUtil.longDataType(outcome.BASE_DTYPE);
        if (iffStructure && iffStructure.OCCURANCE == "N") {
            const split = IFFHelper.splitIffField(fieldName, ".");

            return new OutputAliasMaker(new OperandMaker("obj." + split[1], CONSTANTS.FIELD, customFieldDataType), "");
        } else {
            if (isTradeLevel) {
                const split = IFFHelper.splitIffField(outcome.BASE_FIELD, "$");
                const tradeName = OperationsUtil.tradeCustomFieldName(split[1]) + "(obj)";
                return new OutputAliasMaker(new OperandMaker(tradeName, CONSTANTS.FIELD, customFieldDataType), "");
            } else {
                return new OutputAliasMaker(new OperandMaker(fieldName, CONSTANTS.FIELD, customFieldDataType), "");
            }
        }
    } else {
        return new OutputAliasMaker(new OperandMaker(outcome.OUTCM_VALUE, CONSTANTS.VALUE, customFieldDataType), "");
    }
};

export const customFieldOutputAlias = (customField, outcome, institutionId, isTradeLevelCustomField, customFields, iffData) => {
    const constArray: any = [CONSTANTS.outcomeType.MULTIPLICATION, CONSTANTS.outcomeType.DIVISION, CONSTANTS.outcomeType.ADDITION, CONSTANTS.outcomeType.DIFFERENCE];
    const iffStructure = IFFHelper.iffStructure(outcome.BASE_FTYPE, outcome.BASE_FIELD, iffData);
    const iffStructureCompr = IFFHelper.iffStructure(outcome.COMPR_FTYPE, outcome.COMPR_FIELD, iffData);
    const aggeDateOper: any = [CONSTANTS.MIN_DIFF_DAYS, CONSTANTS.MAX_DIFF_DAYS, CONSTANTS.MAX_DIFF_MONTH, CONSTANTS.MIN_DIFF_MONTH];
    if (outcome.TYPE == CONSTANTS.outcomeType.FIELD) {
        const innerOperand = new ExpressionMaker("", "", []);
        const operandDataType = OperationsUtil.longDataType(outcome.BASE_DTYPE);

        const fieldName = OperationsUtil.getFieldBasedOnStructure(outcome.BASE_FTYPE, outcome.BASE_FIELD, outcome.masterKeyField);
        if (iffStructure && iffStructure.OCCURANCE == "N" && !isTradeLevelCustomField) {
            const split = IFFHelper.splitIffField(fieldName, ".");

            innerOperand.template = CONSTANTS.ARRAY_OPERATION;
            innerOperand.operator =  OperationsUtil.operation(operandDataType, "", outcome.AGGR_OPRTR);

            const left = new OperandMaker(split[0], CONSTANTS.FIELD, "array");
            const right = new OperandMaker("obj."+ split[1], CONSTANTS.FIELD, operandDataType);
            if(operandDataType == CONSTANTS.types.DATE) {
                right.dateType = iffStructure.DATE_TYPE
            }
            innerOperand.operands.push(left);
            innerOperand.operands.push(right);

            const newInnerOperand = handleAggregatedOutputOperations(innerOperand, outcome, operandDataType, iffData);
            return new OutputAliasMaker(newInnerOperand, "");
        } else {
            if (isTradeLevelCustomField) {
                return customFieldOutputAliasTradeLevel(customField, outcome, customFields, iffData);
            } else {
                if (aggeDateOper.includes(outcome.AGGR_OPRTR)) {
                    return customFieldOutputAliasTradeLevel(customField, outcome, customFields, iffData);
                } else {
                    const customFieldDataType = OperationsUtil.longDataType(customField.FIELD_TYPE);
                    return new OutputAliasMaker(new OperandMaker(fieldName, CONSTANTS.FIELD, customFieldDataType), "");
                }
            }
        }
    } else if (constArray.includes(outcome.TYPE)) {
        const tradeBase = OperationsUtil.isTradeLevelCustomFieldCustomField(outcome.BASE_FIELD, customFields);
        const tradeCompare = OperationsUtil.isTradeLevelCustomFieldCustomField(outcome.COMPR_FIELD, customFields);
        let baseFieldName = OperationsUtil.getFieldBasedOnStructure(outcome.BASE_FTYPE, outcome.BASE_FIELD, outcome.masterKeyField);
        let compareFieldName = OperationsUtil.getFieldBasedOnStructure(outcome.COMPR_FTYPE, outcome.COMPR_FIELD, outcome.masterKeyField);
        let baseSplit = IFFHelper.splitIffField(baseFieldName, ".");
        const compareSplit = IFFHelper.splitIffField(compareFieldName, ".");
        if (tradeBase) {
            baseSplit = IFFHelper.splitIffField(outcome.BASE_FIELD, "$");
            baseFieldName = OperationsUtil.tradeCustomFieldName(baseSplit[1]) + "(obj)";
        } else if (isTradeLevelCustomField) {
            baseFieldName = "obj." + baseSplit[1];
        }

        if (tradeCompare) {
            const compareSplit = IFFHelper.splitIffField( outcome.COMPR_FIELD, "$");
            compareFieldName =  OperationsUtil.tradeCustomFieldName(compareSplit[1]) + "(obj)";
        } else if (isTradeLevelCustomField) {
            compareFieldName = "obj." + compareSplit[1];
        }

        const operator = OperationsUtil.operatorByStrOperation(outcome.TYPE);
        const innerOperand = new ExpressionMaker(CONSTANTS.STATEMENT, operator, []);
        const operandDataType = OperationsUtil.longDataType(outcome.BASE_DTYPE);
        const left = new OperandMaker(baseFieldName, CONSTANTS.FIELD, operandDataType);
        const right = new OperandMaker(compareFieldName, CONSTANTS.FIELD, operandDataType);
        innerOperand.operands.push(left);
        innerOperand.operands.push(right);

        return new OutputAliasMaker(innerOperand, "");
    } else if (outcome.TYPE == CONSTANTS.outcomeType.RATIO) {
        const tradeBase = OperationsUtil.isTradeLevelCustomFieldCustomField(outcome.BASE_FIELD, customFields);
        const tradeCompare = OperationsUtil.isTradeLevelCustomFieldCustomField(outcome.COMPR_FIELD, customFields);
        let baseFieldName = OperationsUtil.getFieldBasedOnStructure(outcome.BASE_FTYPE, outcome.BASE_FIELD, outcome.masterKeyField);
        let compareFieldName = OperationsUtil.getFieldBasedOnStructure(outcome.COMPR_FTYPE, outcome.COMPR_FIELD, outcome.masterKeyField);
        let baseSplit = IFFHelper.splitIffField(baseFieldName, ".");
        const compareSplit = IFFHelper.splitIffField(compareFieldName, ".");

        if (tradeBase) {
            baseSplit = IFFHelper.splitIffField(outcome.BASE_FIELD, "$");
            baseFieldName = OperationsUtil.tradeCustomFieldName(baseSplit[1]) + "(obj)";
        } else if (isTradeLevelCustomField) {
            baseFieldName = "obj." + baseSplit[1];
        } else if (iffStructure && iffStructure.OCCURANCE == "N") {
            baseFieldName = "(" + baseSplit[0] + ")" + "[0]" + "." + baseSplit[1];
        }

        if (tradeCompare) {
            const compareSplit = IFFHelper.splitIffField( outcome.COMPR_FIELD, "$");
            compareFieldName =  OperationsUtil.tradeCustomFieldName(compareSplit[1]) + "(obj)";
        } else if (isTradeLevelCustomField) {
            compareFieldName = "obj." + compareSplit[1];
        } else if (iffStructureCompr && iffStructureCompr.OCCURANCE == "N") {
            compareFieldName = "(" + compareSplit[0] + ")" + "[0]" + "." + compareSplit[1];
        }

        const operator = OperationsUtil.operatorByStrOperation(outcome.TYPE);
        let ratioFormula;
        if (institutionId != 4011 && institutionId != 4001) {
            ratioFormula = CONSTANTS.PARSE_FLOAT + "(" + "((" + (baseFieldName + operator + compareFieldName) + ")" + "*100).toFixed(4))";
        } else {
            ratioFormula = CONSTANTS.PARSE_FLOAT + "(" +  "(" + (baseFieldName + operator + compareFieldName) + ")" + ".toFixed(4))";
        }

        const ratioExpression = new OperandMaker(ratioFormula, CONSTANTS.FIELD, "any");
        return new OutputAliasMaker(ratioExpression, "");
    } else if (outcome.TYPE == CONSTANTS.outcomeType.PRESENT_VAL) {
        let emiField =  OperationsUtil.getFieldBasedOnStructure(outcome.EMI_FTYPE, outcome.EMI_FIELD, outcome.masterKeyField);
        let roiField =  OperationsUtil.getFieldBasedOnStructure(outcome.ROI_FTYPE, outcome.ROI_FIELD, outcome.masterKeyField);
        let tenureField =  OperationsUtil.getFieldBasedOnStructure(outcome.TENURE_FTYPE, outcome.TENURE_FIELD, outcome.masterKeyField);

        if (isTradeLevelCustomField) {
            const emiSplit = IFFHelper.splitIffField(emiField, ".");
            const roiSplit = IFFHelper.splitIffField(roiField, ".");
            const tenureSplit  = IFFHelper.splitIffField(tenureField, ".");

            emiField = "obj." + emiSplit[1];
            roiField = "obj." + roiSplit[1];
            tenureField = "obj." + tenureSplit[1];
        } else {
            const emiIffStructure = IFFHelper.iffStructure(outcome.EMI_FTYPE, outcome.EMI_FIELD, iffData);
            const roiIffStructure = IFFHelper.iffStructure(outcome.ROI_FTYPE, outcome.ROI_FIELD, iffData);
            const tenureIffStructure = IFFHelper.iffStructure(outcome.TENURE_FTYPE, outcome.TENURE_FIELD, iffData);
            if (emiIffStructure && emiIffStructure.OCCURANCE == "N") {
                const emiSplit = IFFHelper.splitIffField(emiField, ".");
                emiField = `${emiSplit[0]}[0].${emiSplit[1]}`;
            }
            if (roiIffStructure && roiIffStructure.OCCURANCE == "N") {
                const roiSplit = IFFHelper.splitIffField(roiField, ".");
                roiField = `${roiSplit[0]}[0].${roiSplit[1]}`;
            }
            if (tenureIffStructure && tenureIffStructure.OCCURANCE == "N") {
                const tenureSplit = IFFHelper.splitIffField(tenureField, ".");
                tenureField = `${tenureSplit[0]}[0].${tenureSplit[1]}`;
            }
        }

        const type = 0;
        const FV = 0;
        const emiFormula =  "(((" + emiField + "* (1 + (" + roiField + "/12) *" + type + ")) * (((Math.pow(1 + (" + roiField + "/12)," + tenureField + ") - 1) / (" + roiField + "/ 12)) + " + FV + ")) / Math.pow(1 + (" + roiField + "/ 12)," + tenureField + "))";
        const emiExpression = new OperandMaker(emiFormula, CONSTANTS.FIELD, "any");

        return new OutputAliasMaker(emiExpression, "");
    } else {
        const customFieldDataType = OperationsUtil.longDataType(customField.FIELD_TYPE);
        const dataType = OperationsUtil.getValueType(CONSTANTS.VALUE, outcome.OUTCM_VALUE, customFieldDataType);
        return new OutputAliasMaker(new OperandMaker(outcome.OUTCM_VALUE, CONSTANTS.VALUE, dataType), "");
    }
};

export const tradeCustomFieldOutputAliasForDPD = (outcome, globalVar, globalDPD, hasDPDCalculations) => {
    const fieldName = OperationsUtil.getFieldBasedOnStructure(outcome.BASE_FTYPE, outcome.BASE_FIELD, outcome.masterKeyField);
    const split = IFFHelper.splitIffField(fieldName, ".");
    const innerOperand = new ExpressionMaker("", "", []);
    innerOperand.template = CONSTANTS.ARRAY_OPERATION;
    innerOperand.operator =  OperationsUtil.dpdFieldOperation(outcome.AGGR_OPRTR);

    let leftOperand;
    if (outcome.AGGR_OPRTR == CONSTANTS.dpdOutcome.MIN_DPD_DATE || outcome.AGGR_OPRTR == CONSTANTS.dpdOutcome.MAX_DPD_DATE) {
        split[1] = "paymentHistoryDateRanges";
    }

    if (hasDPDCalculations) {
        if (outcome.AGGR_OPRTR == CONSTANTS.dpdOutcome.MIN_DPD_DATE || outcome.AGGR_OPRTR == CONSTANTS.dpdOutcome.MAX_DPD_DATE) {
            split[1] = "paymentHistoryDateRanges";
        } else {
            if (StringUtil.notBlank(globalDPD)) {
                split[1] = split[1] + globalDPD;
            }
        }
        leftOperand = new OperandMaker(globalVar + "." + split[1], CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
    } else {
        if (outcome.AGGR_OPRTR == CONSTANTS.dpdOutcome.MAX_DPD_DATE || outcome.AGGR_OPRTR == CONSTANTS.dpdOutcome.MIN_DPD_DATE) {
            leftOperand = new OperandMaker("obj." + split[1], CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        } else {
            leftOperand = new OperandMaker(CONSTANTS.CONVERT_THREE_DIGIT_NUMBER_STRING_TO_NUMBER + "(obj." + split[1] + ")", CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        }
    }
    innerOperand.operands.push(leftOperand);

    if (outcome.AGGR_OPRTR == "MAX-DPD-VAL-0.5" || outcome.AGGR_OPRTR == "MIN-DPD-VAL-0.5")  {
        const dpd0_5Expression = new ExpressionMaker(CONSTANTS.NUMBER_OPERATION, "-", []);
        dpd0_5Expression.operands.push(innerOperand);
        const operand15 = new OperandMaker(CONSTANTS.DPD_DAYS_DIFFERENCE, CONSTANTS.VALUE, "number");
        dpd0_5Expression.operands.push(operand15);
        return new OutputAliasMaker(dpd0_5Expression, "");
    } else {
        return new OutputAliasMaker(innerOperand, "");
    }
};

export const handleAggregatedOutputOperations = (innerOperand, outcome, operandDataType, iffData) => {
    const aggegationDateOperations: any = [CONSTANTS.dateOperators.MAX_GAP_DAYS, CONSTANTS.dateOperators.MIN_GAP_DAYS, CONSTANTS.dateOperators.MAX_GAP_MONTHS, CONSTANTS.dateOperators.MIN_GAP_MONTHS, CONSTANTS.dateOperators.COUNT, CONSTANTS.dateOperators.COUNT_DIST, CONSTANTS.dateOperators.MIN, CONSTANTS.dateOperators.MAX];
    const aggegationNumberOperations: any = [CONSTANTS.numberOperators.AVERAGE, CONSTANTS.numberOperators.COUNT, CONSTANTS.numberOperators.COUNT_DIST, CONSTANTS.numberOperators.MAX, CONSTANTS.numberOperators.MIN];
    const aggegationStringOperations: any = [CONSTANTS.numberOperators.COUNT, CONSTANTS.numberOperators.COUNT_DIST];

    if (operandDataType == CONSTANTS.types.STRING && aggegationStringOperations.includes(innerOperand.operator)) {
        if (innerOperand.operator == CONSTANTS.numberOperators.COUNT) {
            innerOperand.operator = CONSTANTS.operators.FILTER;
        } else {
            innerOperand.operator = CONSTANTS.operators.MAP;
        }
        const aggregateOperand = new ExpressionMaker( "", "", []);
        aggregateOperand.template  = CONSTANTS.ARRAY_OPERATION;
        aggregateOperand.operator = OperationsUtil.operation(operandDataType, "", outcome.AGGR_OPRTR);
        aggregateOperand.operands.push(innerOperand);

        return aggregateOperand;
    } else if (operandDataType == CONSTANTS.types.INTEGER && aggegationNumberOperations.includes(innerOperand.operator)) {
        if (innerOperand.operator == CONSTANTS.numberOperators.COUNT) {
            innerOperand.operator = CONSTANTS.operators.FILTER;
        } else {
            innerOperand.operator = CONSTANTS.operators.MAP;
        }

        const aggregateOperand = new ExpressionMaker( "", "", []);
        aggregateOperand.template  = CONSTANTS.ARRAY_OPERATION;
        aggregateOperand.operator = OperationsUtil.operation(operandDataType, "", outcome.AGGR_OPRTR);
        aggregateOperand.operands.push(innerOperand);

        return aggregateOperand;
    } else if (operandDataType == CONSTANTS.types.DATE && aggegationDateOperations.includes(innerOperand.operator)) {
        const aggeDateOper: any = [CONSTANTS.MIN_DIFF_DAYS, CONSTANTS.MAX_DIFF_DAYS, CONSTANTS.MAX_DIFF_MONTH, CONSTANTS.MIN_DIFF_MONTH];
        let comprField;
        if(StringUtil.toLowerCase(outcome.AGGR_TYPE) == CONSTANTS.VALUE) {
            comprField = OperationsUtil.getValue(CONSTANTS.VALUE, outcome.COMPR_VALUE, operandDataType)
        } else {
            comprField = OperationsUtil.getFieldBasedOnStructure(outcome.COMPR_FTYPE, outcome.COMPR_FIELD, outcome.masterKeyField);
        }

        const splitCompr = IFFHelper.splitIffField(comprField, ".");
        const iffStructure = IFFHelper.iffStructure(outcome.BASE_FTYPE, outcome.BASE_FIELD, iffData);
        const iffStructureCompr = IFFHelper.iffStructure(outcome.COMPR_FTYPE, outcome.COMPR_FIELD, iffData);
        if (innerOperand.operator == CONSTANTS.dateOperators.COUNT) {
            innerOperand.operator = CONSTANTS.operators.FILTER;
        } else {
            innerOperand.operator = CONSTANTS.operators.MAP;
        }

        const aggregateOperand = new ExpressionMaker("", "", []);
        aggregateOperand.template = CONSTANTS.ARRAY_OPERATION;
        aggregateOperand.operator = OperationsUtil.operation(operandDataType, "", outcome.AGGR_OPRTR);

        if (aggeDateOper.includes(outcome.AGGR_OPRTR)) {
            const aggregateInnerLeftOperands = innerOperand.operands.pop();
            const aggregateInnerExpression = new ExpressionMaker("", "", []);
            aggregateInnerExpression.template = CONSTANTS.DATE_OPERATION;

            if (outcome.AGGR_OPRTR == CONSTANTS.MIN_DIFF_DAYS || outcome.AGGR_OPRTR == CONSTANTS.MAX_DIFF_DAYS) {
                aggregateInnerExpression.operator = CONSTANTS.dateOperators.DIFF_DAYS;
            } else if (outcome.AGGR_OPRTR == CONSTANTS.MIN_DIFF_MONTH || CONSTANTS.MAX_DIFF_MONTH) {
                aggregateInnerExpression.operator = CONSTANTS.dateOperators.DIFF_MONTHS;
            }
            let aggregateInnerRightOperands;

            if (iffStructureCompr && iffStructureCompr.OCCURANCE == "N") {
                aggregateInnerRightOperands = new OperandMaker("obj." + splitCompr[1], CONSTANTS.FIELD, operandDataType, iffStructureCompr.DATE_TYPE && iffStructureCompr.DATE_TYPE.toUpperCase());
            } else {
                const dateType = (iffStructureCompr && iffStructureCompr.DATE_TYPE) ? iffStructureCompr.DATE_TYPE.toUpperCase() : CONSTANTS.DATE_FROMAT2;
                aggregateInnerRightOperands = new OperandMaker(comprField, StringUtil.toLowerCase(outcome.AGGR_TYPE), operandDataType, dateType);
            }

            aggregateInnerExpression.operands.push(aggregateInnerLeftOperands);
            aggregateInnerExpression.operands.push(aggregateInnerRightOperands);
            innerOperand.operands.push(aggregateInnerExpression);
        }

        if (outcome.AGGR_OPRTR == "MAXIMUM" || outcome.AGGR_OPRTR == "MINIMUM") {
            aggregateOperand.operator = (outcome.AGGR_OPRTR == "MAXIMUM") ? "dateMax" : "dateMin";
        }

        aggregateOperand.operands.push(innerOperand);

        return aggregateOperand;
    } else {
        return innerOperand;
    }
};

export const customFieldOutputAliasForArrayCondition = (fieldType, outcome, institutionId, globalVar, globalDPD, customFields, iffData) => {
    const constArray: any = [CONSTANTS.outcomeType.MULTIPLICATION, CONSTANTS.outcomeType.DIVISION, CONSTANTS.outcomeType.ADDITION, CONSTANTS.outcomeType.DIFFERENCE];
    const aggeDateOper: any = [CONSTANTS.MIN_DIFF_DAYS, CONSTANTS.MAX_DIFF_DAYS, CONSTANTS.MAX_DIFF_MONTH, CONSTANTS.MIN_DIFF_MONTH];
    const customFieldDataType = OperationsUtil.longDataType(fieldType);
    const iffStructure = IFFHelper.iffStructure(outcome.BASE_FTYPE, outcome.BASE_FIELD, iffData);
    const iffStructureCompr = IFFHelper.iffStructure(outcome.COMPR_FTYPE, outcome.COMPR_FIELD, iffData);
    const isTradeLevelBaseField = OperationsUtil.isTradeLevelCustomFieldCustomField(outcome.BASE_FIELD, customFields);
    const isTradeLevelCompareField = OperationsUtil.isTradeLevelCustomFieldCustomField(outcome.COMPR_FIELD, customFields);
    let outcomeDType = iffStructure ? iffStructure.FIELD_TYPE : outcome.BASE_DTYPE;
    const operandDataType = OperationsUtil.longDataType(outcomeDType);
    let dateFormat = CONSTANTS.DATE_FROMAT2;

    if(operandDataType == CONSTANTS.types.DATE && isTradeLevelBaseField) {
        const baseField = tradeLevelBaseField(outcome.BASE_FIELD, outcome.BASE_FTYPE, customFields, iffData);
        const tradeFieldIffStructure = IFFHelper.iffStructure(CONSTANTS.IFF_STRUCTURE, baseField, iffData);
        const baseSplit = IFFHelper.splitIffField(baseField, "$");

        if(tradeFieldIffStructure && tradeFieldIffStructure.FIELD_TYPE == "D" && tradeFieldIffStructure.DATE_TYPE) {
            dateFormat = tradeFieldIffStructure.DATE_TYPE.toUpperCase() ;
        } else if(tradeFieldIffStructure && StringUtil.toLowerCase(tradeFieldIffStructure.FIELD_TYPE) == CONSTANTS.types.DPD && tradeFieldIffStructure.DATE_TYPE) {
            const paymentStartDateField = `${baseSplit[0]}$${CONSTANTS.PAYMENT_HIST_START_DATE}`;
            const paymentStartDateIffStructure = IFFHelper.iffStructure(CONSTANTS.IFF_STRUCTURE, paymentStartDateField, iffData);
            if(paymentStartDateIffStructure && paymentStartDateIffStructure.DATE_TYPE) {
                dateFormat = paymentStartDateIffStructure.DATE_TYPE.toUpperCase() ;
            }
        }
    } else if (iffStructure && iffStructure.FIELD_TYPE == "D") {
        dateFormat = (iffStructure && iffStructure.DATE_TYPE) ? iffStructure.DATE_TYPE.toUpperCase() : CONSTANTS.DATE_FROMAT2;
    }


    if (outcome.TYPE == CONSTANTS.outcomeType.FIELD && outcome.AGGR_OPRTR != CONSTANTS.operators.VALUE_OF) {
        const innerOperand = new ExpressionMaker("", "", []);
        const fieldName = OperationsUtil.getFieldBasedOnStructure(outcome.BASE_FTYPE, outcome.BASE_FIELD, outcome.masterKeyField);

        if (StringUtil.toLowerCase(outcome.BASE_DTYPE) == CONSTANTS.types.DPD) {
            const fieldName = OperationsUtil.getFieldBasedOnStructure(outcome.BASE_FTYPE, outcome.BASE_FIELD, outcome.masterKeyField);
            const split = IFFHelper.splitIffField(fieldName, ".");
            innerOperand.template = CONSTANTS.ARRAY_OPERATION;
            innerOperand.operator =  OperationsUtil.dpdFieldOperation(outcome.AGGR_OPRTR);

            const rightExpression = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.FLATMAP, []);
            const leftOperand = new OperandMaker(globalVar, CONSTANTS.FIELD, "array");
            rightExpression.operands.push(leftOperand);
            let rightOperand;
            if (outcome.AGGR_OPRTR == CONSTANTS.dpdOutcome.MAX_DPD_DATE || outcome.AGGR_OPRTR == CONSTANTS.dpdOutcome.MIN_DPD_DATE) {
                rightOperand = new OperandMaker("obj." + "paymentHistoryDateRanges", CONSTANTS.FIELD, "array");
            } else {
                if (StringUtil.notBlank(globalDPD)) {
                    rightOperand = new OperandMaker(CONSTANTS.CONVERT_THREE_DIGIT_NUMBER_STRING_TO_NUMBER + "(obj." + split[1] + globalDPD + ")", CONSTANTS.FIELD, "array");
                } else {
                    rightOperand = new OperandMaker(CONSTANTS.CONVERT_THREE_DIGIT_NUMBER_STRING_TO_NUMBER + "(obj." + split[1] + ")", CONSTANTS.FIELD, "array");
                }
            }
            rightExpression.operands.push(rightOperand);
            innerOperand.operands.push(rightExpression);

            if (outcome.AGGR_OPRTR == "MAX-DPD-VAL-0.5" || outcome.AGGR_OPRTR == "MIN-DPD-VAL-0.5")  {
                const dpd0_5Expression = new ExpressionMaker(CONSTANTS.NUMBER_OPERATION, "-", []);
                dpd0_5Expression.operands.push(innerOperand);
                const operand15 = new OperandMaker(CONSTANTS.DPD_DAYS_DIFFERENCE, CONSTANTS.VALUE, "number");
                dpd0_5Expression.operands.push(operand15);
                return new OutputAliasMaker(dpd0_5Expression, "");
            } else {
                return new OutputAliasMaker(innerOperand, "");
            }
        } else if ((iffStructure && iffStructure.OCCURANCE == "N") || (iffStructureCompr && iffStructureCompr.OCCURANCE == "N") || isTradeLevelBaseField) {
            innerOperand.template = CONSTANTS.ARRAY_OPERATION;
            innerOperand.operator =  OperationsUtil.operation(operandDataType, "", outcome.AGGR_OPRTR);
            const left = new OperandMaker(globalVar, CONSTANTS.FIELD, operandDataType);
            innerOperand.operands.push(left);

            if (isTradeLevelBaseField) {
                const split = IFFHelper.splitIffField(outcome.BASE_FIELD, "$");
                const right = new OperandMaker(OperationsUtil.tradeCustomFieldName(split[1]) + "(obj)", CONSTANTS.FIELD, operandDataType);
                if(operandDataType == CONSTANTS.types.DATE) {
                    right.dateType = dateFormat;
                }
                innerOperand.operands.push(right);
            } else {
                const split = IFFHelper.splitIffField(fieldName, ".");
                let right;
                if (iffStructure && iffStructure.OCCURANCE == "N") {
                    right = new OperandMaker("obj." + split[1], CONSTANTS.FIELD, operandDataType);
                } else {
                    right = new OperandMaker(fieldName, CONSTANTS.FIELD, operandDataType);
                }

                if (operandDataType == CONSTANTS.types.DATE) {
                    right.dateType = StringUtil.getDateTypeFromIffOrDefault(iffStructure, CONSTANTS.DATE_FROMAT2);
                }
                innerOperand.operands.push(right);
            }
            const newInnerOperand = handleAggregatedOutputOperations(innerOperand, outcome, operandDataType, iffData);
            return new OutputAliasMaker(newInnerOperand, "");
        } else {
            if (aggeDateOper.includes(outcome.AGGR_OPRTR)) {
                innerOperand.template = CONSTANTS.DATE_OPERATION;
                innerOperand.operator =  OperationsUtil.operation(operandDataType, "", outcome.AGGR_OPRTR);
                if (outcome.AGGR_OPRTR == CONSTANTS.MIN_DIFF_DAYS || outcome.AGGR_OPRTR == CONSTANTS.MAX_DIFF_DAYS) {
                    innerOperand.operator = CONSTANTS.dateOperators.DIFF_DAYS;
                } else if (outcome.AGGR_OPRTR == CONSTANTS.MIN_DIFF_MONTH || CONSTANTS.MAX_DIFF_MONTH) {
                    innerOperand.operator = CONSTANTS.dateOperators.DIFF_MONTHS;
                }

                const split = IFFHelper.splitIffField(fieldName, ".");
                const left = new OperandMaker(fieldName, CONSTANTS.FIELD, operandDataType);
                left.dateType = StringUtil.getDateTypeFromIffOrDefault(iffStructure, CONSTANTS.DATE_FROMAT2);
                innerOperand.operands.push(left);

                const comprField = OperationsUtil.getFieldBasedOnStructure(outcome.COMPR_FTYPE, outcome.COMPR_FIELD, outcome.masterKeyField);
                const right = new OperandMaker(comprField, CONSTANTS.FIELD, operandDataType, "");

                if(outcome.COMPR_FTYPE == CONSTANTS.CUSTOM) {
                    let baseField = summaryLevelBaseField(outcome.COMPR_FIELD, outcome.COMPR_FTYPE, customFields, iffData);
                    let iffStuctureBase = IFFHelper.iffStructure(CONSTANTS.IFF_STRUCTURE, baseField, iffData);
                    right.dateType = iffStuctureBase && iffStuctureBase.DATE_TYPE ? iffStuctureBase.DATE_TYPE.toUpperCase() : CONSTANTS.DATE_FROMAT2;
                } else {
                    right.dateType = iffStructureCompr && iffStructureCompr.DATE_TYPE ? iffStructureCompr.DATE_TYPE.toUpperCase() : CONSTANTS.DATE_FROMAT2;
                }

                innerOperand.operands.push(right);
                return new OutputAliasMaker(innerOperand, "");
            } else {
                return new OutputAliasMaker(new OperandMaker(fieldName, CONSTANTS.FIELD, customFieldDataType), "");
            }
        }
    } else if (outcome.TYPE == CONSTANTS.outcomeType.FIELD && outcome.AGGR_OPRTR == CONSTANTS.operators.VALUE_OF) {
        if (iffStructure && iffStructure.OCCURANCE == "N") {
            const fieldName = OperationsUtil.getFieldBasedOnStructure(outcome.BASE_FTYPE, outcome.BASE_FIELD, outcome.masterKeyField);
            const split = IFFHelper.splitIffField(fieldName, ".");

            return new OutputAliasMaker(new OperandMaker(globalVar + "[0]." + split[1], CONSTANTS.FIELD, customFieldDataType), "");
        } else {
            if (isTradeLevelBaseField) {
                const split = IFFHelper.splitIffField(outcome.BASE_FIELD, "$");
                const tradeFieldName = OperationsUtil.tradeCustomFieldName(split[1]);
                const operand = tradeFieldName + "(" + globalVar + "[0]" + ")";
                const outcomeOperand = new OperandMaker(operand, CONSTANTS.FIELD, customFieldDataType);
                if(operandDataType == CONSTANTS.types.DATE) {
                    outcomeOperand.dateType = dateFormat;
                }
                return new OutputAliasMaker(outcomeOperand, "");
            } else {
                const fieldName = OperationsUtil.getFieldBasedOnStructure(outcome.BASE_FTYPE, outcome.BASE_FIELD, outcome.masterKeyField);
                return new OutputAliasMaker(new OperandMaker(fieldName, CONSTANTS.FIELD, customFieldDataType), "");
            }
        }
    } else if (constArray.includes(outcome.TYPE)) {
        const baseFieldName = OperationsUtil.getFieldBasedOnStructure(outcome.BASE_FTYPE, outcome.BASE_FIELD, outcome.masterKeyField);
        const compareFieldName = OperationsUtil.getFieldBasedOnStructure(outcome.COMPR_FTYPE, outcome.COMPR_FIELD, outcome.masterKeyField);
        const operator = OperationsUtil.operatorByStrOperation(outcome.TYPE);
        const innerOperand = new ExpressionMaker(CONSTANTS.STATEMENT, operator, []);
        const operandDataType = OperationsUtil.longDataType(outcome.BASE_DTYPE);
        const left = new OperandMaker(baseFieldName, CONSTANTS.FIELD, operandDataType);
        const right = new OperandMaker(compareFieldName, CONSTANTS.FIELD, operandDataType);
        innerOperand.operands.push(left);
        innerOperand.operands.push(right);

        return new OutputAliasMaker(innerOperand, "");
    } else if (outcome.TYPE == CONSTANTS.outcomeType.RATIO) {
        let baseFieldName = OperationsUtil.getFieldBasedOnStructure(outcome.BASE_FTYPE, outcome.BASE_FIELD, outcome.masterKeyField);
        let compareFieldName = OperationsUtil.getFieldBasedOnStructure(outcome.COMPR_FTYPE, outcome.COMPR_FIELD, outcome.masterKeyField);
        let baseSplit = IFFHelper.splitIffField(baseFieldName, ".");
        const compareSplit = IFFHelper.splitIffField(compareFieldName, ".");

        if (isTradeLevelBaseField) {
            baseSplit = IFFHelper.splitIffField(outcome.BASE_FIELD, "$");
            baseFieldName = OperationsUtil.tradeCustomFieldName(baseSplit[1]) + "(obj)";
        } else if (iffStructure && iffStructure.OCCURANCE == "N") {
            baseFieldName = "(" + baseSplit[0] + ")" + "[0]" + "." + baseSplit[1];
        }

        if (isTradeLevelCompareField) {
            const compareSplit = IFFHelper.splitIffField( outcome.COMPR_FIELD, "$");
            compareFieldName =  OperationsUtil.tradeCustomFieldName(compareSplit[1]) + "(obj)";
        } else if (iffStructureCompr && iffStructureCompr.OCCURANCE == "N") {
            compareFieldName = "(" + compareSplit[0] + ")" + "[0]" + "." + compareSplit[1];
        }

        const operator = OperationsUtil.operatorByStrOperation(outcome.TYPE);
        let ratioFormula;
        if (institutionId != 4011 && institutionId != 4001) {
            ratioFormula = CONSTANTS.PARSE_FLOAT + "(" + "((" + (baseFieldName + operator + compareFieldName) + ")" + "*100).toFixed(4))";
        } else {
            ratioFormula = CONSTANTS.PARSE_FLOAT + "(" + "(" + (baseFieldName + operator + compareFieldName) + ")" + ".toFixed(4))";
        }

        const ratioExpression = new OperandMaker(ratioFormula, CONSTANTS.FIELD, "any");
        return new OutputAliasMaker(ratioExpression, "");
    } else if (outcome.TYPE == CONSTANTS.outcomeType.PRESENT_VAL) {
        let emiField =  OperationsUtil.getFieldBasedOnStructure(outcome.EMI_FTYPE, outcome.EMI_FIELD, outcome.masterKeyField);
        let roiField =  OperationsUtil.getFieldBasedOnStructure(outcome.ROI_FTYPE, outcome.ROI_FIELD, outcome.masterKeyField);
        let tenureField =  OperationsUtil.getFieldBasedOnStructure(outcome.TENURE_FTYPE, outcome.TENURE_FIELD, outcome.masterKeyField);

        const emiIffStructure = IFFHelper.iffStructure(outcome.EMI_FTYPE, outcome.EMI_FIELD, iffData);
        const roiIffStructure = IFFHelper.iffStructure(outcome.ROI_FTYPE, outcome.ROI_FIELD, iffData);
        const tenureIffStructure = IFFHelper.iffStructure(outcome.TENURE_FTYPE, outcome.TENURE_FIELD, iffData);
        if (emiIffStructure && emiIffStructure.OCCURANCE == "N") {
            const emiSplit = IFFHelper.splitIffField(emiField, ".");
            emiField = `${emiSplit[0]}[0].${emiSplit[1]}`;
        }
        if (roiIffStructure && roiIffStructure.OCCURANCE == "N") {
            const roiSplit = IFFHelper.splitIffField(roiField, ".");
            roiField = `${roiSplit[0]}[0].${roiSplit[1]}`;
        }
        if (tenureIffStructure && tenureIffStructure.OCCURANCE == "N") {
            const tenureSplit = IFFHelper.splitIffField(tenureField, ".");
            tenureField = `${tenureSplit[0]}[0].${tenureSplit[1]}`;
        }

        const type = 0;
        const FV = 0;
        const emiFormula =  "(((" + emiField + "* (1 + (" + roiField + "/12) *" + type + ")) * (((Math.pow(1 + (" + roiField + "/12)," + tenureField + ") - 1) / (" + roiField + "/ 12)) + " + FV + ")) / Math.pow(1 + (" + roiField + "/ 12)," + tenureField + "))";
        const emiExpression = new OperandMaker(emiFormula, CONSTANTS.FIELD, customFieldDataType);

        return new OutputAliasMaker(emiExpression, "");
    } else {
        const dataType = OperationsUtil.getValueType(CONSTANTS.VALUE, outcome.OUTCM_VALUE, customFieldDataType);
        return new OutputAliasMaker(new OperandMaker(outcome.OUTCM_VALUE, CONSTANTS.VALUE, dataType), "");
    }
};

export const prepareDPDConditionOperands = (rule, globalDPD, globalDPDVar, isFromTradeLevel, iffData) => {
    const split = IFFHelper.splitIffField(rule.fieldname, "$");
    if (isFromTradeLevel) {
        const innerOperand = new ExpressionMaker(CONSTANTS.NUMBER_OPERATION, ">", []);
        const rightExpression = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.SIZE, []);
        innerOperand.operands.push(rightExpression);
        const leftOperand = new OperandMaker(globalDPDVar + "." + split[1] + globalDPD, CONSTANTS.FIELD, "array");
        rightExpression.operands.push(leftOperand);
        const rightExpressionRight = new OperandMaker("0", CONSTANTS.VALUE, "number");
        innerOperand.operands.push(rightExpressionRight);
        return innerOperand;
    } else {
        const innerOperand = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.FILTER, []);
        const leftOperand = new OperandMaker(globalDPDVar, CONSTANTS.FIELD, "array");
        innerOperand.operands.push(leftOperand);
        const rightExpression = new ExpressionMaker(CONSTANTS.NUMBER_OPERATION, ">", []);
        innerOperand.operands.push(rightExpression);
        const rightExpressionLeft = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.SIZE, []);
        const rightExpressionOperand = new OperandMaker("obj." + split[1] + globalDPD, CONSTANTS.FIELD, "array");
        rightExpressionLeft.operands.push(rightExpressionOperand);
        rightExpression.operands.push(rightExpressionLeft);
        const rightExpressionRight = new OperandMaker("0", CONSTANTS.VALUE, "number");
        rightExpression.operands.push(rightExpressionRight);
        return innerOperand;
    }
};

export const prepareOperands = (rule, isCustomFieldOutputAliasFieldAndArray, tradeFieldName, globalDPDVar, iffData) => {
    const iffStructure = IFFHelper.iffStructure(CONSTANTS.IFF_STRUCTURE, tradeFieldName, iffData);
    const tradeField = OperationsUtil.getFieldBasedOnStructure(CONSTANTS.IFF_STRUCTURE, tradeFieldName, rule.masterKeyField);

    const innerOperand = new ExpressionMaker( "", "", []);
    const operandDataType = OperationsUtil.longDataType(rule.DType);
    innerOperand.template = OperationsUtil.getTemplate(operandDataType, CONSTANTS.STATEMENT);
    innerOperand.operator = OperationsUtil.operation(operandDataType, rule.exp1, rule.exp2);
    const splitCustomField = IFFHelper.splitIffField(rule.fieldname, "$");
    let dateFormat = CONSTANTS.DATE_FROMAT2;

    if(operandDataType == CONSTANTS.types.DATE && iffStructure && StringUtil.toLowerCase(iffStructure.FIELD_TYPE) == CONSTANTS.types.DPD) {
        const tradeFieldIffStructure = IFFHelper.iffStructure(CONSTANTS.IFF_STRUCTURE, tradeFieldName, iffData);

        const baseSplit = IFFHelper.splitIffField(tradeFieldName, "$");
        const paymentStartDateField = `${baseSplit[0]}$${CONSTANTS.PAYMENT_HIST_START_DATE}`;
        const paymentStartDateIffStructure = IFFHelper.iffStructure(CONSTANTS.IFF_STRUCTURE, paymentStartDateField, iffData);
        if(paymentStartDateIffStructure && paymentStartDateIffStructure.DATE_TYPE) {
            dateFormat = paymentStartDateIffStructure.DATE_TYPE.toUpperCase() ;
        }
    } else if (iffStructure && iffStructure.FIELD_TYPE == "D") {
        dateFormat = (iffStructure && iffStructure.DATE_TYPE) ? iffStructure.DATE_TYPE.toUpperCase() : CONSTANTS.DATE_FROMAT2;
    }

    if ((operandDataType == CONSTANTS.types.INTEGER || operandDataType == CONSTANTS.types.DATE) && StringUtil.notBlank(rule.val1) && StringUtil.notBlank(rule.exp1)) {
        const split = IFFHelper.splitIffField(tradeField, ".");
        if (StringUtil.notBlank(globalDPDVar)) {
            split[0] = globalDPDVar;
        }

        innerOperand.template = CONSTANTS.ARRAY_OPERATION;
        if (isCustomFieldOutputAliasFieldAndArray) {
            innerOperand.operator = CONSTANTS.operators.FILTER;
        } else {
            innerOperand.operator = CONSTANTS.operators.SOME;
        }

        const left = new OperandMaker(split[0], CONSTANTS.FIELD, "array");
        const right = new ExpressionMaker( "", "", []);
        right.template = OperationsUtil.getTemplate(operandDataType, CONSTANTS.STATEMENT);
        right.operator = OperationsUtil.operation(operandDataType, rule.exp1, rule.exp2);

        const leftOperand = OperationsUtil.getValue(rule.ExpType, rule.val1, operandDataType);
        const rightOperand = OperationsUtil.getValue(rule.ExpType, rule.val2,  operandDataType);
        const innerLeftOperand = new OperandMaker(OperationsUtil.minValueByDataType(leftOperand, rightOperand, operandDataType), StringUtil.toLowerCase(rule.ExpType), operandDataType);
        const innerMiddleOperand = new OperandMaker(OperationsUtil.tradeCustomFieldName(splitCustomField[1]) + "(obj)", CONSTANTS.FIELD, operandDataType );
        const innerRightOperand = new OperandMaker(OperationsUtil.maxValueByDataType(leftOperand, rightOperand, operandDataType), StringUtil.toLowerCase(rule.ExpType), operandDataType);

        if (operandDataType == CONSTANTS.types.DATE) {
            innerLeftOperand.dateType = dateFormat;
            innerMiddleOperand.dateType = dateFormat;
            innerRightOperand.dateType = dateFormat;

            if (StringUtil.toLowerCase(rule.ExpType) == CONSTANTS.VALUE) {
                innerLeftOperand.dateType = CONSTANTS.DATE_FROMAT1;
                innerRightOperand.dateType = CONSTANTS.DATE_FROMAT1;
            }
        }

        right.operands.push(innerLeftOperand);
        right.operands.push(innerMiddleOperand);
        right.operands.push(innerRightOperand);

        innerOperand.operands.push(left);
        innerOperand.operands.push(right);
    } else {
        const split = IFFHelper.splitIffField(tradeField, ".");
        innerOperand.template = CONSTANTS.ARRAY_OPERATION;
        if (isCustomFieldOutputAliasFieldAndArray) {
            innerOperand.operator = CONSTANTS.operators.FILTER;
        } else {
            innerOperand.operator = CONSTANTS.operators.SOME;
        }

        if (StringUtil.notBlank(globalDPDVar)) {
            split[0] = globalDPDVar;
        }

        const left = new OperandMaker(split[0], CONSTANTS.FIELD, "array");
        const right = new ExpressionMaker( "", "", []);
        right.template = OperationsUtil.getTemplate(operandDataType, CONSTANTS.STATEMENT);
        right.operator = OperationsUtil.operation(operandDataType, rule.exp1, rule.exp2);

        const innerLeftOperand = new OperandMaker(OperationsUtil.tradeCustomFieldName(splitCustomField[1]) + "(obj)", CONSTANTS.FIELD, operandDataType);
        const innerRightOperand = new OperandMaker(OperationsUtil.getValue(rule.ExpType, rule.val2,  operandDataType), StringUtil.toLowerCase(rule.ExpType), operandDataType);

        if (operandDataType == CONSTANTS.types.DATE) {
            innerLeftOperand.dateType = dateFormat;
            innerRightOperand.dateType = dateFormat;

            if (StringUtil.toLowerCase(rule.exp2) == CONSTANTS.DIFF_MONTH || StringUtil.toLowerCase(rule.exp2) == CONSTANTS.DIFF_DAYS) {
                const innerExpression = new ExpressionMaker(CONSTANTS.NUMBER_OPERATION, rule.DiffOpr, []);
                const numberOperand = new OperandMaker(rule.Difference, CONSTANTS.VALUE, "number");
                right.operands.push(innerLeftOperand);
                right.operands.push(innerRightOperand);
                innerExpression.operands.push(right);
                innerExpression.operands.push(numberOperand);
                innerOperand.operands.push(left);
                innerOperand.operands.push(innerExpression);
            } else {
                right.operands.push(innerLeftOperand);
                right.operands.push(innerRightOperand);

                innerOperand.operands.push(left);
                innerOperand.operands.push(right);
            }
        } else {
            right.operands.push(innerLeftOperand);
            right.operands.push(innerRightOperand);

            innerOperand.operands.push(left);
            innerOperand.operands.push(right);
        }
    }
    return innerOperand;
};

export const tradeLevelBaseField = (fieldname, fType, policyCustomFields, iffData, isTrade = false) => {
    if (StringUtil.toUpperCase(fType) == CONSTANTS.CUSTOM) {
        if (OperationsUtil.isTradeLevelCustomFieldCustomField(fieldname, policyCustomFields)) {
            const splitted = fieldname.split("$");
            let customField;
            if(isTrade) {
                customField =  policyCustomFields.filter((el) => el.FIELD_NAME == splitted[1])[0];
            } else {
                customField =  policyCustomFields.filter((el) => el.FIELD_NAME == splitted[1] && el.LEVEL && el.LEVEL.toLowerCase() == "trade")[0];
            }
            const r = (customField.RULES.map((a) => a.Condition))[0][0];

            return tradeLevelBaseField(r.fieldname, r.FType, policyCustomFields, iffData, isTrade);
        } else {
            return "";
        }
    } else {
        return fieldname;
    }
};

export const summaryLevelBaseField = (fieldname, fType, policyCustomFields, iffData) => {
    if (StringUtil.toUpperCase(fType) == CONSTANTS.CUSTOM) {
        const splitted = fieldname.split("$");
        const customField =  policyCustomFields.filter((el) => el.FIELD_NAME == splitted[1])[0];
        const r = (customField && customField.RULES.map((a) => a.Condition))[0][0];

        if(r && r.fieldname ) {
            return summaryLevelBaseField(r.fieldname, r.FType, policyCustomFields, iffData);
        } else {
            return "";
        }
    } else {
        return fieldname;
    }
};

export const isCustomFieldConditionOutputArray = (rule, outcome, policyCustomFields, iffData) => {
    let isFirstOperationArray = false;
    if (StringUtil.toUpperCase(rule.FType) == CONSTANTS.CUSTOM) {
        if (OperationsUtil.isTradeLevelCustomFieldCustomField(rule.fieldname, policyCustomFields)) {
            isFirstOperationArray = true;
        } else {
            const iffStructure = IFFHelper.iffStructure(rule.FType, rule.fieldname, iffData);
            if (iffStructure && iffStructure.OCCURANCE == "N") {
                isFirstOperationArray = true;
            }
        }
    } else if (rule.FType == CONSTANTS.MASTER_STRUCTURE) {
        isFirstOperationArray = false;
    } else {
        const iffStructure = IFFHelper.iffStructure(rule.FType, rule.fieldname, iffData);
        if (iffStructure && iffStructure.OCCURANCE == "N") {
            isFirstOperationArray =  true;
        }
    }
    return isFirstOperationArray;
};

export const isCustomFieldMultiArray = (condition, outcome, policyCustomFields, iffData) => {
    let isCustomFieldMultiArray = false;
    let nonArrayOutcome:any = ["value"];
    let result = [];
    if(nonArrayOutcome.includes(StringUtil.toLowerCase(outcome.TYPE))) {
        for (let conditionCount = 0; conditionCount < condition.length; conditionCount++) {
            const rule = condition[conditionCount];
            if(conditionCount == 0) {
                isCustomFieldMultiArray = isCustomFieldConditionOutputArray(rule, outcome, policyCustomFields, iffData);
            }
            const baseField = summaryLevelBaseField(rule.fieldname, rule.FType, policyCustomFields, iffData);
            const split = IFFHelper.splitIffField(baseField, "$");
            const iffStructure = IFFHelper.iffStructure(CONSTANTS.IFF_STRUCTURE, baseField, iffData);

            if(iffStructure && iffStructure.OCCURANCE == "N"){
                result.push( split[0] );
            } else {
                return false;
            }
        }
    }
    let areSameElements = result.every( v => v === result[0] );
    return isCustomFieldMultiArray && !areSameElements;
};

export const generateOutComeOnlyDateDPDExpressions = (globalDPDVar, dpdVar, outcome, isFromTradeLevelCustomField, iffData) => {
    const field = OperationsUtil.getFieldBasedOnStructure(outcome.BASE_FTYPE, outcome.BASE_FIELD, "");

    const paymentStartDateOperand = new OperandMaker(CONSTANTS.PAYMENT_HIST_START_DATE, CONSTANTS.FIELD, CONSTANTS.types.DATE, CONSTANTS.DATE_FROMAT2);
    const baseSplit = IFFHelper.splitIffField(outcome.BASE_FIELD, "$");
    const paymentStartDateField = `${baseSplit[0]}$${CONSTANTS.PAYMENT_HIST_START_DATE}`;
    const iffPaymentStartDate = IFFHelper.iffStructure(CONSTANTS.IFF_STRUCTURE, paymentStartDateField, iffData);
    if (iffPaymentStartDate && iffPaymentStartDate.FIELD_TYPE == "D") {
        paymentStartDateOperand.dateType = iffPaymentStartDate.DATE_TYPE;
    }

    const split = IFFHelper.splitIffField(field, ".");
    const expression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
    const left = new OperandMaker(globalDPDVar, CONSTANTS.FIELD, "array");
    expression.operands.push(left);
    const right = new ExpressionMaker(CONSTANTS.ARRAY_THREE_DIGIT_DATE_TO_DATE_OPERATION, "", []);
    expression.operands.push(right);

    const rightOperand1 = new OperandMaker(split[1] + dpdVar, CONSTANTS.FIELD, "string");
    right.operands.push(rightOperand1);

    const rightOperand2 = new OperandMaker(split[1], CONSTANTS.FIELD, "string");
    right.operands.push(rightOperand2);

    const rightOperand3 = new OperandMaker(String(isFromTradeLevelCustomField), CONSTANTS.FIELD, "string");
    right.operands.push(rightOperand3);

    const rightOperand4 = new OperandMaker(split[0], CONSTANTS.FIELD, "string");
    right.operands.push(rightOperand4);

    right.operands.push(paymentStartDateOperand);
    return expression;
};

export const dpdOperands = (dpd) => {
    let leftSlice, rightSlice;
    if (dpd.DiffOpr == "<=") {
        leftSlice = 0;
        rightSlice = dpd.Difference;
    } else if (dpd.DiffOpr == "<") {
        leftSlice = 0;
        rightSlice = dpd.Difference - 1;
    } else if (dpd.DiffOpr == ">=") {
        leftSlice = dpd.Difference - 1;
        rightSlice = 999;
    } else if (dpd.DiffOpr == ">") {
        leftSlice = dpd.Difference;
        rightSlice = 999;
    } else {
        leftSlice = dpd.Difference;
        rightSlice = dpd.Difference;
    }
    return [leftSlice, rightSlice]
};

export const dpdValueExpression = (dpdValue, dpdOperator) => {
    const valExpression = new ExpressionMaker(CONSTANTS.STATEMENT, dpdOperator, []);
    for (let j = 0; j < dpdValue.length; j++) {
        const dpdVal = dpdValue[j];
        const innerValExpression = new ExpressionMaker("", OperationsUtil.dpdOperation(dpdVal.exp2), []);
        if(dpdVal.exp2 == "IS-BLANK" || dpdVal.exp2 == "IS-NOT-BLANK") {
            innerValExpression.operands.push(new OperandMaker("0", CONSTANTS.VALUE, CONSTANTS.types.STRING));
        } else {
            innerValExpression.operands.push(new OperandMaker(dpdVal.val2, CONSTANTS.VALUE, CONSTANTS.types.STRING));
        }

        valExpression.operands.push(innerValExpression);
    }

    return valExpression;
};

export const isNotConvertDPDString = (outComeType, dpdValue) => {
    let isNotConvertDPDString = false;
    const notConvertArray:any = ["==", "!="];
    if(StringUtil.toUpperCase(outComeType) == "VALUE") {
        for (let j = 0; j < dpdValue.length; j++) {
            const dpdVal = dpdValue[j] && dpdValue[j].val2;
            const dpdExp = dpdVal.exp2 ? dpdVal.exp2 : "==";
            if(isNaN(dpdVal) && notConvertArray.includes(dpdExp) ) {
                isNotConvertDPDString = true;
            }
        }
    }
    return isNotConvertDPDString;
};

export const generateDPDExpressions = (dpdArray, globalDPDVar, dpdVar, isFromTradeLevelCustomField, outComeType, iffData) => {
    const expressions = [];
    let dpdDate = dpdArray.filter((r) => StringUtil.toLowerCase(r.exp2) == CONSTANTS.DIFF_MONTH || StringUtil.toLowerCase(r.exp2) == CONSTANTS.DIFF_MONTH_RECENT);
    const dpdValue = dpdArray.filter((r) => StringUtil.toLowerCase(r.exp2) != CONSTANTS.DIFF_MONTH && StringUtil.toLowerCase(r.exp2) != CONSTANTS.DIFF_MONTH_RECENT);
    const dpdOperatorsArr = dpdValue.filter((r) => StringUtil.notBlank(r.operator));
    let dpdOperator;
    let dpdBaseField;
    const paymentStartDateOperand = new OperandMaker(CONSTANTS.PAYMENT_HIST_START_DATE, CONSTANTS.FIELD, CONSTANTS.types.DATE, CONSTANTS.DATE_FROMAT2);
    const dpdConvertValue = isNotConvertDPDString(StringUtil.toUpperCase(outComeType), dpdValue);
    const dpdConvertOperand = new OperandMaker(dpdConvertValue, CONSTANTS.VALUE, CONSTANTS.types.BOOLEAN);

    if (dpdArray.length > 0) {
        dpdBaseField = dpdArray[0].fieldname;
        const split = IFFHelper.splitIffField(dpdBaseField, "$");
        const paymentStartDateField = `${split[0]}$${CONSTANTS.PAYMENT_HIST_START_DATE}`;
        const iffPaymentStartDate = IFFHelper.iffStructure(CONSTANTS.IFF_STRUCTURE, paymentStartDateField, iffData);
        if (iffPaymentStartDate && iffPaymentStartDate.FIELD_TYPE == "D") {
            paymentStartDateOperand.dateType = iffPaymentStartDate.DATE_TYPE;
        }
    }

    if (dpdOperatorsArr.length > 0) {
        dpdOperator = dpdOperatorsArr[0].operator;
    }

    if (dpdDate.length > 0) {
        dpdDate = [dpdDate[0]]; // TODO;  consider only 1 date condition for dpd calculations
        for (let i = 0; i < dpdDate.length; i++) {
            const dpd = dpdDate[i];
            const field = OperationsUtil.getFieldBasedOnStructure(dpd.FType, dpd.fieldname, "");
            const split = IFFHelper.splitIffField(field, ".");
            const expression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
            const left = new OperandMaker(globalDPDVar, CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
            expression.operands.push(left);
            const right = new ExpressionMaker(CONSTANTS.ARRAY_THREE_DIGIT_NUMERIC_STRING_TO_NUMBERS_OPERATION, "", []);
            expression.operands.push(right);
            if (isFromTradeLevelCustomField) {
                const rightOperand1 = new OperandMaker(split[1] + dpdVar, CONSTANTS.FIELD, CONSTANTS.types.STRING);
                right.operands.push(rightOperand1);
                const sliceOperands = dpdOperands(dpd);
                const leftSlice = sliceOperands[0], rightSlice = sliceOperands[1];

                const rightOperand2 = new OperandMaker(leftSlice, CONSTANTS.VALUE, CONSTANTS.types.STRING);
                right.operands.push(rightOperand2);
                const rightOperand3 = new OperandMaker(rightSlice, CONSTANTS.VALUE, CONSTANTS.types.STRING);
                right.operands.push(rightOperand3);
                right.operands.push( dpdValueExpression(dpdValue, dpdOperator) );
                const rightOperand4 = new OperandMaker(dpd.exp2, CONSTANTS.VALUE, CONSTANTS.types.STRING);
                right.operands.push(rightOperand4);
                const rightOperand5 = new OperandMaker(split[1], CONSTANTS.FIELD, CONSTANTS.types.STRING);
                right.operands.push(rightOperand5);
                right.operands.push(paymentStartDateOperand);
            } else {
                const rightOperand1 = new OperandMaker(split[0], CONSTANTS.FIELD, CONSTANTS.types.STRING);
                right.operands.push(rightOperand1);
                const rightOperand2 = new OperandMaker(split[1] + dpdVar, CONSTANTS.FIELD, CONSTANTS.types.STRING);
                right.operands.push(rightOperand2);
                const sliceOperands = dpdOperands(dpd);
                const leftSlice = sliceOperands[0], rightSlice = sliceOperands[1];

                const rightOperand3 = new OperandMaker(leftSlice, CONSTANTS.VALUE, CONSTANTS.types.STRING);
                right.operands.push(rightOperand3);
                const rightOperand4 = new OperandMaker(rightSlice, CONSTANTS.VALUE, CONSTANTS.types.STRING);
                right.operands.push(rightOperand4);
                right.operands.push( dpdValueExpression(dpdValue, dpdOperator) );
                const rightOperand5 = new OperandMaker(dpd.exp2, CONSTANTS.VALUE, CONSTANTS.types.STRING);
                right.operands.push(rightOperand5);
                const rightOperand6 = new OperandMaker(split[1], CONSTANTS.FIELD, CONSTANTS.types.STRING);
                right.operands.push(rightOperand6);
                right.operands.push(paymentStartDateOperand);
            }
            right.operands.push(dpdConvertOperand);
            expressions.push(expression);
        }
    } else {
        const expression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const left = new OperandMaker(globalDPDVar, CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        expression.operands.push(left);
        const right = new ExpressionMaker(CONSTANTS.ARRAY_THREE_DIGIT_NUMERIC_STRING_TO_NUMBERS_OPERATION, "", []);
        expression.operands.push(right);
        if (isFromTradeLevelCustomField) {
            const field = OperationsUtil.getFieldBasedOnStructure(CONSTANTS.IFF_STRUCTURE, dpdBaseField, "");
            const split = IFFHelper.splitIffField(field, ".");
            const rightOperand1 = new OperandMaker(split[1] + dpdVar, CONSTANTS.FIELD, CONSTANTS.types.STRING);
            right.operands.push(rightOperand1);
            const rightOperand2 = new OperandMaker("0", CONSTANTS.VALUE, CONSTANTS.types.STRING);
            right.operands.push(rightOperand2);
            const rightOperand3 = new OperandMaker("999", CONSTANTS.VALUE, CONSTANTS.types.STRING);
            right.operands.push(rightOperand3);
            right.operands.push( dpdValueExpression(dpdValue, dpdOperator) );
            const rightOperand4 = new OperandMaker(CONSTANTS.DIFF_MONTH, CONSTANTS.VALUE, CONSTANTS.types.STRING);
            right.operands.push(rightOperand4);
            const rightOperand5 = new OperandMaker(split[1], CONSTANTS.FIELD, CONSTANTS.types.STRING);
            right.operands.push(rightOperand5);
            right.operands.push(paymentStartDateOperand);
        } else {
            let dpdField;
            for (let j = 0; j < dpdValue.length; j++) {
                const dpdVal = dpdValue[j];
                dpdField = dpdVal.fieldname;
            }
            const field = OperationsUtil.getFieldBasedOnStructure(CONSTANTS.IFF_STRUCTURE, dpdField, "");
            const split = IFFHelper.splitIffField(field, ".");
            const rightOperand1 = new OperandMaker(split[0], CONSTANTS.FIELD, CONSTANTS.types.STRING);
            right.operands.push(rightOperand1);
            const rightOperand2 = new OperandMaker(split[1] + dpdVar, CONSTANTS.FIELD, CONSTANTS.types.STRING);
            right.operands.push(rightOperand2);
            const rightOperand3 = new OperandMaker("0", CONSTANTS.VALUE, CONSTANTS.types.STRING);
            right.operands.push(rightOperand3);
            const rightOperand4 = new OperandMaker("999", CONSTANTS.VALUE, CONSTANTS.types.STRING);
            right.operands.push(rightOperand4);
            right.operands.push( dpdValueExpression(dpdValue, dpdOperator) );
            const rightOperand5 = new OperandMaker(CONSTANTS.DIFF_MONTH, CONSTANTS.VALUE, CONSTANTS.types.STRING);
            right.operands.push(rightOperand5);
            const rightOperand6 = new OperandMaker(split[1], CONSTANTS.FIELD, CONSTANTS.types.STRING);
            right.operands.push(rightOperand6);
            right.operands.push(paymentStartDateOperand);
        }
        right.operands.push(dpdConvertOperand);
        expressions.push(expression);
    }
    return expressions;
};

export const prepareDefaultOutcomeForCustomField = (customField, defaultOutcome, institutionId, customFields, iffData) => {
    const customFieldDataType = OperationsUtil.longDataType(customField.FIELD_TYPE);
    const defaultExpression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
    const defaultOperand = new OperandMaker(true, CONSTANTS.VALUE, "any");
    defaultExpression.operands.push(defaultOperand);

    if (StringUtil.toLowerCase(defaultOutcome.TYPE) == CONSTANTS.VALUE) {
        const dataType = OperationsUtil.getValueType(CONSTANTS.VALUE, defaultOutcome.OUTCM_VALUE, customFieldDataType);
        let defaultOutputAlias;

        // defaultOutcome.OUTCM_VALUE.length >= 8  because DDMMYYYY is length 8
        if(customFieldDataType != CONSTANTS.types.DATE || (customFieldDataType == CONSTANTS.types.DATE && defaultOutcome.OUTCM_VALUE && defaultOutcome.OUTCM_VALUE.length >= 8)) {
            defaultOutputAlias = new OutputAliasMaker(new OperandMaker(defaultOutcome.OUTCM_VALUE, CONSTANTS.VALUE, dataType), "");
        } else {
            defaultOutputAlias = new OutputAliasMaker(new OperandMaker("", CONSTANTS.VALUE, CONSTANTS.types.STRING), "");
        }

        return new IFConditionExpressionMaker(CONSTANTS.IF_COND, defaultOutputAlias, defaultExpression);
    } else {
        const fieldName = OperationsUtil.getFieldBasedOnStructure(defaultOutcome.BASE_FTYPE, defaultOutcome.BASE_FIELD, defaultOutcome.masterKeyField);
        const iffStructure = IFFHelper.iffStructure(defaultOutcome.BASE_FTYPE, defaultOutcome.BASE_FIELD, iffData);

        if (iffStructure && iffStructure.OCCURANCE == "N") {
            const split = IFFHelper.splitIffField(fieldName, ".");
            const defaultOutputAlias = customFieldOutputAliasForArrayCondition(customField.FIELD_TYPE, defaultOutcome, institutionId, split[0], split[1], customFields, iffData);
            return new IFConditionExpressionMaker(CONSTANTS.IF_COND, defaultOutputAlias, defaultExpression);
        } else {
            const defaultOutputAlias = new OutputAliasMaker(new OperandMaker(fieldName, CONSTANTS.FIELD, "string"), "");
            return new IFConditionExpressionMaker(CONSTANTS.IF_COND, defaultOutputAlias, defaultExpression);
        }
    }

};

export const prepareDefaultOutcomeForTradeCustomField = (customField, defaultOutcome, institutionId, customFields, iffData) => {
    const customFieldDataType = OperationsUtil.longDataType(customField.FIELD_TYPE);
    const defaultExpression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
    const defaultOperand = new OperandMaker(true, CONSTANTS.VALUE, CONSTANTS.types.ANY);
    defaultExpression.operands.push(defaultOperand);

    if (StringUtil.toLowerCase(defaultOutcome.TYPE) == CONSTANTS.VALUE) {
        const dataType = OperationsUtil.getValueType(CONSTANTS.VALUE, defaultOutcome.OUTCM_VALUE, customFieldDataType);
        const defaultOutputAlias = new OutputAliasMaker(new OperandMaker(defaultOutcome.OUTCM_VALUE, CONSTANTS.VALUE, dataType), "");
        return new IFConditionExpressionMaker(CONSTANTS.IF_COND, defaultOutputAlias, defaultExpression);
    } else {
        const fieldName = OperationsUtil.getFieldBasedOnStructure(defaultOutcome.BASE_FTYPE, defaultOutcome.BASE_FIELD, defaultOutcome.masterKeyField);
        const iffStructure = IFFHelper.iffStructure(defaultOutcome.BASE_FTYPE, defaultOutcome.BASE_FIELD, iffData);

        if (iffStructure && iffStructure.OCCURANCE == "N") {
            const defaultOutputAlias = customFieldOutputAlias(customField, defaultOutcome, institutionId, true, customFields, iffData);
            return new IFConditionExpressionMaker(CONSTANTS.IF_COND, defaultOutputAlias, defaultExpression);
        } else {
            const defaultOutputAlias = new OutputAliasMaker(fieldName, "");
            return new IFConditionExpressionMaker(CONSTANTS.IF_COND, defaultOutputAlias, defaultExpression);
        }
    }
};

export const generateExpForArrayField = (fieldname: string) => {
    const rightOperandArray = fieldname.split(".");
    const leftOperandStr = rightOperandArray.pop();
    const rightStr = rightOperandArray.join(".");
    const conditionMapOperation = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.MAP, []);
    const conditionMapLeftOperand = new OperandMaker(rightStr, CONSTANTS.FIELD, CONSTANTS.types.STRING);
    const conditionMapRightOperand = new OperandMaker("obj." + leftOperandStr, CONSTANTS.VALUE, CONSTANTS.types.STRING);
    conditionMapOperation.operands.push(conditionMapLeftOperand);
    conditionMapOperation.operands.push(conditionMapRightOperand);
    return conditionMapOperation;
};

/**
 *
 * @param rule
 * @param iffData
 * this method gives the right operand based on iff structure for values
 */
export const valueRightOperand = (rule, iffData) => {
    const iffObj = IFFHelper.iffStructure(rule.FType, rule.fieldname, iffData);
    const fieldname = OperationsUtil.getFieldBasedOnStructure(rule.FType, rule.fieldname, "");
    const fieldArray = fieldname.split(".");
    const subArray = fieldArray.slice(0, fieldArray.length - 1);
    if (iffObj && iffObj.OCCURANCE == "N") {
        const valMapOperation = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.MAP, []);
        const valMapLeftOperand = new OperandMaker(subArray.join("."), CONSTANTS.FIELD, CONSTANTS.types.STRING);
        const valMapRightOperand = new OperandMaker("obj." + fieldArray[fieldArray.length - 1], CONSTANTS.VALUE, CONSTANTS.types.STRING);
        valMapOperation.operands.push(valMapLeftOperand);
        valMapOperation.operands.push(valMapRightOperand);
        return valMapOperation;
    } else {
        const responseStmtRightExpression = new ExpressionMaker(CONSTANTS.SIMPLE_OPERATION, CONSTANTS.NULL_OR_VALUE, []);
        const responseStmtRightOperand = new OperandMaker(fieldname, CONSTANTS.FIELD, CONSTANTS.types.STRING);
        responseStmtRightExpression.operands.push(responseStmtRightOperand);
        return responseStmtRightExpression;
    }
};

export const getAllDepedentCustonFieldsAsTrade = (fieldname, customFieldArray, iffData) => {
    const customFieldAll = [];
    const dependentCustomFieldExp = new ExpressionsMaker(CONSTANTS.FOR_EACH,[]);
    let split = fieldname.split("$");
    const matchedCustomField = _.filter(customFieldArray,(temp)=> {
        return temp.FIELD_NAME == split[1];
    });
    getAllDependentCustomFields(customFieldArray, matchedCustomField[0].DISPLAY_NAME, customFieldAll);
    for(let count = 0 ; count<customFieldAll.length; count++){
        const curField = customFieldAll[count];
        if(curField.LEVEL !="Trade") {
            curField.LEVEL = "Trade";
            curField.RULES.forEach((el)=>{
                el.Outcome.AGGR_OPRTR = "VALUE-OF";
            });
            const curCustomField = new CustomField(curField, customFieldArray, iffData);
            dependentCustomFieldExp.expressions.push(curCustomField.generate());
        }
    }
    return dependentCustomFieldExp;
};

export const tradeLevelEligibilityBaseField = (conditionArray,fType, policyCustomFields, iffdata) => {
    let fieldname;
    if(_.isArray(conditionArray) && conditionArray.length>0) {
        let tempObj =   _.filter(conditionArray, (elem)=>{
            return  elem && elem.fieldname && elem.fieldname.split("$")[0] == CONSTANTS.CUSTOM_FIELDS
        });
        fieldname = tempObj.length>0 ?tempObj[0].fieldname: conditionArray[0].fieldname;
        fType = tempObj.length>0 ? tempObj[0].FType : conditionArray[0].FType;
    } else {
        fieldname = conditionArray;
    }
    if (StringUtil.toUpperCase(fType) == CONSTANTS.CUSTOM) {
        const splitted = fieldname.split("$");
        let customField;
        customField =  policyCustomFields.filter((el) => el.FIELD_NAME == splitted[1])[0];
        const r = (customField.RULES.map((a) => a.Condition))[0][0];
        return tradeLevelEligibilityBaseField(r.fieldname, r.FType, policyCustomFields, iffdata);
    } else {
        return fieldname;
    }
};
