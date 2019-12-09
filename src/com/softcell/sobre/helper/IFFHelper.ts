import * as StringUtil from "../util/StringUtil";
import { CONSTANTS } from "../constants/constants";

export const iffStructure = (structureType, fieldName, iffData) => {
    const pattern = "/(?:\\[rnt])+/g, \"\""; // sometime iff data contains \n, \r, \t -  so we need to replace these for comparism
    try {
        if (!structureType || !fieldName || !iffData) {
            return undefined;
        }

        if (structureType == CONSTANTS.CUSTOM || structureType == CONSTANTS.MASTER_STRUCTURE) {
            return undefined;
        }
        const index =  fieldName.indexOf("$");
        const fileName = fieldName.substr(0, index);

        if (fileName == CONSTANTS.CUSTOM_FIELDS || fileName == CONSTANTS.CALCULATED_FIELDS || fileName == CONSTANTS.MATCHING_FIELDS) {
            return undefined;
        }

        const name = fieldName.substr(index + 1, fieldName.length);
        const data1 = iffData.filter((el) => StringUtil.toLowerCase(el.Type) == StringUtil.toLowerCase(structureType)
                                        && StringUtil.toLowerCase(el.Name) == StringUtil.toLowerCase(fileName) )[0];

        if (data1 && data1.FIELDS) {
            const retValue = data1.FIELDS.filter((e2) => StringUtil.toLowerCase(e2.FIELD_NAME) == StringUtil.toLowerCase(name)
                && StringUtil.toLowerCase(e2.ACTIVE) == StringUtil.toLowerCase("1"))[0];

            if (retValue) {
                const keyse = Object.keys(retValue);

                // remove the special characters from Keys and values
                for (const i in keyse) {
                    retValue[keyse[i]] = StringUtil.formatAndReplace(retValue[keyse[i]], pattern).trim();
                    const formattedKey =  StringUtil.formatAndReplace(keyse[i], pattern).trim();
                    if (keyse[i] != formattedKey) {
                        retValue[formattedKey] = retValue[keyse[i]];
                    }
                }
                return retValue;
            }
            console.log("iif data not found for ", structureType, " ,", fieldName, " ,", fileName, " ," , name, "," );
            return null;
        }
        console.log("iif data not found for ", structureType, fieldName  );
        return null;
    } catch (error) {
        console.log("error in iifstrcture " + error);
        return null;
    }
};

export const masterStructure = (structureType, fieldName, iffData) => {
    try {
        const index =  fieldName.indexOf("$");
        const fileName = fieldName.substr(0, index);
        const result = iffData.filter((el) => el.Type == structureType && el.Name == fileName)[0];
        if(result) {
            return result;
        } else {
            console.log("masterStructure: Master structure not found " + structureType + " " + fieldName);
            return null;
        }
    } catch (error) {
        console.log("Error: masterStructure: Master structure not found " + structureType + " " + fieldName);
        return null;
    }
};

export const splitIffField = (fieldName, splitUsing) => {
    const index =  fieldName.lastIndexOf(splitUsing);

    return [fieldName.substr(0, index), fieldName.substr(index + 1, fieldName.length)];
};
