import * as assert from "assert";
import * as fs from "fs";
import { Config } from "../config";
import { generateAndExecute } from "../src/generatePolicyProd";

const scoringRules = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/samples/scoreCardBreSample_decided.json", "utf-8"));
const application = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/checkLoan.json", "utf-8"));

describe("Checking scoring rules generation ", function() {
    console.log("running test");
    it("should return output generated string", function() {
        const output = generateAndExecute(scoringRules, null);
        console.log(output);
        assert.equal(output.length > 0, true);
    });
    it("should return output object", function() {
        const output = generateAndExecute(scoringRules, application);
        console.log(JSON.stringify(output, null, 2));
        assert.equal(output != undefined, true);
    });
});
