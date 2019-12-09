import * as assert from "assert";
import * as fs from "fs";
import { Config } from "../config";

const loanReqObj = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "testdata/checkLoan.json", "utf-8"));
const masterData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "testdata/masterFieldMockData.json", "utf-8"));
const promData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "testdata/promotionData.json", "utf-8"));
import { PolicyModel } from "../src/com/softcell/sobre/models/policyModel";
import { applyMasterFieldData, collectMasterMetaData, generateAndExecute, prepareReqForMasterData } from "../src/generatePolicyProd";

describe("Master Field", function() {

    it("Master the correspoding master field value approved", function() {
        const iffData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/iffData.json", "utf8"));
        const testCaseData = collectMasterMetaData(promData, iffData);
        console.log(testCaseData);
        testCaseData.forEach((x) => {
            x.foreignKey = x.foreignKey.replace("IRP", "REQUEST");
        });
        loanReqObj.REQUEST.oHeader.sDsaId = "PA88806";
        const appliedMasterData = applyMasterFieldData(testCaseData, loanReqObj);
        console.log(appliedMasterData);
        const data = getData({
            ipcEventName: "",
            inputData: appliedMasterData,
        });

        console.log(data);
        prepareReqForMasterData(loanReqObj, data);
        const policyModel = new PolicyModel(promData as any, iffData);
        const breJson = policyModel.generateCreditRule();

        const output = generateAndExecute(breJson, loanReqObj);
        console.log(JSON.stringify(output, null, 2));

        assert.equal(output != undefined, true);

    });
    it("Master the correspoding master field value not approved.", function() {
        const iffData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/iffData.json", "utf8"));
        const testCaseData = collectMasterMetaData(promData, iffData);
        console.log(testCaseData);
        testCaseData.forEach((x) => {
            x.foreignKey = x.foreignKey.replace("IRP", "REQUEST");
        });
        loanReqObj.REQUEST.oHeader.sDsaId = "SM13078";
        const appliedMasterData = applyMasterFieldData(testCaseData, loanReqObj);
        console.log(appliedMasterData);
        const data = getData({
            ipcEventName: "",
            inputData: appliedMasterData,
        });

        console.log(data);
        prepareReqForMasterData(loanReqObj, data);
        const policyModel = new PolicyModel(promData as any, iffData);
        const breJson = policyModel.generateCreditRule();

        const output = generateAndExecute(breJson, loanReqObj);
        console.log(JSON.stringify(output, null, 2));

        assert.equal(output != undefined, true);

    });
});

function getData(data) {
    return data.inputData.map((x) => {
        return {
            ...x,
            lookupVal: masterData[x.collectionName][x.primaryKeyVal][x.lookupField],
        };
    });
}
