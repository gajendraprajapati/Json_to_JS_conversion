import * as assert from "assert";
import * as fs from "fs";

import { execute } from "../src/generatePolicyProd";
import { Config } from "../config";
const workflowFields = fs.readFileSync("C:/SoftCell/BRE/brex/brexUnit/src/workFlowFields.ts");
const loanReqObj = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/workFlow_fields_loanObj.json" , "utf8"));


describe("workflow fields should be generated", function(){

    const output = execute(workflowFields,loanReqObj,false,false);
    console.log(output.WORKFLOW_FIELDS);

    it("should calculate salariedGrossIncome: ",()=>{
        assert.equal(output.WORKFLOW_FIELDS.salariedGrossIncome,50000);
    });
    it("should calculate incentive: " ,() =>{
        assert.equal(output.WORKFLOW_FIELDS.incentive, 200);
    });
    it("should calculate deductions: ",()=>{
        assert.equal(output.WORKFLOW_FIELDS.deduction, 125);
    });
    it("should calculate existing EMI", ()=>{
        assert.equal(output.WORKFLOW_FIELDS.existingEmi, 100);
    });
    it("should calculate household expenses",()=>{
        assert.equal(output.WORKFLOW_FIELDS.houseHoldExpense, 50);
    });
    it("should calculate other income",()=>{
        assert.equal(output.WORKFLOW_FIELDS.otherIncome,200);
    });
    it("should calculate net estimated income",()=>{
        assert.equal(output.WORKFLOW_FIELDS.NET_ESTIMATED_INCOME,49825);
    });
    it("should calculate final estimated income ",()=>{
        assert.equal(output.WORKFLOW_FIELDS.finalEstimatedIncome,49725);
    });
    it("should calculate product ", ()=>{
        assert.equal(output.WORKFLOW_FIELDS.product, "RESIDENTIAL");
    });
    it("should calculate market value", ()=>{
        assert.equal(output.WORKFLOW_FIELDS.marketValue,5000000);
    });
    it("should calculate applicantAge", ()=>{
        assert.equal(output.WORKFLOW_FIELDS.applicantAge, 31);
    });
    it("should calculate applicant loan tenure", ()=>{
        assert.equal(output.WORKFLOW_FIELDS.applicantLoanTenure, 12);
    });
    it("should calculate total consider income ", ()=>{
        assert.equal(output.WORKFLOW_FIELDS.totalConsiderIncome, 50000);
    });
    it("should calculate net consider income ",()=>{
        assert.equal(output.WORKFLOW_FIELDS.netConsiderIncome,49875);
    });
    it("should calculate affordable EMI by customer", ()=>{
        assert.equal(output.WORKFLOW_FIELDS.affordableEmiByCustomer, 15);
    });
    it("should calculate agreement value",()=>{
        assert.equal(output.WORKFLOW_FIELDS.agreementValue,5000000);
    });
    it("should calculate value for mobile match cibil",()=>{
        assert.equal(output.WORKFLOW_FIELDS.MOBILE_MATCH_CIBIL, true);
    });
    it("should calculate max mob",()=>{
        assert.equal(output.WORKFLOW_FIELDS.MAX_MOB, 16);
    });
    it("should calculate max mob age",()=>{
        assert.equal(output.WORKFLOW_FIELDS.MAX_ACCT_AGE, 16);
    });
    it("should calculate aadhar match cibil", ()=>{
        assert.equal(output.WORKFLOW_FIELDS.AADHAAR_MATCH_CIBIL, true);
    });
    it("should calculate aadhar match cibil enrich",()=>{
        assert.equal(output.WORKFLOW_FIELDS.AADHAAR_MATCH_CIBIL_ENRICH, true);
    });
    it("should calculate pan match cibil ", ()=>{
        assert.equal(output.WORKFLOW_FIELDS.PAN_MATCH_CIBIL, true);
    });
    it("should calculate pan match cibil enrich",()=>{
        assert.equal(output.WORKFLOW_FIELDS.PAN_MATCH_CIBIL_ENRICH, true);
    });

});