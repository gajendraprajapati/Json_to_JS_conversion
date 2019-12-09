import * as assert from "assert";
import * as fs from "fs";
import * as os from "os";
import { Config } from "../config";
import { PolicyModel } from "../src/com/softcell/sobre/models/policyModel";
const performance = require("perf_hooks").performance;
const policy = JSON.parse(fs.readFileSync(Config.dataDirectoryPath +"/promotionData.json", "utf-8"));
const complilePerformance = "complilePerformance.csv";
UnlinkExecutionFile(complilePerformance);
function UnlinkExecutionFile(fileName) {
    if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
    }
}
const iffDataJson = "/iffData.json";
const iFFData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + iffDataJson, "utf8"));



describe("first level performance check for breJson generation",()=>{
    const policy1 = new PolicyModel(policy,iFFData);
    fs.appendFileSync(complilePerformance, "Total - custom fields, Avg-custom fields, Total - CreditRule, Avg - CreditRule, Total-ScoringCard, Avg - ScoringCard");
    fs.appendFileSync(complilePerformance, os.EOL);
    

    const t1 = performance.now();
    policy1.generateCustomFields();
    const t2 = performance.now();

    const t3 = performance.now();
    policy1.generateCreditRule();
    const t4 = performance.now();

    const t5 = performance.now();
    policy1.generateScoringCard();
    const t6 = performance.now();

    fs.appendFileSync(complilePerformance, `${t2-t1},${(t2-t1)/policy1.customFields.length},${t4-t3},${(t4-t3)/policy1.creditRule.length},${t6-t5},${(t6-t5)/policy1.scoreCard.length},`);
    fs.appendFileSync(complilePerformance, os.EOL);
    assert.equal(true,true);






});