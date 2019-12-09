import * as assert from "assert";

const application = require("../../brexData/data/checkLoan.json");
const policy = require("../../brexData/data/singleCustomField.json");
import workflowFieldService from "../src/com/softcell/sobre/services/workflowFieldService";

import * as fs from "fs";
import { Config } from "../config";
import { generateBREJson } from "../src/com/softcell/sobre/adapters/customFieldAdapter";
import { PolicyModel } from "../src/com/softcell/sobre/models/policyModel";
import { addWorkflowFields, execute, generate, generateAndExecute, generateWithFunctionNames, getFuncFromString } from "../src/generatePolicyProd";
import * as loanRequestSanitizer from "../src/com/softcell/sobre/util/loanRequestSanitizer";

const iffDataJson = "/iffData.json";
workflowFieldService.setLocalFilePath(Config.dataDirectoryPath + "/workflowFields/");
addWorkflowFields();

before(function(done) {
    done();
});

after(function(done) {
    done();
});

describe("Generating Bre json ", function() {
    it("should return output generated string", function() {
        const iFFData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + iffDataJson, "utf8"));

        const policyModel = new PolicyModel(policy, iFFData);
        const output = policyModel.generate();
        fs.writeFile("temp.js", JSON.stringify(output, null, 2), (err) => {
            if (err) { console.log(err); }
            console.log("Successfully Written to File.");
        });
        console.log(JSON.stringify(output, null, 2));
    });
});

describe("Generating Bre json and execute rule on input loan", function() {
    it("should return loan output", function() {
        const iFFData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + iffDataJson, "utf8"));
        // let breJson = require('../../brexData/data/samples/customFieldBreSample.json');

        const policyModel = new PolicyModel(policy, iFFData);
        const breJson = policyModel.generate();
        const output = generateAndExecute(breJson, null);

        fs.writeFile("temp.js", output, (err) => {
            if (err) { console.log(err); }
            console.log("Successfully Written to File.");
        });

        console.log("-------------");
        console.log((JSON.stringify(output)));
    });
});
describe("Compare BRE Json with DB ", function() {
    it("should compare result with SoBRE result", function() {
        const iFFData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + iffDataJson, "utf8"));

        const policyModel = new PolicyModel(policy, iFFData);
        const breJson = policyModel.generate();
        let breOutput;
        const breJSString = generate(breJson);
        const finalJsCreated = getFuncFromString(breJSString);
        const withCoeverage = generateWithFunctionNames(breJson);
        breOutput = execute(finalJsCreated, application, true, false);

        const SoBREOutput = require("../../brexData/data/SoBREOutput.json");

        delete SoBREOutput.HEADER;
        delete SoBREOutput["SCORING-REF-ID"];
        delete SoBREOutput.createDate;
        delete SoBREOutput.STATUS;
        delete breOutput.HEADER;
        delete breOutput.STATUS;

        breOutput = JSON.parse(JSON.stringify(breOutput));
        assert.deepEqual(breOutput, SoBREOutput);
    });
});

describe("Compare JSON outputs ", function() {
    it("compare", function() {
        const compare1 = require("../../brexData/data/compare1.json");
        const compare2 = require("../../brexData/data/compare2.json");
        loanRequestSanitizer.modifyObject(compare1);
        loanRequestSanitizer.modifyObject(compare2);

        assert.deepEqual(compare1, compare2);
    });
});

describe("Print mismatch count ", function() {
    it("Print mismatch count ", function() {
        const mismatch = require("../../brexData/data/executionMismatch.json");
        const countMismatch = {};

        for (let i = 0 ; i < mismatch.length; i++) {
            let elem = mismatch[i];
            let derivedFields = elem["Difference"] && elem["Difference"]["DERIVED_FIELDS"] || [];

            for (let j = 0 ; j < derivedFields.length; j++) {
                let fieldName = derivedFields[j] && derivedFields[j].Key;

                if(countMismatch[fieldName]) {
                    countMismatch[fieldName] = countMismatch[fieldName] + 1;
                } else {
                    countMismatch[fieldName] = 1;
                }

            }
        }

        console.log(JSON.stringify(countMismatch));
    });
});
