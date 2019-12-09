import assert = require("assert");
import * as fs from "fs";
import { Config } from "../config";
import { PolicyModel } from "../src/com/softcell/sobre/models/policyModel";
import { strMatchNew, strMatchOld } from "../src/com/softcell/sobre/util/stringCompareVariations";
import { generate, execute, addWorkflowFields } from "../src/generatePolicyProd";
const iFFData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/iffData.json", "utf8"));
const beautify = require("js-beautify").js;
import { generateAndExecute } from "../src/generatePolicyProd";

const fileData1 = fs.readFileSync(Config.dataDirectoryPath + "/eligibilityPolicy.json", "utf-8");
const loanReq = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/eligibilityCheckLoan.json", "utf-8"));
const eligibilityPolicy = JSON.parse(fileData1);
import workflowFieldService from "../src/com/softcell/sobre/services/workflowFieldService";
import { computeLogicBasedOnFields } from "../src/com/softcell/sobre/util/OperationsUtil";

workflowFieldService.setLocalFilePath(Config.dataDirectoryPath + "/workflowFields/");



describe("generate BREJson for eligibility", ()=>{
    addWorkflowFields();
    const policy = new PolicyModel(eligibilityPolicy, iFFData);
    const BREJson = policy.generate();
    const breJS = generate(BREJson);
    fs.writeFileSync(Config.dataDirectoryPath + "/eligibilityGeneratedBREJson.json", beautify(JSON.stringify(BREJson)) );
    it("generate breJson",()=>{
        assert.equal(BREJson.length>0,true);
    });
    it("generate breJS", ()=>{
        fs.writeFileSync(Config.dataDirectoryPath + "/eligibilityJS.js", breJS);
       assert.equal(breJS.length>0 , true);

    });
    it("generate OutPut", ()=>{
        const OutPut = execute(breJS,loanReq);
        fs.writeFileSync(Config.dataDirectoryPath + "/eligibilityoutPut.json", beautify(JSON.stringify(OutPut)) );

        assert.equal(OutPut.length>0, true);
    });
    it("check field",()=>{
        const OutPut = computeLogicBasedOnFields("( CUSTOM_FIELDS$AUTO_LOAN + 2000 )", []);
        console.log(OutPut);

    });
});