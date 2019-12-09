import { CONSTANTS } from "../constants/constants";
import * as OperandHelper from "../helper/OperandHelper";
import * as OperationsUtil from "../util/OperationsUtil";
import * as StringUtil from "../util/StringUtil";
import * as EncDecryptUtil from "../util/EncDecryptUtil";
import { ExpressionMaker, ExpressionsMaker, IFConditionExpressionMaker, OperandMaker } from "./breClass";
import { RULE } from "./customFieldRuleModel";
import { PolicyBase } from "./policyBase";
import { DEFAULTVALUE, PolicyModel, PUSH } from "./policyModel";
import {escape} from "querystring";

export class CustomField extends PolicyBase {
    public FIELD_NAME: string;
    public FIELD_TYPE: string;
    public LEVEL: string;
    public RULES: RULE[];
    public DEFAULT_VALUE: DEFAULTVALUE;
    public DISPLAY_NAME: string;
    public OCCURENCE: number;
    public INSTITUTION_ID: number;
    public createdby: string;
    public status: string;
    public FieldID: number;
    public ACTIVE: number;
    public updatedby: string;
    public promoteDate: string;
    public custom_type: string;
    public PUSH: PUSH;
    public iffData: any;
    public customFields: CustomField[];

    constructor(props?: CustomField, customFields?: CustomField[], iffData?: any) {
        super(iffData);
        this.FieldID = props.FieldID;
        this.FIELD_TYPE = props.FIELD_TYPE;
        this.FIELD_NAME = props.FIELD_NAME;
        this.LEVEL = props.LEVEL;
        this.DISPLAY_NAME = props.DISPLAY_NAME;
        this.OCCURENCE = props.OCCURENCE;
        this.INSTITUTION_ID = props.INSTITUTION_ID;
        this.createdby = props.createdby;
        this.status = props.status;
        this.FieldID = props.FieldID;
        this.ACTIVE = props.ACTIVE;
        this.updatedby = props.updatedby;
        this.promoteDate = props.promoteDate;
        const { RULES = [], DEFAULT_VALUE, PUSH: push } = props;
        this.RULES = RULES.map((x) => new RULE(x, this.iffData));
        this.DEFAULT_VALUE = new DEFAULTVALUE(DEFAULT_VALUE);
        this.iffData = iffData;
        this.custom_type = CONSTANTS.CUSTOM;
        this.PUSH = new PUSH(push);
        this.customFields = customFields;
    }

    public generate() {
        const customField = this;
        const iffData = this.iffData;
        const institutionId = this.INSTITUTION_ID;
        const expressions = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);
        const isValidCustomField = OperationsUtil.isValidDerivedField(customField);

        if (StringUtil.toLowerCase(customField.LEVEL) == CONSTANTS.TRADE) {
            const customFieldExpression = new ExpressionMaker(CONSTANTS.FUNCTION, "=", []);
            expressions.expressions.push(customFieldExpression);
            const customFieldLeftOperand = new OperandMaker(OperationsUtil.tradeCustomFieldName(customField.FIELD_NAME), "field", "any");
            const customFieldRightOperand = new ExpressionsMaker(CONSTANTS.MUTUAL_EXCLUSIVE_EXPRESSIONS, [], EncDecryptUtil.encrypt(customField.FIELD_NAME || expressions.UUID), "CUSTOM_FIELD_NAME - " + customField.FIELD_NAME, CONSTANTS.CUSTOM_FIELD, "true");
            customFieldExpression.operands.push(customFieldLeftOperand);
            customFieldExpression.operands.push(customFieldRightOperand);

            for (let customRuleCount = 0; customRuleCount < customField.RULES.length && isValidCustomField; customRuleCount++) {
                const customRule = customField.RULES[customRuleCount];

                const outputAlias = OperandHelper.customFieldOutputAlias(customField, customRule.Outcome, institutionId, true, this.customFields, iffData);
                const outerOperands = [];
                const expressionTree = new ExpressionMaker(CONSTANTS.STATEMENT, "", outerOperands);
                const innerExpression = new IFConditionExpressionMaker(CONSTANTS.IF_COND, outputAlias, expressionTree);
                const isOnlyOutcomeHasDateDPD = OperationsUtil.isOnlyOutcomeHasDateDPD(customRule);

                for (let conditionCount = 0; conditionCount < customRule.Condition.length; conditionCount++) {
                    const rule = customRule.Condition[conditionCount];
                    const hasDPDCalculations = OperationsUtil.hasDPDCalculations(rule);
                    const outerOperand = new ExpressionMaker(CONSTANTS.STATEMENT, "", []);
                    let globalDPDVar;
                    let globalDPD;

                    const dpdFilterArray = OperationsUtil.getDPDFilterCondition(rule);
                    let dpdExpressions = [];
                    const innerOperands = [];
                    outerOperand.operands = innerOperands;

                    if (hasDPDCalculations) {
                        globalDPD = "customField" + outerOperand.UUID;
                        globalDPDVar = CONSTANTS.GLOBAL_VAR + "." + globalDPD;
                    }
                    if (conditionCount == 0) {
                        expressionTree.operator = rule.outOperator;

                        if (isOnlyOutcomeHasDateDPD) {
                            globalDPD = "customField" + outerOperand.UUID;
                            globalDPDVar = CONSTANTS.GLOBAL_VAR + "." + globalDPD;

                            const dpdExpressions = OperandHelper.generateOutComeOnlyDateDPDExpressions(globalDPDVar, globalDPD, customRule.Outcome, true, iffData);
                            customFieldRightOperand.expressions.push(dpdExpressions);
                        }

                        if ( StringUtil.toLowerCase(customRule.Outcome.BASE_DTYPE) == CONSTANTS.types.DPD) {
                            innerExpression.outputAlias = OperandHelper.tradeCustomFieldOutputAliasForDPD(customRule.Outcome, globalDPDVar, globalDPD, hasDPDCalculations);
                        }
                    }

                    const isTradeLevelOperand = OperationsUtil.isTradeLevelCustomFieldCustomField(rule.fieldname, this.customFields);
                    let innerOperand;
                    if (hasDPDCalculations) {
                        globalDPD = "customField" + outerOperand.UUID;
                        globalDPDVar = CONSTANTS.GLOBAL_VAR + "." + globalDPD;

                        const innerOperand = OperandHelper.prepareDPDConditionOperands(dpdFilterArray[0], globalDPD, globalDPDVar, true, iffData);
                        innerOperands.push(innerOperand);

                        dpdExpressions = OperandHelper.generateDPDExpressions(dpdFilterArray, globalDPDVar, globalDPD, true, customRule.Outcome.TYPE, iffData);
                        Array.prototype.push.apply(customFieldRightOperand.expressions, dpdExpressions);
                    }

                    if (!OperationsUtil.isDPDFilterRequired(rule)) {
                        if (isTradeLevelOperand) {
                            innerOperand = OperandHelper.prepareTradeLeafOperands(rule);
                        } else {
                            innerOperand = OperandHelper.prepareLeafOperands(rule, false, true, globalDPDVar, "", iffData);
                        }
                        innerOperands.push(innerOperand);
                    }

                    for (let refCount = 0; refCount < rule.ref.length; refCount++) {
                        const ref = rule.ref[refCount];
                        const isTradeLevelOperand = OperationsUtil.isTradeLevelCustomFieldCustomField(ref.fieldname, this.customFields);
                        let innerOperand;

                        if (refCount == 0) {
                            outerOperand.operator = rule.operator;
                        }
                        if (!OperationsUtil.isDPDFilterRequired(ref)) {
                            if (isTradeLevelOperand) {
                                innerOperand = OperandHelper.prepareTradeLeafOperands(ref);
                            } else {
                                innerOperand = OperandHelper.prepareLeafOperands(ref, false, true, globalDPDVar, "", iffData);
                            }
                            innerOperands.push(innerOperand);
                        }
                    }

                    if ((rule.ref.length == 0) && innerOperand) {
                        outerOperand.template = innerOperand.template;
                        outerOperand.operator = innerOperand.operator;
                        outerOperand.operands = innerOperand.operands;
                    }
                    outerOperands.push(outerOperand);
                }

                if (customRule.Condition.length == 1 && outerOperands[0]) {
                    expressionTree.operator = outerOperands[0].operator;
                    expressionTree.template = outerOperands[0].template;
                    expressionTree.operands = outerOperands[0].operands;
                }
                customFieldRightOperand.expressions.push(innerExpression);
            }

            // prepare for default custom field value
            const ifDefaultExpression = OperandHelper.prepareDefaultOutcomeForTradeCustomField(customField, customField.DEFAULT_VALUE, institutionId, this.customFields, iffData);
            customFieldRightOperand.expressions.push(ifDefaultExpression);
        } else {
            const customFieldExpression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
            expressions.expressions.push(customFieldExpression);
            const customFieldLeftOperand = new OperandMaker(CONSTANTS.loanOutput + ".DERIVED_FIELDS" + "[\"CUSTOM_FIELDS$" + customField.FIELD_NAME + "\"]", "field", "any");
            const customFieldRightOperand = new ExpressionsMaker(CONSTANTS.MUTUAL_EXCLUSIVE_EXPRESSIONS, [], EncDecryptUtil.encrypt(customField.FIELD_NAME || expressions.UUID), "CUSTOM_FIELD_NAME - " + customField.FIELD_NAME, CONSTANTS.CUSTOM_FIELD, "true");
            customFieldExpression.operands.push(customFieldLeftOperand);
            customFieldExpression.operands.push(customFieldRightOperand);

            for (let customRuleCount = 0; customRuleCount < customField.RULES.length && isValidCustomField; customRuleCount++) {
                const customRule = customField.RULES[customRuleCount];
                let isCustomFieldConditionOutputArray = false;
                let conditionOutputField;
                const outputAlias = OperandHelper.customFieldOutputAlias(customField, customRule.Outcome, institutionId, false, this.customFields, iffData);
                const outerOperands = [];
                const expressionTree = new ExpressionMaker(CONSTANTS.STATEMENT, "", outerOperands);
                const innerExpression = new IFConditionExpressionMaker(CONSTANTS.IF_COND, outputAlias, expressionTree);
                const isOnlyOutcomeHasDateDPD = OperationsUtil.isOnlyOutcomeHasDateDPD(customRule);
                let globalDPDVar;
                let globalDPD;

                // Check if outcome-type is Value and multiple arrays are used.
                let isCustomFieldMultiArray = OperandHelper.isCustomFieldMultiArray(customRule.Condition, customRule.Outcome, this.customFields, iffData);
                for (let conditionCount = 0; conditionCount < customRule.Condition.length; conditionCount++) {
                    const rule = customRule.Condition[conditionCount];
                    const hasOnlyDPD = OperationsUtil.hasOnlyDPDCalculations(rule);
                    const hasDPDCalculations = OperationsUtil.hasDPDCalculations(rule);
                    const outerOperand = new ExpressionMaker(CONSTANTS.STATEMENT, "", []);
                    const dpdFilterArray = OperationsUtil.getDPDFilterCondition(rule);
                    let dpdExpressions = [];

                    if (hasDPDCalculations) {
                        globalDPD = "customField" + outerOperand.UUID;
                        globalDPDVar = CONSTANTS.GLOBAL_VAR + "." + globalDPD;
                    }

                    if (conditionCount == 0) {
                        if (isOnlyOutcomeHasDateDPD) {
                            globalDPD = "customField" + outerOperand.UUID;
                            globalDPDVar = CONSTANTS.GLOBAL_VAR + "." + globalDPD;

                            const dpdExpressions = OperandHelper.generateOutComeOnlyDateDPDExpressions(globalDPDVar, globalDPD, customRule.Outcome, false, iffData);
                            customFieldRightOperand.expressions.push(dpdExpressions);
                        }

                        // If multiple array are used then outcome wont have array aggregation
                        if(!isCustomFieldMultiArray) {
                            isCustomFieldConditionOutputArray = OperandHelper.isCustomFieldConditionOutputArray(rule, customRule.Outcome, this.customFields, iffData);
                        }
                        if (isCustomFieldConditionOutputArray) {
                            conditionOutputField = OperandHelper.tradeLevelBaseField(rule.fieldname, rule.FType, this.customFields, iffData);
                            const numberOperationExpression = new ExpressionMaker(CONSTANTS.NUMBER_OPERATION, "<", []);
                            const numberOperationLeftOperand = new OperandMaker(0, "value", "number");
                            numberOperationExpression.operands.push(numberOperationLeftOperand);
                            const numberOperationRightExpression = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.SIZE, []);
                            numberOperationExpression.operands.push(numberOperationRightExpression);
                            const rightExpressionOperand = new ExpressionMaker(CONSTANTS.ASSIGN_AND_RETURN, "=", []);
                            numberOperationRightExpression.operands.push(rightExpressionOperand);
                            let globalVar;
                            if (hasDPDCalculations) {
                                globalVar = globalDPDVar;
                            } else {
                                globalVar = CONSTANTS.GLOBAL_VAR + "." + "customField" + numberOperationExpression.UUID;
                            }

                            innerExpression.outputAlias = OperandHelper.customFieldOutputAliasForArrayCondition(customField.FIELD_TYPE, customRule.Outcome, institutionId, globalVar, globalDPD, this.customFields, iffData);

                            const arrayOperand = new OperandMaker(globalVar, "field", "array");
                            rightExpressionOperand.operands.push(arrayOperand);
                            rightExpressionOperand.operands.push(expressionTree);

                            innerExpression.expression = numberOperationExpression;

                            if (rule.outOperator == CONSTANTS.operators.AND) {
                                expressionTree.operator = CONSTANTS.operators.INTERSECTION;
                                expressionTree.template = CONSTANTS.INTERSECTION_OPERATION;
                            } else if (rule.outOperator == CONSTANTS.operators.OR) {
                                expressionTree.operator = CONSTANTS.operators.UNION;
                                expressionTree.template = CONSTANTS.INTERSECTION_OPERATION;
                            } else {
                                expressionTree.operator = rule.outOperator;
                            }
                        } else {
                            expressionTree.operator = rule.outOperator;
                        }
                    }
                    const innerOperands = [];
                    outerOperand.operands = innerOperands;
                    if (hasDPDCalculations) {
                        dpdExpressions = OperandHelper.generateDPDExpressions(dpdFilterArray, globalDPDVar, globalDPD, false, customRule.Outcome.TYPE, iffData);
                        const dpdValue = dpdFilterArray.filter((r) => StringUtil.toLowerCase(r.exp2) != CONSTANTS.DIFF_MONTH && StringUtil.toLowerCase(r.exp2) != CONSTANTS.DIFF_MONTH_RECENT);
                        const innerOperand = OperandHelper.prepareDPDConditionOperands(dpdFilterArray[0], globalDPD, globalDPDVar, false, iffData);
                        innerOperands.push(innerOperand);

                        if (rule.ref.length == 0) {
                            outerOperand.operator = CONSTANTS.operators.INTERSECTION;
                            outerOperand.template = CONSTANTS.INTERSECTION_OPERATION;
                        }
                        Array.prototype.push.apply(customFieldRightOperand.expressions, dpdExpressions);
                    }

                    const isTradeLevelOperand = OperationsUtil.isTradeLevelCustomFieldCustomField(rule.fieldname, this.customFields);
                    let innerOperand;

                    if (!OperationsUtil.isDPDFilterRequired(rule)) {
                        if (isTradeLevelOperand) {
                            const baseField = OperandHelper.tradeLevelBaseField(rule.fieldname, rule.FType, this.customFields, iffData);
                            innerOperand = OperandHelper.prepareOperands(rule, isCustomFieldConditionOutputArray, baseField, globalDPDVar, iffData);
                        } else {
                            innerOperand = OperandHelper.prepareLeafOperands(rule, isCustomFieldConditionOutputArray, false, globalDPDVar, conditionOutputField, iffData);
                        }
                        innerOperands.push(innerOperand);
                    }

                    for (let refCount = 0; refCount < rule.ref.length; refCount++) {
                        const ref = rule.ref[refCount];
                        if (refCount == 0 ) {
                            let outerOperator = rule.operator, outerTemplate = outerOperand.template;
                            if(isCustomFieldMultiArray) {
                                if (rule.operator == CONSTANTS.operators.AND) {
                                    outerOperator = CONSTANTS.operators.INTERSECTION;
                                    outerTemplate = CONSTANTS.INTERSECTION_OPERATION_MULTI_ARRAY;
                                } else if (rule.operator == CONSTANTS.operators.OR) {
                                    outerOperator = CONSTANTS.operators.UNION;
                                    outerTemplate = CONSTANTS.INTERSECTION_OPERATION_MULTI_ARRAY;
                                }
                            } else if (isCustomFieldConditionOutputArray) {
                                if (rule.operator == CONSTANTS.operators.AND) {
                                    outerOperator = CONSTANTS.operators.INTERSECTION;
                                    outerTemplate = CONSTANTS.INTERSECTION_OPERATION;
                                } else if (rule.operator == CONSTANTS.operators.OR) {
                                    outerOperator = CONSTANTS.operators.UNION;
                                    outerTemplate = CONSTANTS.INTERSECTION_OPERATION;
                                }
                            }
                            outerOperand.operator = outerOperator;
                            outerOperand.template = outerTemplate;
                        }

                        const isTradeLevelOperand = OperationsUtil.isTradeLevelCustomFieldCustomField(ref.fieldname, this.customFields);
                        let innerOperand;

                        if (!OperationsUtil.isDPDFilterRequired(ref)) {
                            if (isTradeLevelOperand) {
                                const baseField = OperandHelper.tradeLevelBaseField(ref.fieldname, ref.FType, this.customFields, iffData);
                                innerOperand = OperandHelper.prepareOperands(ref, isCustomFieldConditionOutputArray, baseField, globalDPDVar, iffData);
                            } else {
                                innerOperand = OperandHelper.prepareLeafOperands(ref, isCustomFieldConditionOutputArray, false, globalDPDVar, conditionOutputField, iffData);
                            }
                            innerOperands.push(innerOperand);
                        }
                    }

                    if ((rule.ref.length == 0) && innerOperand) {
                        outerOperand.template = innerOperand.template;
                        outerOperand.operator = innerOperand.operator;
                        outerOperand.operands = innerOperand.operands;
                    }
                    outerOperands.push(outerOperand);
                }

                if (customRule.Condition.length == 1 && outerOperands[0]) {
                    expressionTree.operator = outerOperands[0].operator;
                    expressionTree.template = outerOperands[0].template;
                    expressionTree.operands = outerOperands[0].operands;
                }

                customFieldRightOperand.expressions.push(innerExpression);
            }

            // prepare for default custom field value
            if (OperationsUtil.addDefaultValueToCustomField(customField)) {
                const ifDefaultExpression = OperandHelper.prepareDefaultOutcomeForCustomField(customField, customField.DEFAULT_VALUE, institutionId, this.customFields, iffData);
                customFieldRightOperand.expressions.push(ifDefaultExpression);
            }
        }
        return expressions;
    }

}
