import {CONSTANTS} from "./com/softcell/sobre/constants/constants";

const handlebars = require("handlebars");
const helpers = require("handlebars-helpers")();
const fs = require("fs");
const beautify = require("js-beautify").js;
// Our data source
import * as IFFHelper from "./com/softcell/sobre/helper/IFFHelper";
const performance = require("perf_hooks").performance;

const decode = require("unescape");

decode.chars["&#x3D;"] = "=";
const vm = require("vm");
import { isCustomType } from "./com/softcell/sobre/helper/commonHelper";
import { getData, getData2 } from "./com/softcell/sobre/helper/masterIPCHelper";
import { CustomField } from "./com/softcell/sobre/models/customFieldModel";
import { MasterConfig } from "./com/softcell/sobre/models/master/masterConfig";
import { MasterModel } from "./com/softcell/sobre/models/master/masterModel";
import SoBREPolicyModel from "./com/softcell/sobre/models/soberPolicyModel";
import { HandleBarhelpers } from "./handleBarHelper";
import { TemplateLibraryProd } from "./templateProviderProd";
import { Config } from "../config";
import workflowFieldService from "./com/softcell/sobre/services/workflowFieldService"

const lodash = require("lodash");

// const teamplate = require('./templates/teamplates').simpleCheck
const globalHandleBarHelper = new HandleBarhelpers();

globalHandleBarHelper.addAllHelpers(handlebars);

let templateReg = (new TemplateLibraryProd()).getMain();
handlebars.registerPartial(templateReg);

// Use strict mode so that Handlebars will throw exceptions if we
// attempt to use fields in our template that are not in our data set.
// const template = handlebars.compile(teamplate, { strict: false });
const output = {};

export const setContextAsConverage = (isCoverage) => {
    templateReg = (new TemplateLibraryProd()).getMain(isCoverage);
    handlebars.registerPartial(templateReg);
};

const getDFSObject = (obj, path) => {
    const paths = path.split(".");
    let curlink = obj;

    paths.forEach((path) => {
        if (!curlink[path]) {
            curlink[path] = {};
        }
        curlink = curlink[path];
    });
    return curlink;
};

this.getDFSObject = getDFSObject;
const self = this;
self.curOutput = {};

lodash.performance = performance;

lodash.responseDateTime = () => {
    const result = new Date();
    const day = ("0" + (result.getDate())).slice(-2);
    const month = ("0" + (result.getMonth() + 1)).slice(-2);
    const year = result.getFullYear();
    const hour = ("0" + (result.getHours())).slice(-2);
    const minute = ("0" + (result.getMinutes())).slice(-2);
    const seconds = ("0" + (result.getSeconds())).slice(-2);
    return `${day}${month}${year} ${hour}:${minute}:${seconds}`;
};

lodash.stringToDate = (date, format) => {
    if (!date || date.length == 0 || !format || format.length == 0) {
        return "";
    }
    const _date = date.replace(/-|\.|:|\\|\//g, "");
    const _format = format.replace(/-|\.|:|\\|\//g, "");
    const formatLowerCase = _format.toLowerCase();
    let month, yearYYYY, day;
    const monthIndex = formatLowerCase.indexOf("mm");
    const dayIndex = formatLowerCase.indexOf("dd");
    const yearYYYYIndex = formatLowerCase.indexOf("yyyy");

    month = _date.substring(monthIndex, monthIndex + "mm".length);
    day = _date.substring(dayIndex, dayIndex + "dd".length);
    yearYYYY = _date.substring(yearYYYYIndex, yearYYYYIndex + "yyyy".length);
    return new Date(yearYYYY, month - 1, day);
};

/**
 * When trying to add or subtract months from a Javascript Date() Object which is any end date of a month,
 * JS automatically advances your Date object to next month's first date if the resulting date does not exist in its month.
 * For example when you add 1 month to October 31, 2008 , it gives Dec 1, 2008 since November 31, 2008 does not exist.
 * if the result of subtraction is negative and add 6 to the index and check if JS has auto advanced the date,
 * then set the date again to last day of previous month
 * Else check if the result of subtraction is non negative, subtract nofMonths to the index and check the same.
 * @param date
 * @param nofMonths
 * @returns {any}
 */
lodash.getDateMonthsBefore = (date, nofMonths) => {
    const thisMonth = date.getMonth();
    date.setMonth(thisMonth - nofMonths);
    if ((thisMonth - nofMonths < 0) && (date.getMonth() != (thisMonth + nofMonths))) {
        date.setDate(0);
    } else if ((thisMonth - nofMonths >= 0) && (date.getMonth() != thisMonth - nofMonths)) {
        date.setDate(0);
    }
    return date;
};

// Max should be integer always
lodash.maxNum = (arr) => {
    arr = arr.filter((a) => !isNaN(a));
    if(arr != null && arr.length > 0) {
        const max = lodash.max(arr);
        return Math.floor(max);
    } else {
        return CONSTANTS.NA;
    }
};

// Min should be integer always
lodash.minNum = (arr) => {
    arr = arr.filter((a) => !isNaN(a));
    if(arr != null && arr.length > 0) {
        const min = lodash.min(arr);
        return Math.floor(min);
    } else {
        return CONSTANTS.NA;
    }
};

// Max should be integer always
lodash.maxNumNonNegative = (arr) => {
    const result = lodash.maxNum(arr);
    return (isNaN(result) || result < 0) ? 0 : result;
};

// Min should be integer always
lodash.minNumNonNegative = (arr) => {
    const result = lodash.minNum(arr);
    return (isNaN(result) || result < 0) ? 0 : result;
};

lodash.isStrEqual = (input, strToCheck) => {
    input = (!input || input == null || input == "undefined" || input.trim() == "" || input.trim() == "null") ? "" : input;
    strToCheck = (!strToCheck || strToCheck == null || strToCheck == "undefined" || strToCheck.trim() == "" || strToCheck.trim() == "null") ? "" : strToCheck;
    return input.trim().toLowerCase() == strToCheck.trim().toLowerCase();
};

lodash.sizeDistinct = (array) => {
    let set;
    if (array[0] && (array[0] instanceof Date)) {
        set = new Set(array.map((a) => a.getTime()));
    } else if (array[0] && (typeof array[0] == "string")) {
        set = new Set(array.map(x => x && x.toLowerCase()));
    } else {
        set = new Set(array);
    }
    return set.size;
};

lodash.isStrNotEqual = (input, strToCheck) => {
    return !(lodash.isStrEqual(input, strToCheck));
};

lodash.notIncludes = (input, strToCheck) => {
    return !(lodash.includesWithoutCase(input, strToCheck));
};

lodash.includesWithoutCase = (input, strToCheck) => {
    return (lodash.includes(input.toUpperCase(), strToCheck.toUpperCase()));
};

/**
 * Overriding lodash endsWith method so it will be case insensitive
 * endsWith('abc', 'c')
 * // => true
 *
 * endsWith('abc', 'C')
 * // => true
 *
 * endsWith('abc', 'b')
 * // => false
 *
 * endsWith('abc', 'b', 2)
 * // => true
 * @param {string} string
 * @param {string} target
 * @param {number} position
 * @returns {boolean}
 */
lodash.endsWith = (string, target, position) => {
    const { length } = string;
    position = position === undefined ? length : +position;
    if (position < 0 || position != position) {
        position = 0;
    }
    else if (position > length) {
        position = length;
    }
    const end = position;
    position -= target.length;
    return position >= 0 && lodash.toUpper(string).slice(position, end) == lodash.toUpper(target);
};

/**
 * Overriding lodash startsWith method so it will be case insensitive
 * startsWith('abc', 'a')
 * // => true
 *
 * startsWith('abc', 'A')
 * // => true
 *
 * startsWith('abc', 'b')
 * // => false
 *
 * startsWith('abc', 'b', 1)
 * // => true
 * @param {string} string
 * @param {string} target
 * @param {number} position
 * @returns {boolean}
 */
lodash.startsWith = (string, target, position) => {
    const { length } = string;
    position = position == null ? 0 : position;
    if (position < 0) {
        position = 0
    }
    else if (position > length) {
        position = length
    }
    target = `${target}`;
    return lodash.toUpper(string).slice(position, position + target.length) == lodash.toUpper(target);
};

lodash.notInRange = (input, range1, range2) => {
    return !(lodash.inRange(input, range1, range2));
};

lodash.dateInRange = (input, range1, range2) => {
    if ((!input && input.length == 0) || (!range1 && range1.length == 0) || (!range2 && range2.length == 0)) {
        return false;
    }
    return !(lodash.dateIsBefore(input, range1) || lodash.dateIsAfter(input, range2));
};

lodash.dateNotInRange = (input, range1, range2) => {
    range2.setDate(range2.getDate() + 1);
    return !lodash.dateInRange(input, range1, range2);
};

lodash.dateIsBefore = (date1, date2) => {
    return date1.valueOf() < date2.valueOf();
};

lodash.dateIsAfter = (date1, date2) => {
    return !lodash.dateIsBefore(date1, date2);
};

lodash.dateEqual = (date1, date2) => {
    return date1.valueOf() == date2.valueOf();
};

lodash.dateDiffDays = (date1, date2) => {
    let result = 0;
    if (date1 && date2) {
        result = (date1.valueOf() - date2.valueOf()) / (1000 * 60 * 60 * 24);
        if (result < 0) {
            result = result * -1;
        }
    }
    return result;
};

/**
 * This method returns rounded date to nearest integer. And diff month will be always devide by 30.5
 * e.g. 26.8  will be treated as 27.
 * e.g. 26.2  will be treated as 26.
 * @param date1
 * @param date2
 * @returns {number}
 */
lodash.dateDiffMonth = (date1, date2) => {
    let result = 0;
    if (date1 && date2) {
        result = Math.round(lodash.dateDiffDays(date1, date2) / 30.5);
        if (result < 0) {
            result = result * -1;
        }
    }
    return result;
};

/**
 * This method returns exact difference between months in Integer format
 * e.g. 26.8  will be treated as 26.
 * e.g. 26.2  will be treated as 26.
 * @param date1
 * @param date2
 * @returns {any}
 */
lodash.dateDiffMonthExact = (date1, date2) => {
    let result;
    if (date1 && date2) {
        result = (date1.getFullYear() * 12 + date1.getMonth()) - (date2.getFullYear() * 12 + date2.getMonth());
        if (result < 0) {
            result = result * -1;
        }
        if (date1.getDate() < date2.getDate()) {
            result--;
        }
    }
    return result;
};

// Average should be fixed to 4 digit decimal always
function sortDates(arr) {
    let sortedDates = lodash.sortBy(arr);
    return sortedDates.filter(d => d instanceof Date);
}

lodash.minGapDays = (arr) => {
    let sortedDates = sortDates(arr);
    const gap = [];
    for (let i = 0; i < sortedDates.length - 1; i++) {
        gap.push(lodash.dateDiffDays(sortedDates[i], sortedDates[i + 1]));
    }
    return gap.length > 0 ? lodash.minNum(gap) : undefined;
};

lodash.maxGapDays = (arr) => {
    let sortedDates = sortDates(arr);
    const gap = [];
    for (let i = 0; i < sortedDates.length - 1; i++) {
        gap.push(lodash.dateDiffDays(sortedDates[i], sortedDates[i + 1]));
    }
    return gap.length > 0 ? lodash.maxNum(gap) : undefined;
};

lodash.minGapMonths = (arr) => {
    let sortedDates = sortDates(arr);
    const gap = [];
    for (let i = 0; i < sortedDates.length - 1; i++) {
        gap.push(lodash.dateDiffMonth(sortedDates[i], sortedDates[i + 1]));
    }
    return gap.length > 0 ? lodash.minNum(gap) : undefined;
};

lodash.maxGapMonths = (arr) => {
    let sortedDates = sortDates(arr);
    const gap = [];
    for (let i = 0; i < sortedDates.length - 1; i++) {
        gap.push(lodash.dateDiffMonth(sortedDates[i], sortedDates[i + 1]));
    }
    return gap.length > 0 ? lodash.maxNum(gap) : undefined;
};

lodash.dateNotEqual = (date1, date2) => {
    return !(lodash.dateEqual(date1, date2));
};

lodash.dateMax = (array) => {
    const result = new Date(Math.max.apply(null, array));
    const day = ("0" + (result.getDate())).slice(-2);
    const month = ("0" + (result.getMonth() + 1)).slice(-2);
    const year = result.getFullYear();
    return `${day}${month}${year}`;
};

lodash.dateMin = (array) => {
    const result = new Date(Math.min.apply(null, array));
    const day = ("0" + (result.getDate())).slice(-2);
    const month = ("0" + (result.getMonth() + 1)).slice(-2);
    const year = result.getFullYear();
    return `${day}${month}${year}`;
};

lodash.dateRangeByEndDate = (count, date2) => {
    let date1 = new Date(date2);
    date1.setMonth(date1.getMonth() + 1 - count);
    const dates = [];
    const addMonths = function (months) {
        const date = new Date(this.valueOf());
        date.setMonth(date.getMonth() + months);
        return date;
    };
    while (date1 <= date2) {
        dates.push(date1);
        date1 = addMonths.call(date1, 1);
    }
    return dates;
};

function baseSum(array, iteratee) {
    let result;
    for (const value of array) {
        const current = iteratee(value);
        if (current != undefined) {
            result = result == undefined ? current : (result + current);
        }
    }
    return result;
}

// Sum should be fixed to 2 digit decimal always
lodash.sum = (array) => {
    array = array.filter((a) => !isNaN(a));
    if(array != null && array.length > 0) {
        const result = baseSum(array, (value) => value);
        return parseFloat(Number(result).toFixed(2));
    } else {
        return CONSTANTS.NA;
    }
};

// SumBy should be fixed to 2 digit decimal always
lodash.sumBy = (array, iteratee) => {
    if(array != null && array.length > 0) {
        const result = baseSum(array, iteratee);
        return parseFloat(Number(result).toFixed(2));
    } else {
        return CONSTANTS.NA;
    }
};

function baseMean(array, iteratee) {
    const length = array == null ? 0 : array.length;
    return length ? (baseSum(array, iteratee) / length) : NaN;
}

// Average should be fixed to 2 digit decimal always
lodash.mean = (array) => {
    array = array.filter((a) => !isNaN(a));
    const result = (array != null && array.length > 0) ? baseMean(array, (value) => value) : 0;
    return parseFloat(Number(result).toFixed(2));
};

lodash.arrayToStringFormat = (inputArray) => {
    inputArray = inputArray.filter((i) => i != undefined && i != null && i != "");
    if(Array.isArray(inputArray) && inputArray.length == 0) {
        return CONSTANTS.NULL;
    } else {
        const result = inputArray.join(", ");
        return "[" + result + "]";
    }
};

lodash.nullOrValue = (value) => {
    return value == undefined ? CONSTANTS.NULL : value;
};

lodash.getValueFromString = (collection, req) => {
    const result = lodash.map(collection, (obj) => {
        return lodash.get(req, obj);
    });
    return result.join(" ");
};

lodash.stringMatch = (leftStr, rightStr, strFlag) => {
    if ((leftStr && leftStr.length == 0) || (rightStr && rightStr.length == 0)) {
        return -1;
    }

    strFlag = strFlag ? strFlag : false;
    leftStr = strFlag ? leftStr.toUpperCase() : leftStr.join(" ").toUpperCase();
    rightStr = strFlag ? rightStr.toUpperCase() : rightStr.join(" ").toUpperCase();

    if (leftStr.length < 2) {
        return 0;
    }

    const map = {};
    const possibility = leftStr.length + rightStr.length - 2;
    for (let i = 0; i <= leftStr.length - 2; i++) {
        const sub = leftStr.substr(i, 2);
        if (map[sub]) {
            map[sub] = map[sub] + 1;
        } else {
            map[sub] = 1;
        }
    }
    let match = 0;
    for (let i = 0; i <= rightStr.length - 2; i++) {
        const sub = rightStr.substr(i, 2);
        if (map[sub] >= 0) {
            match = match + 1 + map[sub];
            map[sub] = 0;
        }
    }
    const result = match / possibility;
    return lodash.round(result * 100, 2);
};

lodash.numberMatch = (left, right) => {
    if (left[0] == right[0]) {
        return 100;
    } else {
        return 0;
    }
};

lodash.dateMatch = (date1, date2) => {
    if (lodash.dateEqual(date1, date2)) {
        return 100;
    } else {
        return 0;
    }
};

lodash.exp = (value) => {
    const result = 1 - (Math.exp(value) / (1 + Math.exp(value)));
    return parseFloat(Number(result).toFixed(4));
};

lodash.exp1 = (value) => {
    const result = Math.exp(value) / (1 + Math.exp(value));
    return parseFloat(Number(result).toFixed(4));
};

lodash.ycmx = (value) => {
    return Math.round(417.80719051 + (72.134752044 * value));
};

lodash.escore = (value) => {
    const result = (1 / (1 + Math.exp(value)));
    return parseFloat(Number(result).toFixed(4));
};

lodash.escore1 = (value) => {
    const result = (1 / (1 + Math.exp(value * -1)));
    return parseFloat(Number(result).toFixed(4));
};

lodash.addressMatch = (leftArray, rightArray) => {
    const result = [];
    leftArray = leftArray.map((x) => x.join(" "));
    rightArray = rightArray.map((x) => x.join(" "));
    leftArray.forEach((curElement, index) => {
        rightArray.forEach((curRightElement, index) => {
            result.push(lodash.stringMatch(curElement.toString(), curRightElement.toString(), true));
        });
    });

    rightArray.forEach((curElement, index) => {
        leftArray.forEach((currRightElement, index) => {
            result.push(lodash.stringMatch(curElement.toString(), currRightElement.toString(), true));
        });
    });

    return Math.max(...result);
};

lodash.finalDecision = (crdtRulDecision, elgbltyDecision) => {
    if(lodash.isStrEqual(elgbltyDecision, "Approved") && lodash.isStrEqual(crdtRulDecision, "")) {
        return "Approved";
    } else if(lodash.isStrEqual(elgbltyDecision, "Approved") && lodash.isStrEqual(crdtRulDecision, "Queue" )) {
        return "Queue";
    } else if(lodash.isStrEqual(elgbltyDecision, "Approved") && lodash.isStrEqual(crdtRulDecision, "Declined")) {
        return "Declined";
    } else if(lodash.isStrEqual(elgbltyDecision, "Approved") && lodash.isStrEqual(crdtRulDecision, "Approved")) {
        return "Approved";
    } else if(lodash.isStrEqual(elgbltyDecision, "Declined") && lodash.isStrEqual(crdtRulDecision, "")) {
        return "Declined";
    } else if(lodash.isStrEqual(elgbltyDecision, "Declined") && lodash.isStrEqual(crdtRulDecision, "Approved")) {
        return "Declined";
    } else if(lodash.isStrEqual(elgbltyDecision, "Declined") && lodash.isStrEqual(crdtRulDecision, "Queue")) {
        return "Declined";
    } else if(lodash.isStrEqual(elgbltyDecision, "Declined") && lodash.isStrEqual(crdtRulDecision, "Declined")) {
        return "Declined";
    } else if(lodash.isStrEqual(elgbltyDecision, "Queue") && lodash.isStrEqual(crdtRulDecision, "")) {
        return "Queue";
    } else if(lodash.isStrEqual(elgbltyDecision, "Queue") && lodash.isStrEqual(crdtRulDecision, "Approved")) {
        return "Queue";
    } else if(lodash.isStrEqual(elgbltyDecision, "Queue") && lodash.isStrEqual(crdtRulDecision, "Queue")) {
        return "Queue";
    } else if(lodash.isStrEqual(elgbltyDecision, "Queue") && lodash.isStrEqual(crdtRulDecision, "Declined")) {
        return "Declined";
    }
    return "Queue";
};

lodash.shift = (array) => {
    return array.shift();
};

/**
 * This method return a value only if input is valid number. Otherwise NaN
 * @param str
 * @returns {number}
 * @constructor
 */
lodash.Number = (str) => {
    if(typeof(str) == "string" && str.includes("-")) {
        str = str.substr(str.indexOf("-"), str.length);
    }
    if (!isNaN(parseInt(str))) {
        return Number(str);
    } else if(str == Infinity){
        return 0;
    } else {
        return !str || str.trim().length == 0 ? NaN : str;
    }
};

/**
 * This method return a value only if input is valid number. Otherwise 0
 * @param str
 * @returns {number}
 * @constructor
 */
lodash.NumberOrZero = (str) => {
    const result = lodash.toNumber(str);
    return isNaN(result) ? 0 : result;
};

lodash.matchTwoArray = (leftArray,rightArray, operator) =>{
    if(leftArray.length == 0 || rightArray.length == 0){
        return false;
    }
    for(let count = 0; count<leftArray.length;count++){
        for(let innerCount = 0;innerCount<rightArray.length;innerCount++){
            if(lodash[operator](leftArray[count], rightArray[innerCount])){
                return true;
            }
        }
    }
    return false;
};

lodash.pop = (array) =>{
    return array.pop();
};

lodash.division = (numerator, denominator) =>{
    const isNumberValid = isNaN(parseInt(numerator)) || isNaN(parseInt(denominator));
    if(numerator && denominator && denominator !=0 && !isNumberValid){
        return numerator/denominator;
    }else{
        return "NA";
    }
}

lodash.performance = performance;

export const getScript = (finalJsCreated) => {
    finalJsCreated = getFinalJSStringToExecute(finalJsCreated);

    // console.log(finalJsCreated);

    return new vm.Script(finalJsCreated);
};

export const getFuncFromString = (finalJsCreated) => {
    finalJsCreated = getFinalJSStringToExecute(finalJsCreated);
    return new Function("loanReqObj", "loanResObj", "getDFSObject", "_", "console", "loanCoverageObj", "institutionId", finalJsCreated);
};

export const addWorkflowFields = () => {
    const workFLowFieldsJson = workflowFieldService.getWorkflowField();
    workFLowFieldsJson.forEach((curField) => {
        let objKey = Object.keys(curField)[1];
        const keyArry = objKey.split("_");
        if (keyArry.length == 1) {
            let fieldname = keyArry[0];
            global[fieldname] = new Function(curField[objKey].parameter, curField[objKey].body);
        } else {
            let workflowFieldName = keyArry.slice(1, keyArry.length).join("_");
            global[workflowFieldName] = new Function(curField[objKey].parameter, curField[objKey].body);

        }
    });
};

const assignWorkFLowFields = (loanReqObj) => {
    if(loanReqObj.__isWorkFlowExecuted){
        return loanReqObj;
    }
    if (!loanReqObj.WORKFLOW_FIELDS) {
        loanReqObj.WORKFLOW_FIELDS = {};
    }
    const workFLowFieldsJson = workflowFieldService.getWorkflowField();
    workFLowFieldsJson.forEach((curField) => {
        let objKey = Object.keys(curField)[1];
        const keyArry = objKey && objKey.split("_");
        if (keyArry && keyArry.length > 1) {
            let workflowFieldName = keyArry.slice(1, keyArry.length).join("_");
            let func = global[workflowFieldName];

            try {
                if(!curField.isNotWorkflow) {
                    loanReqObj.WORKFLOW_FIELDS[workflowFieldName] = func(lodash, loanReqObj);
                } else {
                    const workflowPath = workflowFieldName.split("_").join(".");
                    lodash.set(loanReqObj,workflowPath,func(lodash, loanReqObj));
                }
            } catch (err) {
                console.log("error in workflow ",workflowFieldName,JSON.stringify(err) );
                console.log(err);
            }

        }
    });
    //const endTime = performance.now();
    //console.log("workflow execute performance", endTime - staartTime);
    loanReqObj.__isWorkFlowExecuted=true;
    // console.log(loanReqObj.WORKFLOW_FIELDS);
    return loanReqObj;
};

///
export const execute = (finalJsCreated, application, isScript: boolean = false, isCoverage: boolean = false) => {
    application = assignWorkFLowFields(application);
    const startTimerunInContext = new Date().getTime();
    let coverage: any;
    let allfunctionNames: any;
    let registeredFunctions: any;
    if (isCoverage) {
        coverage = {};
        allfunctionNames = finalJsCreated.functionList;
        registeredFunctions = finalJsCreated.registeredFunctions;
    }
    if (finalJsCreated.finalJsCreated) {
        finalJsCreated = finalJsCreated.finalJsCreated;
    }
    if (!allfunctionNames) {
        isCoverage = false;
    }

    const institutionId = (application && application.HEADER && application.HEADER["INSTITUTION-ID"]);
    const vmcontext: any = {
        loanReqObj: application,
        institutionId,
        loanResObj: {},
        getDFSObject,
        _: lodash,
        console,
        loanCoverageObj: coverage,
    };

    let func = finalJsCreated;
    if (!isScript) {
        func = getFuncFromString(finalJsCreated);
    }

    const staartTime = performance.now();
    const valueFunc = func(vmcontext.loanReqObj, vmcontext.loanResObj, vmcontext.getDFSObject,
        vmcontext._, vmcontext.console, vmcontext.loanCoverageObj, vmcontext.institutionId);
    const endTime = performance.now();
    console.log("new execute performance", endTime - staartTime);

    if (isCoverage) {
        // get all fuctions

        const totalFunctions = allfunctionNames.length;
        let totalFunctionExecuted = 0;
        const coverageData: any = {};
        coverageData.executedFunctions = [];
        coverageData.unExecutedFunctions = [];
        for (let count = 0; count < totalFunctions - 1; count++) {
            const functionToCheck = allfunctionNames[count];
            // let registeredFunctionToCheck=registeredFunctions[functionToCheck];

            const funcInloanCoverageObj = vmcontext.loanCoverageObj[functionToCheck];

            if (funcInloanCoverageObj) {
                totalFunctionExecuted += 1;
                const funcObjToPush = {};

                coverageData.executedFunctions.push(functionToCheck);
            } else {
                coverageData.unExecutedFunctions.push(functionToCheck);
            }
        }
        if (totalFunctions) {
            vmcontext.loanResObj.coverageobj = { ...coverageData, loanCoverageObj: vmcontext.loanCoverageObj };
        }
        // get not  executed functions
        // calculate percentage coverage
        // prepare coverage object response object
    }
    return vmcontext.loanResObj;

};

export const execute_old = (finalJsCreated, application, isScript: boolean = false) => {
    // console.log(finalJsCreated);
    const startTimerunInContext = new Date().getTime();
    let script2 = finalJsCreated;
    if (!isScript) {
        script2 = getScript(finalJsCreated);
    }
    const institutionId = (application && application.HEADER && application.HEADER["INSTITUTION-ID"]);
    const vmcontext: any = {
        loanReqObj: application,
        institutionId,
        loanResObj: {},
        getDFSObject,
        _: lodash,
        console,
    };

    const context2 = new vm.createContext(vmcontext);
    script2.runInContext(context2);
    const endTimerunInContext = new Date().getTime();
    console.log("---time taken to execute_old policy is --> ", endTimerunInContext - startTimerunInContext, "ms");

    // console.log(JSON.stringify(vmcontext.loanResObj, null, 4));

    return vmcontext.loanResObj;

};

const getFinalJSStringToExecute = (savedString: string) => {
    const presTemplateString = (new TemplateLibraryProd()).getMain().preSetup;
    const finalJsCreated = `
        let curOutput,checkName;
    `;
    return "{\n" + finalJsCreated + presTemplateString + savedString + "\n}";
};

export const generateAndExecute = (policyRules, application) => {
    const finalJsCreated = generateWithFunctionNames(policyRules);
    if (!application) {
        return finalJsCreated.finalJsCreated;
    }

    return execute(finalJsCreated, application, false, true);
};

export const generateWithFunctionNames = (policyRules) => {
    globalHandleBarHelper.resetRegisterFunctions();
    globalHandleBarHelper.resetFunctionDefinitions();
    const finalJsCreated = generate(policyRules);
    return {
        functionList: globalHandleBarHelper.getAllFucntionNames(),
        finalJsCreated,
        registeredFunctions: globalHandleBarHelper.getRegisteredFunctions(),
        functionDefinitions: globalHandleBarHelper.getFunctionDefinitions()
    }
};

export const generate = (policyRules) => {
    const template = handlebars.compile("{{> main }}", { strict: false });
    let result = decode(template({ "breJsonArray": policyRules }));

    const functionDefinitions = globalHandleBarHelper.getFunctionDefinitions();
    let functionString = "";
    for (const funcName in functionDefinitions) {
        functionString += `
        var `+ funcName + `=` + functionDefinitions[funcName] + `
        `
    }
    result = functionString + " " + result;

    result.replace(/(^[ \t]*\n)/gm, "");

    const arrayOfLines = result.match(/[^\r\n]+/g);
    const actLines = [];
    arrayOfLines.forEach((element) => {
        if (element.trim() != "") {
            actLines.push(element);
        }
    });

    // START: Beautify and remove special char and \n \r from js created
    let finalJsCreated = actLines.join("\r\n");
    finalJsCreated = escapeSpecialChars(finalJsCreated);
    finalJsCreated = beautify(finalJsCreated);
    //END

    return finalJsCreated;
};

export const escapeSpecialChars = (finalJs) => {
    let find = [ ['&quot;', "\\\""], ['&amp;', '&'] ];
    for (let i = 0 ; i < find.length; i++) {
        let f = find[i];
        let re = new RegExp(f[0], 'g');
        finalJs=finalJs.replace(re, f[1]);
    }
    return finalJs;
};

export const collectMasterMetaData = (policyJson, iffData) => {
    const masterMetaData = [];
    getAllMasterFields(policyJson, masterMetaData, iffData);
    return masterMetaData;
};

export function processMasterData(curPolicy: SoBREPolicyModel, reqObject: any, allMasterData: MasterModel) {
    curPolicy.masterConfig.forEach((x) => {
        x.foreignKey = x.foreignKey.replace("IRP", "REQUEST");
    });
    const appliedMasterData: MasterConfig[] = applyMasterFieldData(curPolicy.masterConfig, reqObject);
    const masterData = getData(appliedMasterData, allMasterData);
    prepareReqForMasterData(reqObject, masterData);
}

export function processMasterData2(curPolicy: SoBREPolicyModel, reqObject: any, allMasterData: MasterModel) {
    curPolicy.masterConfig.forEach((x) => {
        x.foreignKey = x.foreignKey.replace("IRP", "REQUEST");
    });
    const appliedMasterData: MasterConfig[] = applyMasterFieldData(curPolicy.masterConfig, reqObject);
    const masterData = getData2(appliedMasterData, allMasterData);
    prepareReqForMasterData(reqObject, masterData);
}

export const collectCriteriaMasterMetaData = (policyJson, iffData, customFields) => {
    const masterMetaData = [];
    getAllCriteriaMasterFields(policyJson, masterMetaData, iffData, customFields);
    return masterMetaData;
};

export function applyMasterFieldData(masterMetaData, loanReqObj) {
    return masterMetaData.map((x: any) => {
        return {
            ...x,
            primaryKeyVal: x.foreignKey.split("$").reduce((o, cur) => {
                if (!o) {
                    return o;
                }
                // TODO: Need to handle array type
                // by default last element will be picked
                if (Array.isArray(o[cur])) {
                    return o[cur] && o[cur][o[cur].length - 1];
                }
                return o[cur];
            }, loanReqObj),
        };
    });
}

export function prepareReqForMasterData(loanReqObjMut: any, masterData: any[]) {
    loanReqObjMut.__MASTER = {};
    masterData.forEach((x) => {
        if (!loanReqObjMut.__MASTER[x.orgCollName]) {
            loanReqObjMut.__MASTER[x.orgCollName] = {};
        }
        loanReqObjMut.__MASTER[x.orgCollName][x.lookupField] = x.lookupVal || "null";
    });
}

export function getAllCriteriaMasterFields(policyJson, masterMetaData, iffData, customFields) {
    if (!policyJson) {
        return;
    }
    if (Array.isArray(policyJson)) {
        policyJson.forEach((x) => {
            getAllCriteriaMasterFields(x, masterMetaData, iffData, customFields);
        });
        return;
    }
    if (typeof policyJson == "object") {
        Object.keys(policyJson).forEach((x) => {
            if (typeof policyJson[x] == "object") {
                getAllCriteriaMasterFields(policyJson[x], masterMetaData, iffData, customFields);
            } else {
                checkForMasterStructure(x, policyJson, iffData, masterMetaData);
                if (x == "FType" && policyJson[x] == CONSTANTS.CUSTOM) {
                    getMasterFromCustomField(customFields, policyJson.displayname, masterMetaData, iffData);
                }
            }
        });
    }
}

function checkForMasterStructure(key: string, policyJson: any, iffData: any, masterMetaData: any) {
    if ((key == "FType" || key == "FIELD_TYPE") && policyJson[key] == CONSTANTS.MASTER_STRUCTURE) {
        const masterStructure = IFFHelper.masterStructure(CONSTANTS.MASTER_STRUCTURE, policyJson.fieldname || policyJson.FIELD_NAME, iffData);
        const masterConfig = masterStructure && createMasterMeta(masterStructure, policyJson);
        if(masterConfig) {
            masterMetaData.push(masterConfig);
        }
    }
}

function getMasterFromCustomField(customFields: CustomField[], customFieldName: string, masterMetaData: any, iffData) {
    const customField = customFields.find((x) => x.FIELD_NAME == customFieldName);
    customField.RULES.forEach((rule) => {
        rule.Condition.forEach((cond) => {
            if (cond.FType == CONSTANTS.CUSTOM) {
                return getMasterFromCustomField(customFields, cond.displayname, masterMetaData, iffData);
            }
            getAllCriteriaMasterFields(cond, masterMetaData, iffData, customFields);
        });
    });
}

export function getAllDependentCustomFields(customFields: CustomField[], customFieldName: string, allCustomFields: CustomField[]) {
    const customField = customFields.find((x) => x.FIELD_NAME == customFieldName);
    if (!customField) {
        return;
    }
    customField.RULES.forEach((rule) => {
        rule.Condition.forEach((cond) => {
            if (isCustomType(cond.FType)) {
                getAllDependentCustomFields(customFields, cond.displayname, allCustomFields);
            }
            if (cond.val2 && cond.val2.length > 0) {
                const splitVal2 = IFFHelper.splitIffField(cond.val2, "$");
                if (splitVal2.length > 0 && splitVal2[0] == CONSTANTS.CUSTOM_FIELDS) {
                    const fieldname = cond.val2;
                    const arr = fieldname.split("$");
                    const customFieldToFilledName = arr[arr.length - 1];
                    getAllDependentCustomFields(customFields, customFieldToFilledName, allCustomFields);
                }
            }

            cond.ref.forEach((ref) => {
                if (isCustomType(ref.FType)) {
                    getAllDependentCustomFields(customFields, ref.displayname, allCustomFields);
                }
                if (ref.val2 && ref.val2.length > 0) {
                    const splitVal2 = IFFHelper.splitIffField(ref.val2, "$");
                    if (splitVal2.length > 0 && splitVal2[0] == CONSTANTS.CUSTOM_FIELDS) {
                        const fieldname = ref.val2;
                        const arr = fieldname.split("$");
                        const customFieldToFilledName = arr[arr.length - 1];
                        getAllDependentCustomFields(customFields, customFieldToFilledName, allCustomFields);
                    }
                }
            });
        });

        if (rule.Outcome.BASE_FTYPE == CONSTANTS.CUSTOM) {
            const splitField = IFFHelper.splitIffField(rule.Outcome.BASE_FIELD, "$");
            if(splitField && splitField.length > 1) {
                getAllDependentCustomFields(customFields, splitField[1], allCustomFields);
            }
        }

        if (rule.Outcome.COMPR_FTYPE == CONSTANTS.CUSTOM) {
            const splitField = IFFHelper.splitIffField(rule.Outcome.COMPR_FIELD, "$");
            if(splitField && splitField.length > 1) {
                getAllDependentCustomFields(customFields, splitField[1], allCustomFields);
            }
        }

        if (rule.Outcome.EMI_FTYPE == CONSTANTS.CUSTOM) {
            const splitField = IFFHelper.splitIffField(rule.Outcome.EMI_FIELD, "$");
            if(splitField && splitField.length > 1) {
                getAllDependentCustomFields(customFields, splitField[1], allCustomFields);
            }
        }

        if (rule.Outcome.ROI_FTYPE == CONSTANTS.CUSTOM) {
            const splitField = IFFHelper.splitIffField(rule.Outcome.ROI_FIELD, "$");
            if(splitField && splitField.length > 1) {
                getAllDependentCustomFields(customFields, splitField[1], allCustomFields);
            }
        }

        if (rule.Outcome.TENURE_FTYPE == CONSTANTS.CUSTOM) {
            const splitField = IFFHelper.splitIffField(rule.Outcome.TENURE_FIELD, "$");
            if(splitField && splitField.length > 1) {
                getAllDependentCustomFields(customFields, splitField[1], allCustomFields);
            }
        }
    });
    const addedCF = allCustomFields.find((x) => x.FIELD_NAME == customField.FIELD_NAME);
    if (!addedCF) {
        allCustomFields.push(customField);
    }
}

function getAllMasterFields(policyJson, masterMetaData, iffData) {
    if (!policyJson) {
        return;
    }
    if (Array.isArray(policyJson)) {
        policyJson.forEach((x) => {
            getAllMasterFields(x, masterMetaData, iffData);
        });
        return;
    }
    if (typeof policyJson == CONSTANTS.types.OBJECT) {
        Object.keys(policyJson).forEach((x) => {
            if (typeof policyJson[x] == CONSTANTS.types.OBJECT) {
                getAllMasterFields(policyJson[x], masterMetaData, iffData);
            } else {
                checkForMasterStructure(x, policyJson, iffData, masterMetaData);
            }
        });
    }
}

function createMasterMeta(masterStructure: any, policyJson: any) {
    const masterConfig: Partial<any> = {
        primaryKeyName: masterStructure.PrimaryField,
        foreignKey: masterStructure.ForiegnField,
        lookupField: (policyJson.fieldname || policyJson.FIELD_NAME).split("$")[1],
        collectionName: `${masterStructure.Name}_${masterStructure.FileID}_${masterStructure.INSTITUTION_ID}_MASTER`,
        orgCollName: masterStructure.Name,
        operator: masterStructure.primaryForiegnOperator,
    };
    return masterConfig;
}
