
import { CONSTANTS } from "../constants/constants";
import * as StringUtil from "../util/StringUtil";

export function isCustomType(fType: string) {
    return StringUtil.toUpperCase(fType) == CONSTANTS.CUSTOM;
}
