import * as assert from "assert";
import * as fs from "fs";
import { Config } from "../config";
import { PolicyModel } from "../src/com/softcell/sobre/models/policyModel";
import { generateAndExecute } from "../src/generatePolicyProd";
const beautify = require("js-beautify").js;

let policy;
const myConfig = Config;
// console.log(Config.dataDirectoryPath + 'samples/creditRuleBreSample.json');
const fileData1 = fs.readFileSync(Config.dataDirectoryPath + "/customFieldSorting.json", "utf-8");
policy = JSON.parse(fileData1);

describe("Checking sorted fields ", function() {
    const iFFData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/iffData.json", "utf8"));
    const policyModel = new PolicyModel(policy, []);
    it("should return output generated string", function() {
        fs.writeFileSync(Config.dataDirectoryPath + "/sortedPolicyCustom.json", beautify(JSON.stringify(policyModel)) );

        assert.equal(policyModel != undefined , true);
    });
});
