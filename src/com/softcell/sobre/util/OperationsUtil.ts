/**
 * This file contains the utility methods useful operations
 */

import { CONSTANTS } from "../constants/constants";
import * as StringUtil from "../util/StringUtil";
const DateUtil = require("../util/DateUtil");
import * as IFFHelper from "../helper/IFFHelper";
import * as OperationsUtil from "../util/OperationsUtil";
const lodash = require("lodash");

/**
 * This method returns descriptive version of Shortened dataTypes
 * e.g.  N => integer      S => string
 * @param type
 * @returns {any}
 */

const dpdMaxDateArr: any = [CONSTANTS.dpdOutcome.MAX_DPD_DATE, "MAX-DPD_DATE", "MAX_DPD_DATE"];
const dpdMinDateArr: any = [CONSTANTS.dpdOutcome.MIN_DPD_DATE, "MIN-DPD_DATE", "MIN_DPD_DATE"];
const COUNT_DIST = "count-dist";

export const longDataType = (type) => {
    if (type == "N") {
        return CONSTANTS.types.INTEGER;
    } else if (type == "S") {
        return CONSTANTS.types.STRING;
    } else if (type == "B") {
        return CONSTANTS.types.STRING;  // Treat Boolean as String
    } else if (type == "D") {
        return CONSTANTS.types.DATE;
    } else {
        return type;
    }
};

/**
 * This method returns actual operation possible in javascript for a particular dataType
 * @param dataType
 * @param oper1
 * @param oper2
 * @returns {any}
 */
export const operation = (dataType, oper1, oper2) => {
    if (CONSTANTS.types.STRING == dataType) {
        if (!oper2) {
            return CONSTANTS.stringOperators.EQUAL;
        }
        if (oper2.toLowerCase() == "is" || oper2.toLowerCase() == "is-blank") {
            return CONSTANTS.stringOperators.EQUAL;
        } else if (oper2.toLowerCase() == "is not" || oper2.toLowerCase() == "is-not-blank") {
            return CONSTANTS.stringOperators.NOT_EQUAL;
        } else if (oper2.toLowerCase() == "start with") {
            return CONSTANTS.stringOperators.STARTS_WITH;
        } else if (oper2.toLowerCase() == "end with") {
            return CONSTANTS.stringOperators.ENDS_WITH;
        } else if (oper2.toLowerCase() == "contains") {
            return CONSTANTS.stringOperators.INCLUDES;
        } else if (oper2.toLowerCase() == "!contains") {
            return CONSTANTS.stringOperators.NOT_INCLUDES;
        } else if (oper2.toLowerCase() == "count") {
            return CONSTANTS.numberOperators.COUNT;
        } else if (oper2.toLowerCase() == COUNT_DIST) {
            return CONSTANTS.numberOperators.COUNT_DIST;
        } else {
            return oper2;
        }
    } else if (CONSTANTS.types.INTEGER == dataType) {
        if (StringUtil.notBlank(oper1) && StringUtil.notBlank(oper2)) {
            if (oper1 == "<=" && oper2 == "<") {
                return CONSTANTS.numberOperators.BETWEEN;
            } else if (oper1 == ">=" && oper2 == ">") {
                return CONSTANTS.numberOperators.NOT_BETWEEN;
            } else {
                return oper2;
            }
        } else if (!oper2) {
            return "==";
        } else if (oper2.toLowerCase() == "maximum") {
            return CONSTANTS.numberOperators.MAX;
        } else if (oper2.toLowerCase() == "minimum") {
            return CONSTANTS.numberOperators.MIN;
        } else if (oper2.toLowerCase() == "count") {
            return CONSTANTS.numberOperators.COUNT;
        } else if (oper2.toLowerCase() == COUNT_DIST) {
            return CONSTANTS.numberOperators.COUNT_DIST;
        } else if (oper2.toLowerCase() == "sum") {
            return CONSTANTS.numberOperators.SUM_BY;
        } else if (oper2.toLowerCase() == "average") {
            return CONSTANTS.numberOperators.AVERAGE;
        } else {
            return oper2;
        }
    } else if (CONSTANTS.types.DATE == dataType) {
        if (StringUtil.notBlank(oper1) && StringUtil.notBlank(oper2)) {
            if (oper1 == "<=" && oper2 == "<") {
                return CONSTANTS.dateOperators.BETWEEN;
            } else if (oper1 == ">=" && oper2 == ">") {
                return CONSTANTS.dateOperators.NOT_BETWEEN;
            } else {
                return oper2;
            }
        } else if (!oper2) {
            return CONSTANTS.dateOperators.EQUAL;
        } else if (oper2.toLowerCase() == "is" || oper2.toLowerCase() == "is-blank") {
            return CONSTANTS.dateOperators.EQUAL;
        } else if (oper2.toLowerCase() == "is not" || oper2.toLowerCase() == "is-not-blank") {
            return CONSTANTS.dateOperators.NOT_EQUAL;
        } else if (oper2.toLowerCase() == "count") {
            return CONSTANTS.dateOperators.COUNT;
        } else if (oper2.toLowerCase() == COUNT_DIST) {
            return CONSTANTS.dateOperators.COUNT_DIST;
        } else if (oper2.toLowerCase() == "is-null") {
            return CONSTANTS.dateOperators.EQUAL;
        } else if (oper2.toLowerCase() == "is-not-null") {
            return CONSTANTS.dateOperators.NOT_EQUAL;
        } else if (oper2.toLowerCase() == "diff-days") {
            return CONSTANTS.dateOperators.DIFF_DAYS;
        } else if (oper2.toLowerCase() == "diff-month") {
            return CONSTANTS.dateOperators.DIFF_MONTHS;
        } else if (oper2.toLowerCase() == "maximum") {
            return CONSTANTS.dateOperators.MAX;
        } else if (oper2.toLowerCase() == "minimum") {
            return CONSTANTS.dateOperators.MIN;
        } else if (oper2.toLowerCase() == "min-diff-days" || oper2.toLowerCase() == "min-diff-month") {
            return CONSTANTS.dateOperators.MIN;
        } else if (oper2.toLowerCase() == "max-diff-days" || oper2.toLowerCase() == "max-diff-month") {
            return CONSTANTS.dateOperators.MAX;
        } else if (oper2.toLowerCase() == "before") {
            return CONSTANTS.dateOperators.BEFORE;
        } else if (oper2.toLowerCase() == "after") {
            return CONSTANTS.dateOperators.AFTER;
        } else if (oper2.toLowerCase() == "max-gap-days") {
            return CONSTANTS.dateOperators.MAX_GAP_DAYS;
        } else if (oper2.toLowerCase() == "min-gap-days") {
            return CONSTANTS.dateOperators.MIN_GAP_DAYS;
        } else if (oper2.toLowerCase() == "max-gap-months") {
            return CONSTANTS.dateOperators.MAX_GAP_MONTHS;
        } else if (oper2.toLowerCase() == "min-gap-months") {
            return CONSTANTS.dateOperators.MIN_GAP_MONTHS;
        } else {
            return oper2;
        }
    } else {
        return oper2;
    }
};

export const dpdOperation = (oper) => {
    if(!oper) {
        return "==";
    }
    if(StringUtil.toUpperCase(oper) == "IS-BLANK") {
        return "<="
    } else if(StringUtil.toUpperCase(oper) == "IS-NOT-BLANK") {
        return ">";
    } else {
        return oper;
    }
};

/**
 * This method returns value if  type is Value   or another field if comparison with a field
 */
export const getValue = (type, value, dataType) => {
    if ((type && type.toLowerCase()) == CONSTANTS.FIELD) {
        const splitted = value.split("$").filter(b => b && b.length > 0);
        let retvalue = CONSTANTS.loanInput;
        if (splitted[0] == CONSTANTS.IRP) {
            splitted[0] = CONSTANTS.REQUEST;
        } else if (splitted[0] == CONSTANTS.CUSTOM_FIELDS) {
            return CONSTANTS.loanOutput + "." + CONSTANTS.DERIVED_FIELDS + "[\"" + value + "\"]";
        } else if (splitted[0] == CONSTANTS.CALCULATED_FIELDS) {
            const field = (splitted.length > 1) ? splitted[1] : value;
            return CONSTANTS.loanOutput + "." + CONSTANTS.DERIVED_FIELDS + "[\"" + CONSTANTS.CALCULATED_FIELDS + "$" + field + "\"]";
        } else if (splitted[0] == CONSTANTS.MATCHING_FIELDS) {
            const field = (splitted.length > 1) ? splitted[1] : value;
            return CONSTANTS.loanOutput + "." + CONSTANTS.DERIVED_FIELDS + "[\"" + CONSTANTS.MATCHING_FIELDS + "$" + field + "\"]";
        }
        splitted.forEach((x) => {
            if (x.indexOf(" ") >= 0) {
                retvalue = retvalue + "[\"" + x + "\"]";
            } else {
                retvalue = retvalue + "." + x;
            }
        });
        return retvalue;
    } else {
        if (CONSTANTS.types.INTEGER == dataType) {
            return isNaN(value) ? value : Number(value);
        } else {
            return value;
        }
    }
};

/**
 * this method returns dataType based on incoming value
 * @param expType
 * @param dataType
 * @param value
 * @returns {any}
 */
export const getValueType = (expType, value, dataType) => {
    if (StringUtil.toLowerCase(expType) == CONSTANTS.FIELD) {
        return dataType
    }
    if (isNaN(value) && dataType == CONSTANTS.types.INTEGER) {
        return CONSTANTS.types.STRING;
    }
    return dataType;
};

/**
 * This method returns va;ue if type is Value   or another field if comparison with a field
 */
export const getFieldBasedOnStructure = (structure, fieldName, masterFieldName,specID?) => {
    const splitted: string[] = fieldName.split("$").filter(b => b && b.length > 0);
    if (splitted[0] == CONSTANTS.IRP) {
        splitted[0] = CONSTANTS.REQUEST;
        return CONSTANTS.loanInput + "." + splitted.join(".");
    }
    let combiArr = splitted.map((x) => "[\"" + x + "\"]");
    const byColumnName = "[\"" + splitted.join("\"][\"") + "\"]";
    combiArr = [CONSTANTS.loanInput, ...combiArr];
    const byColumnNames = combiArr.reduce((a, b) => {
        a.push(a.length == 0 ? "" : a[a.length - 1] + b);
        return a;
    }, []);
    if (structure == CONSTANTS.CUSTOM || splitted[0] == CONSTANTS.CUSTOM_FIELDS) {
        return CONSTANTS.loanOutput + "." + CONSTANTS.DERIVED_FIELDS + "[\"" + fieldName + "\"]";
    } else if (structure == CONSTANTS.FINANCIAL || splitted[0] == CONSTANTS.CALCULATED_FIELDS) {
        const split = IFFHelper.splitIffField(fieldName, "$");
        const field = (split.length > 1) ? split[1] : fieldName;
        return CONSTANTS.loanOutput + "." + CONSTANTS.DERIVED_FIELDS + "[\"" + CONSTANTS.CALCULATED_FIELDS + "$" + field + "\"]";
    } else if (structure == CONSTANTS.MASTER_STRUCTURE) {
        return CONSTANTS.loanInput + "." + "__MASTER" + "[\"" + splitted[0] + "\"]" + "[\"" + splitted[1] + "\"]";
    } else if (structure == CONSTANTS.MATCHING_FIELDS || splitted[0] == CONSTANTS.MATCHING_FIELDS) {
        return CONSTANTS.loanOutput + "." + CONSTANTS.DERIVED_FIELDS + "[\"" + CONSTANTS.MATCHING_FIELDS + "$" + fieldName + "\"]";
    }else if(structure == CONSTANTS.ANALYTICAL ||  splitted[0] == CONSTANTS.ANALYTICAL_FIELDS){
        return analyticalFieldsName(splitted[1], specID);
    }
     else {
        let retvalue = byColumnNames.join(" && ");
        retvalue = CONSTANTS.loanInput;
        splitted.forEach((x) => {
            if (x.indexOf(" ") >= 0 || !StringUtil.notBlank(x)) {
                retvalue = retvalue + "[\"" + x + "\"]";
            } else {
                retvalue = retvalue + "." + x;
            }
        });
        // retvalue=CONSTANTS.loanInput + "." + splitted.join(".");
        return retvalue;
    }
};

/**
 * Checks if the field being processed is a `Trade` level custom field or not
 */
export const isTradeLevelCustomFieldCustomField = (fieldName, customFields, isTrade = false) => {
    const splitted = fieldName && fieldName.split("$");
    if (splitted && splitted.length > 0 && splitted[0] == "CUSTOM_FIELDS") {
        return (customFields.filter((el) => el.FIELD_NAME == splitted[1] && el.LEVEL.toLowerCase() == "trade").length > 0);
    } else {
        return isTrade;
    }
};

/**
 * This method checks if the rule has any dpd calculations
 */
export const hasDPDCalculations = (customFieldRule) => {
    if (StringUtil.toLowerCase(customFieldRule.DType) == CONSTANTS.types.DPD) {
        return true;
    }

    const refs = customFieldRule.ref;
    return (refs.filter((r) => StringUtil.toLowerCase(r.DType) == CONSTANTS.types.DPD).length > 0);
};

export const hasOnlyDPDCalculations = (customFieldRule) => {
    const refs = customFieldRule.ref;
    return (refs.every((r) => StringUtil.toLowerCase(r.DType) == CONSTANTS.types.DPD) && StringUtil.toLowerCase(customFieldRule.DType) == CONSTANTS.types.DPD);
};

/**
 * This methods checks  for
 * 1. if outcome has date dpd values
 */
export const isOutcomeHasDateDPD = (outcome) => {
    return (StringUtil.toLowerCase(outcome.BASE_DTYPE) == CONSTANTS.types.DPD && (dpdMaxDateArr.includes(outcome.AGGR_OPRTR) || dpdMinDateArr.includes(outcome.AGGR_OPRTR)));
};

/**
 * This methods checks  for
 * 1. if custom field consition doesnt have any dpd checks
 * 2. if outcome has date dpd values
 */
export const isOnlyOutcomeHasDateDPD = (customRule) => {
    for (let conditionCount = 0; conditionCount < customRule.Condition.length; conditionCount++) {
        const rule = customRule.Condition[conditionCount];
        const hasDPDCalculations = OperationsUtil.hasDPDCalculations(rule);
        if (hasDPDCalculations) {
            return false;
        }
    }
    return OperationsUtil.isOutcomeHasDateDPD(customRule.Outcome);
};

/**
 * This method checks if the rule has any dpd calculations
 */
export const getDPDFilterCondition = (customFieldCondition) => {
    const dpdArray = [];
    const copy = JSON.parse(JSON.stringify(customFieldCondition));
    for (let i = 0; i < copy.ref.length; i++) {
        const ref = copy.ref[i];
        if (isDPDFilterRequired(ref)) {
            dpdArray.push(ref);
        }
        delete copy.ref[i];
    }

    if (isDPDFilterRequired(copy)) {
        dpdArray.push(copy);
    }
    return dpdArray;
};

export const isDPDFilterRequired = (rule) => {
    return StringUtil.toLowerCase(rule.DType) == CONSTANTS.types.DPD;
};

export const isDPDValueFilterRequired = (rule) => {
    return StringUtil.toLowerCase(rule.DType) == CONSTANTS.types.DPD && StringUtil.toLowerCase(rule.exp2) != "diff-month" && StringUtil.toLowerCase(rule.exp2) != "diff-month-recent";
};

/**
 * get the Template based on dataType or default
 */
export const getTemplate = (dataType, defaultTemplate) => {
    if (CONSTANTS.types.STRING == dataType) {
        return CONSTANTS.STRING_OPERATION;
    } else if (CONSTANTS.types.DATE == dataType) {
        return CONSTANTS.DATE_OPERATION;
    } else if (CONSTANTS.types.INTEGER == dataType) {
        return CONSTANTS.NUMBER_OPERATION;
    } else {
        return defaultTemplate;
    }
};

/**
 * This method returns minimum of 2 values depending on dataType
 */
export const minValueByDataType = (val1, val2, dataType) => {
    if (CONSTANTS.types.INTEGER == dataType) {
        return Math.min(val1, val2);
    } else if (CONSTANTS.types.DATE == dataType) {
        return DateUtil.minDate(val1, val2);
    } else {
        return "";
    }
};

/**
 * This method returns maximum of 2 values depending on dataType
 */
export const maxValueByDataType = (val1, val2, dataType) => {
    if (CONSTANTS.types.INTEGER == dataType) {
        return Math.max(val1, val2);
    } else if (CONSTANTS.types.DATE == dataType) {
        return DateUtil.maxDate(val1, val2);
    } else {
        return "";
    }
};

/**
 * Method maps the outcome operation to operator
 */
export const operatorByStrOperation = (operation) => {
    if (CONSTANTS.outcomeType.MULTIPLICATION == operation) {
        return "*";
    } else if (CONSTANTS.outcomeType.DIVISION == operation) {
        return "/";
    } else if (CONSTANTS.outcomeType.ADDITION == operation) {
        return "+";
    } else if (CONSTANTS.outcomeType.DIFFERENCE == operation) {
        return "-";
    } else if (CONSTANTS.outcomeType.RATIO == operation) {
        return "/";
    } else {
        return "=";
    }
};

/**
 * Check if the score card is valid
 * @param scoreCard
 * @returns {boolean}
 */
export const isValidScoreCard = (scoreCard) => {
    let isValid = true;
    if(!scoreCard.name) {
        isValid = false;
    }
    if(scoreCard.categories && scoreCard.categories.length == 0) {
        isValid = false;
    }
    return isValid;
};

/**
 * Check if the custom field is valid
 */
export const isValidDerivedField = (customField) => {
    let isValid = true;
    if (customField.custom_type == CONSTANTS.CUSTOM || customField.custom_type == CONSTANTS.MATCHING) {
        if (customField.RULES && customField.RULES.length > 0) {
            for (let i = 0; i < customField.RULES.length; i++) {
                const conditions = customField.RULES[i].Condition;
                for (let j = 0; j < conditions.length; j++) {
                    const condition = conditions[j];
                    if (!StringUtil.notBlank(condition.fieldname)) {
                        isValid = false;
                    }
                    for (let r = 0; r < condition.ref.length; r++) {
                        const ref = condition.ref[r];
                        if (!StringUtil.notBlank(ref.fieldname)) {
                            isValid = false;
                        }
                    }
                }
            }
        } else {
            isValid = false;
        }
    }
    if (customField.custom_type == CONSTANTS.FINANCIAL) {
        if (customField.FINANCIAL_FIELD_LIST && customField.FINANCIAL_FIELD_LIST.length > 0) {
            customField.FINANCIAL_FIELD_LIST.forEach((curField) => {
                if (!StringUtil.notBlank(curField.FIELD_NAME)) {
                    isValid = false;
                }
            });
        } else {
            isValid = false;
        }
    }
    return isValid;
};

/**
 * Method maps the outcome operation to operator
 */
export const financialFieldOperation = (operation) => {
    if (operation == "min") {
        return "min";
    } else if (operation == "max") {
        return "max";
    } else if (operation == "sum") {
        return "sum";
    } else if (operation == "avg") {
        return "mean";
    } else {
        return "custom";
    }
};

/**
 * Method maps the outcome operation to operator
 */
export const dpdFieldOperation = (operation) => {
    if (CONSTANTS.dpdOutcome.MAX_DPD_VAL == operation || operation == "MAX-DPD_VAL" || operation == "MAX_DPD_VAL" || operation == "MAX-DPD-VAL-0.5") {
        return "maxNumNonNegative";
    } else if (CONSTANTS.dpdOutcome.MIN_DPD_VAL == operation || operation == "MIN-DPD_VAL" || operation == "MIN_DPD_VAL" || operation == "MIN-DPD-VAL-0.5") {
        return "minNumNonNegative";
    } else if (dpdMaxDateArr.includes(operation)) {
        return "dateMax";
    } else if (dpdMinDateArr.includes(operation)) {
        return "dateMin";
    } else if (CONSTANTS.dpdOutcome.COUNT_DPD_VAL == operation || operation == "COUNT-DPD_DATE" || operation == "COUNT_DPD_DATE") {
        return "size";
    } else if (CONSTANTS.dpdOutcome.SUM_DPD_VAL == operation || operation == "SUM-DPD_DATE" || operation == "SUM_DPD_DATE") {
        return "sum";
    } else {
        return "size";
    }
};

/**
 * This method tells whether default value should be specified for a custom field or not
 */
export const addDefaultValueToCustomField = (customField) => {
    const result = customField.RULES.filter((r) => OperationsUtil.isOutcomeHasDateDPD(r.Outcome));
    return result.length == 0;
};

/**
 *
 * Method to get the comparison operation for matching fields
 */
export const matchingFieldComparisionType = (field) => {
    if (StringUtil.toUpperCase(field) == "S") {
        return "stringMatch";
    } else if (StringUtil.toUpperCase(field) == "N") {
        return "numberMatch";
    } else if (StringUtil.toUpperCase(field) == "DATE") {
        return "dateMatch";
    } else if (StringUtil.toUpperCase(field) == "ADDRESS") {
        return "addressMatch";
    } else {
        return "stringMatch";
    }
};

/**
 * This methods returns Trade custom fields name
 * @param str
 * @returns {string}
 */
export const tradeCustomFieldName = (str) => {
    return "global" + "[\"" + str + "\"]";
};

export const analyticalFieldsName = (fieldname, specID) =>{
    return "analyticalField" + "[\"" + fieldname + "_" + specID + "\"]";
}

/**
 *
 * Method to get the comparison operation for matching fields
 */
export const scoringOperations = (operation) => {
    if (operation == CONSTANTS.scoringBaseOperator.ADDITION || operation == CONSTANTS.scoringBaseOperator.DIFFERENCE || operation == CONSTANTS.scoringBaseOperator.MULTIPLICATION || operation == CONSTANTS.scoringBaseOperator.DIVISION) {
        return operation;
    } else if (operation == CONSTANTS.scoringBaseOperator.Exp) {
        return "exp";
    } else if (operation == CONSTANTS.scoringBaseOperator.Exp1) {
        return "exp1";
    } else if (operation == CONSTANTS.scoringBaseOperator.YCMX) {
        return "ycmx";
    } else if (operation == CONSTANTS.scoringBaseOperator.ESCORE) {
        return "escore";
    } else if (operation == CONSTANTS.scoringBaseOperator.ESCORE1) {
        return "escore1";
    } else {
        return CONSTANTS.scoringBaseOperator.ADDITION;
    }
};

export const getScoreAdjustment = (scoreCardName) => {
    if ("UC_INC_SUR_SCORECARD" == StringUtil.toUpperCase(scoreCardName)) {
        return 6.9025;
    } else if ("UC_CNC_SCORECARD" == StringUtil.toUpperCase(scoreCardName)) {
        return 5.8858;
    } else if ("UC_INC_SUR_noBDS" == StringUtil.toUpperCase(scoreCardName)) {
        return 6.3257;
    } else if ("UC_NOHIT_WO_BDS" == StringUtil.toUpperCase(scoreCardName)) {
        return 5.0411;
    } else if ("UC_NOHIT_BDS" == StringUtil.toUpperCase(scoreCardName)) {
        return 5.2313;
    } else if ("TW_HIT_SCORECARD" == StringUtil.toUpperCase(scoreCardName)) {
        return 1.3207;
    } else if ("TW_NOHIT_SCORECARD" == StringUtil.toUpperCase(scoreCardName)) {
        return 2.0985;
    } else if ("TW_NOHIT_WITH_BDS" == StringUtil.toUpperCase(scoreCardName)) {
        return -1.4135;
    } else if ("CD_NOHIT_DIGITAL" == StringUtil.toUpperCase(scoreCardName)) {
        return 4.6754;
    } else if ("CD_HIT" == StringUtil.toUpperCase(scoreCardName)) {
        return 5.3807;
    } else if ("CD_NOHIT" == StringUtil.toUpperCase(scoreCardName)) {
        return 4.862;
    } else if ("HL_SCORECARD" == StringUtil.toUpperCase(scoreCardName)) {
        return 9.5813;
    } else if ("BL_SCORECARD" == StringUtil.toUpperCase(scoreCardName)) {
        return 4.308;
    } else if ("CD SCORECARD WITH CC" == StringUtil.toUpperCase(scoreCardName)) {
        return 1.9529;
    } else if ("CD SCORECARD WITHOUT CC" == StringUtil.toUpperCase(scoreCardName)) {
        return 3.6946;
    } else if ("CD SCORECARD NTC" == StringUtil.toUpperCase(scoreCardName)) {
        return 2.417;
    } else {
        return 4.277;
    }
};

export const isArrayInIFFOccurance = (iffStructure) => {
    return (iffStructure && iffStructure.OCCURANCE == "N");
};

export const fullProofObject = (obj) =>{
    const strArr = obj.split(".");
    const finalArr = [];
    for(let i =0; i < strArr.length; i++) {
        if(strArr[i].includes("[")) {
            finalArr.push(...strArr[i].split("[").join("+++[").split("+++"));
        }
        else {
            finalArr.push(strArr[i]);
        }
    }
    let temp;
    const arr = [];
    finalArr.forEach((cur, index)=> {
        if(index == 0) {
            temp = cur;
            arr.push(temp);
        } else {
            if(cur.includes("[")) {
                temp = `${arr[index-1]}${cur}`;
            }
            else {
                temp = `${arr[index-1]}.${cur}`;
            }
            arr.push(temp);
        }
    });
    return arr.join(" && ");
};

export const computeLogicBasedOnFields = (expression, iffData, isTrade = false, isOutcomeTradeField = false) => {
    const eligibilityTradeFields:any = ["CIBIL_RESPONSE$accountList", "EXPERIAN_RESPONSE$caisAccount$caisAccountDetails", "HIGHMARK_RESPONSE$baseReports$baseReport$accountList", "MERGED_RESPONSE$activeTradelines"];
    let operatorPosition = {};
    let operators = ["+", "-", "*", "/"];
    let exp = expression.replace(/[()]/g, "");
    let expArray;
    if (isNaN(exp)) {
        if(isOutcomeTradeField){
            return exp.replace(/[-+*\/]/g, "__").split("__").map(x => x.trim());
        }

        for(let i = 0 ; i < operators.length; i++) {
            const operator = operators[i];
            const locations = StringUtil.locations(operator, expression);
            locations.forEach(p => operatorPosition[p] = operator );
        }

        if(!StringUtil.isValidExpression(expression)){
            expression = exp;
        }

        expression = expression.replace(/[-+*\/]/g, "__");
        expArray = expression.split("__");
        let modifiedExp = {};
        for (let expCount = 0; expCount < expArray.length; expCount++) {
            let currExp = expArray[expCount].replace(/[()]/g, "").trim();
            if(isNaN(currExp)){
                const iffStructure = IFFHelper.iffStructure(CONSTANTS.IFF_STRUCTURE, currExp, iffData);
                let currField = getFieldBasedOnStructure(CONSTANTS.IFF_STRUCTURE, currExp, "");
                const split = IFFHelper.splitIffField(currField, ".");
                const splitUsingDollar = IFFHelper.splitIffField(currExp, "$");

                if(isTrade && eligibilityTradeFields.includes(splitUsingDollar[0])) {
                    modifiedExp = "_.NumberOrZero(" +fullProofObject( "obj." + split[1]) + ")";
                } else if(iffStructure && iffStructure.OCCURANCE == "N") {
                    const splitFullProof = fullProofObject(split[0]) + " && " + split[0] + "[0]." + split[1];
                    modifiedExp = "_.NumberOrZero(" + splitFullProof + ")";
                } else if(isTrade && currExp.split("$")[0] == CONSTANTS.CUSTOM_FIELDS){
                    let field =` ${tradeCustomFieldName(currExp.split("$")[1])}(obj)`;
                    modifiedExp = "_.NumberOrZero(" + fullProofObject(field) +")";
                } else if(!isTrade) {
                    const masterStructure = IFFHelper.masterStructure(CONSTANTS.MASTER_STRUCTURE, currExp, iffData);
                    if(masterStructure) {
                        currField = getFieldBasedOnStructure(CONSTANTS.MASTER_STRUCTURE, currExp, "");
                    }
                    modifiedExp ="_.NumberOrZero("+fullProofObject(currField) +")";
                } else {
                    modifiedExp ="_.NumberOrZero("+fullProofObject(currField) +")";
                }
                expArray[expCount] = expArray[expCount].replace(currExp, modifiedExp);
            }
        }
        let result = "";
        let positions = [];
        lodash.sortBy(Object.keys(operatorPosition), [function(o) { return Number(o); }]).forEach((x) => positions.push(operatorPosition[x]));
        expArray.forEach((x, index) =>  result = result  + x + (positions[index] ? positions[index] : "") );

        return result;
    } else {
        return exp;
    }
};

export const isTradeLevelEligibility = (INSTITUTION_ID)=>{
    let isTreade = false;
    if(INSTITUTION_ID && INSTITUTION_ID.toString() == "4019" ||INSTITUTION_ID && INSTITUTION_ID.toString() == "3989"
        || INSTITUTION_ID && INSTITUTION_ID.toString() == "4010" ||INSTITUTION_ID && INSTITUTION_ID.toString() == "4142"){
        isTreade = true;
    }
    return isTreade;
};

export const eligibilityCustomFieldCriteria = () => {
    return ["ELIGIBLE_DECISION", "ELIGIBLE_LOAN_AMOUNT", "ELIGIBLE_LOAN_DP", "ELIGIBLE_LOAN_TENOR", "APPROVED_AMT"];
};

export const scoreCardCustomFieldCriteria = (scoreCards) => {
    const scoreCriteria = [];
    for(let i = 0; i< scoreCards.length; i ++) {
        const scoreCard = scoreCards[i];
        scoreCriteria.push(StringUtil.toUpperCase(`${scoreCard.name}_SCORE`));
        scoreCriteria.push(StringUtil.toUpperCase(`${scoreCard.name}_SCORE_BAND`));
    }
    return scoreCriteria;
};

export const creditRuleCustomFieldCriteria = (creditRules) => {
    const scoreCriteria = [];
    for(let i = 0; i< creditRules.length; i ++) {
        const creditRule = creditRules[i];
        scoreCriteria.push(StringUtil.toUpperCase(creditRule.name));
    }
    return scoreCriteria;
};