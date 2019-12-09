import * as assert from "assert";
import * as fs from "fs";
import { Config } from "../config";
import { PolicyModel } from "../src/com/softcell/sobre/models/policyModel";
import { addWorkflowFields, applyMasterFieldData, collectMasterMetaData, execute, execute_old, generate, generateAndExecute, generateWithFunctionNames, prepareReqForMasterData } from "../src/generatePolicyProd";
import workflowFieldService from "../src/com/softcell/sobre/services/workflowFieldService";
import * as loanRequestSanitizer from "../src/com/softcell/sobre/util/loanRequestSanitizer";
const beautify = require("js-beautify").js;
const lodash = require("lodash");

workflowFieldService.setLocalFilePath(Config.dataDirectoryPath + "/workflowFields/");

describe("Running automation tests generation ", function() {
    addWorkflowFields();

    const testCategories = fs.readdirSync(Config.unitTestDataDirectoryPath);
    testCategories && testCategories.length && testCategories.forEach((basedir) => {

        const testCaseCategories = fs.readdirSync(Config.unitTestDataDirectoryPath + "/" + basedir);
        testCaseCategories && testCaseCategories.length && testCaseCategories.forEach((testbasedir) => {
            const testCases = fs.readdirSync(Config.unitTestDataDirectoryPath + "/" + basedir + "/" + testbasedir);
            testCases && testCases.length && testCases.forEach((testcasdir) => {
                const pathFrom = Config.unitTestDataDirectoryPath + "/" + basedir + "/" + testbasedir + "/" + testcasdir;
                if (!fs.existsSync(pathFrom + "/policy.json")) {
                    return;
                }
                if (!fs.existsSync(pathFrom + "/test.json")) {
                    return;
                }
                console.log("running test for path " + pathFrom);

                const policy = JSON.parse(fs.readFileSync(pathFrom + "/policy.json", "utf-8"));
                const iFFData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/iffData.json", "utf8"));
                const policyModel = new PolicyModel(policy, iFFData);
                const breJson = policyModel.generate();
                fs.writeFileSync(pathFrom + "/breJson.json", beautify(JSON.stringify(breJson)));
                const brejs = generateWithFunctionNames(breJson);
                fs.writeFileSync(pathFrom + "/breJs.js", brejs.finalJsCreated);
                const testData: Array<{ "request": any, "response": any, "breOutput": any }> = JSON.parse(fs.readFileSync(pathFrom + "/test.json", "utf-8"));
                policy && testData && testData.length && testData.forEach((testd, i) => {
                    if (testbasedir.includes("_Master")) {
                        prepareMaster(testd, policy, iFFData);
                        fs.writeFileSync(pathFrom + "/master_req_" + (i + 1) + ".json", beautify(JSON.stringify(testd.request)));
                    }

                    const output = execute(brejs, testd.request, false, true);
                    testd.breOutput = output;

                    it(testbasedir + "--" + testcasdir, function() {
                        loanRequestSanitizer.modifyObject(testd.response);
                        loanRequestSanitizer.modifyObject(output);

                        const o1 = JSON.parse(JSON.stringify(output));
                        const o2 = JSON.parse(JSON.stringify(testd.response));
                        assert.deepEqual(o1, o2);
                    });
                });
                policy && testData && testData.length && fs.writeFileSync(pathFrom + "/output.json", beautify(JSON.stringify(testData)));
            });

        });

    });
});

function prepareMaster(testData: any, promData, iffData) {
    const testCaseData = collectMasterMetaData(promData, iffData);
    console.log(testCaseData);
    testCaseData.forEach((x) => {
        x.foreignKey = x.foreignKey.replace("IRP", "REQUEST");
    });
    const appliedMasterData = applyMasterFieldData(testCaseData, testData.request);
    console.log(appliedMasterData);
    const data = appliedMasterData.map((x) => {
        const masterData = testData.master_data[x.collectionName];
        return {
            ...x,
            lookupVal: masterData && masterData[x.primaryKeyVal] && masterData[x.primaryKeyVal][x.lookupField],
        };
    });

    console.log(data);
    prepareReqForMasterData(testData.request, data);
}