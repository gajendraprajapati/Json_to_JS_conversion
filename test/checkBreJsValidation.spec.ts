import * as assert from "assert";
import { Config } from "../config";

const policy = require("../../brexData/data/promotionData.json");
import * as fs from "fs";
import { PolicyModel } from "../src/com/softcell/sobre/models/policyModel";
import { generate, getFuncFromString } from "../src/generatePolicyProd";

describe("Check breJs validation", function() {
    it("should validate brejs syntax error", function() {
        const iFFData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/iffData.json", "utf8"));

        const policyModel = new PolicyModel(policy, iFFData);
        const breJson = policyModel.generate();

        const breJs = generate(breJson);
        try {
            const func = getFuncFromString(breJs);
            assert.ok("BreJs Validated");
        } catch (error) {
            console.log(breJs);
            assert.fail("Validation failed syntax error");
        }
    });

    it("should detect brejs syntax error", function() {
        const iFFData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/iffData.json", "utf8"));

        const policyModel = new PolicyModel(policy, iFFData);
        const breJson = policyModel.generate();

        const breJs = generate(breJson);
        const syntaxErrorBrejs = breJs.replace("{", "}"); // inserting syntax error
        try {
            const func = getFuncFromString(syntaxErrorBrejs);
            assert.fail("Syntax error BreJs Validated");
        } catch (error) {
            console.log(syntaxErrorBrejs);
            assert.ok("Syntax Error detected");
        }
    });
});
