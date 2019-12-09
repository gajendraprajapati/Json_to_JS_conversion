import * as StringUtil from "../util/StringUtil";

export const encrypt = (value) => {
    let result="";
    for(let i=0; i< value.length; i++) {
        if(StringUtil.isSpecialChar(value.charAt(i)))  {
            result+="_";
            result+=value.charCodeAt(i);
            result+="_";
        } else {
            result+=value.charAt(i)
        }
    }
    return result;
};

export const Decrypt = (value) => {
    let result="";
    const array = value.split("_");

    for(let i=0;i<array.length;i++) {
        if(!isNaN(array[i]) && array[i].length>0) {
            result+= String.fromCharCode(array[i]);
        } else {
            result+=array[i];
        }
    }
    return result;
};
