import * as assert from "assert";
import * as fs from "fs";
import { Config } from "../config";
import { generateAndExecute } from "../src/generatePolicyProd";

const myConfig = Config;
// console.log(Config.dataDirectoryPath + 'samples/creditRuleBreSample.json');
const fileData1 = fs.readFileSync(Config.dataDirectoryPath + "/samples/customAndcreditRuleBreSample.json", "utf-8");
const creditRules = JSON.parse(fileData1);
const fileData2 = fs.readFileSync(Config.dataDirectoryPath + "/samples/customFieldBreSample.json", "utf-8");
const customFields = JSON.parse(fileData2);
const fileData3 = fs.readFileSync(Config.dataDirectoryPath + "/checkLoan.json", "utf-8");
const application = JSON.parse(fileData3);

describe("Checking credit rules generation ", function() {

    const output = generateAndExecute(creditRules, null);
    console.log("running test");

    it("should return output generated string", function() {
        assert.equal(output.length > 0, true);
    });
});

describe("Checking credit rules Execution ", function() {

    const output = generateAndExecute(creditRules, application);

    it("should return output object", function() {
        assert.equal(output != undefined, true);
    });
});
