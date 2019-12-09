export abstract class PolicyValidator {

    public static validateHeader(loanObj) {
        const headerMissingError = "DETAILS MISSING IN HEADER";
        if (!loanObj) {
            console.log("not a valid req object");
            return this.errorScoringResponse("COMPLETED", "L1", "PLEASE PROVIDE LOAN REQUEST", null);
        }
        if (!loanObj.HEADER) {
            console.log("not a valid req object HEADER");
            return this.errorScoringResponse("COMPLETED", "L1", "PLEASE PROVIDE HEADER", null);
        }

        const institutionId = Number(loanObj.HEADER["INSTITUTION-ID"]);
        if (!institutionId) {
            console.log("no institution id found");
            return this.errorScoringResponse("COMPLETED", "L1", headerMissingError, null);
        }

        const applicationId = loanObj.HEADER["APPLICATION-ID"];
        if (!applicationId) {
            console.log("no application id found");
            return this.errorScoringResponse("COMPLETED", "L1", headerMissingError, null);
        }

        const customerId = loanObj.HEADER["CUSTOMER-ID"];
        if (!customerId) {
            console.log("no customer id found");
            return this.errorScoringResponse("COMPLETED", "L1", headerMissingError, null);
        }

        const requestType = loanObj.HEADER["REQUEST-TYPE"];
        if (!requestType) {
            console.log("no request type found");
            return this.errorScoringResponse("COMPLETED", "L1", headerMissingError, null);
        }

        const appType = loanObj.HEADER["APP-TYPE"];
        if (!appType) {
            console.log("no app type found");
            return this.errorScoringResponse("COMPLETED", "L1", headerMissingError, null);
        }

        return null;
    }

    public static errorScoringResponse(status, code, errMsg, ackId) {
        const result = new Date();
        const day = ("0" + (  result.getDate() )).slice(-2);
        const month = ("0" + (  result.getMonth() + 1 )).slice(-2);
        const year = result.getFullYear();
        const hour =  ("0" + (  result.getHours() )).slice(-2);
        const minute = ("0" + (  result.getMinutes() )).slice(-2);
        const seconds = ("0" + (  result.getSeconds() )).slice(-2);

        const loanResObj: any = {};
        const scoreData = "SCORE-DATA";
        loanResObj.HEADER = {};
        loanResObj.HEADER["RESPONSE-DATETIME"] = `${day}${month}${year} ${hour}:${minute}:${seconds}`;
        loanResObj.ackId = ackId;
        loanResObj.STATUS = status;
        loanResObj[scoreData] = {};
        loanResObj[scoreData].STATUS = "ERROR";
        loanResObj[scoreData].ERRORS = {};
        loanResObj[scoreData].ERRORS.CODE = code;
        loanResObj[scoreData].ERRORS.DESCRIPTION = errMsg;
        return loanResObj;
    }
}
