import * as assert from "assert";
import * as fs from "fs";
import { Config } from "../config";
import { generateAndExecute } from "../src/generatePolicyProd";

const creditRules = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "samples/creditRuleBreSample.json", "utf-8"));
const customFields = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "samples/customFieldBreSample.json", "utf-8"));
const application = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "checkLoan.json", "utf-8"));

describe("Checking custom  fields generation ", function() {

    const output = generateAndExecute(customFields, null);

    it("should return output generated string", function() {
        assert.equal(output.length > 0, true);
    });
});

describe("Checking custom fields Execution ", function() {

    const output = generateAndExecute(customFields, application);

    it("should return output object", function() {
        assert.equal(output != undefined, true);
    });
});
