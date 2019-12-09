/**
 * This file contains the String utility methods
 */

/**
 * This method will replace all the occurences of `replace` with the specified `replaceWith` string
 * @param str
 * @param replace
 * @param replaceWith
 * @returns {string}
 */
export const replaceStr = (str, replace, replaceWith) => {
    return str.split(replace).join(replaceWith);
};

export const isSpecialChar = (s) => {
    const regex = /^[A-Za-z0-9]+$/ ;
    return !regex.test(s);
};

/**
 * this method take the str and pattern and replace the mathcing pattern with single space
 * @param str
 * @param pattern
 */
export const formatAndReplace = (str, pattern) => {
    return (str && str.trim() &&  str.trim().length > 0) ? str.replace(pattern).trim() : "";
};

/**
 * checks is string is not blank and not null
 * @param str
 * @returns {any | boolean}
 */
export const notBlank = (str) => {
    return str && str.trim().length > 0;
};

export const toLowerCase = (str) => {
    if (str) {
        return str.toLowerCase().trim();
    } else {
        return "";
    }
};

export const toUpperCase = (str) => {
    if (str) {
        return str.toUpperCase().trim();
    } else {
        return "";
    }
};

export const getDateTypeFromIffOrDefault = (iffStructure, defaultDateType) => {
    if (iffStructure && iffStructure.DATE_TYPE) {
        return iffStructure.DATE_TYPE.toUpperCase();
    } else {
        return defaultDateType;
    }
};

/**
 * Return all occurances of a character in specified string
 * @param substring
 * @param string
 * @returns {Array}
 */
export const locations = (substring, string) => {
    let a = [], i = -1;
    while((i=string.indexOf(substring, i+1)) >= 0) a.push(i);
    return a;
};

/**
 * check for Balanced expression
 * @param expr
 * @returns {boolean}
 */
export const isValidExpression = (expr) => {
    let holder = [];
    let openBrackets:any = ['(','{','['];
    let closedBrackets:any = [')','}',']'];
    for(let letter of expr) {
        if(openBrackets.includes(letter)){
            holder.push(letter)
        } else if(closedBrackets.includes(letter)) {
            let openPair = openBrackets[closedBrackets.indexOf(letter)]; // find open and closing pair
            if(holder[holder.length - 1] === openPair) {
                holder.splice(-1,1)
            } else {
                holder.push(letter);
                break
            }
        }
    }
    return (holder.length === 0) // return true if length is 0, otherwise false
};
