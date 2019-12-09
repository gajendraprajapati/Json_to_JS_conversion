import * as assert from "assert";
import * as fs from "fs";
import { Config } from "../config";
import { CONSTANTS } from "../src/com/softcell/sobre/constants/constants";
import { ExpressionMaker, ExpressionsMaker, IFConditionExpressionMaker, OperandMaker, OutputAliasMaker } from "../src/com/softcell/sobre/models/breClass";
import { PolicyModel } from "../src/com/softcell/sobre/models/policyModel";
import { RuleList } from "../src/com/softcell/sobre/models/ruleListModel";
import { Rule } from "../src/com/softcell/sobre/models/ruleModel";
import { execute, generate, generateAndExecute } from "../src/generatePolicyProd";
import { getAllCriteriaMasterFields } from "../src/generatePolicyProd";
const policy = require("../../brexData/data/policy5.json");

const myConfig = Config;
const iffDataJson = "/iffData.json";
// console.log(Config.dataDirectoryPath + 'samples/creditRuleBreSample.json');
const fileData1: { CritList: Rule[] } = {
    CritList: [
        {
            val1: "",
            exp1: "",
            fieldname: "IRP$oReq$oApplication$dLoanAmt",
            displayname: "APPLICATION_LOAN_AMOUNT",
            ExpType: "Value",
            FType: "IFF STRUCTURE",
            DType: "N",
            AFSpec: "",
            exp2: ">=",
            val2: "50000",
            operator: "&&",
            outOperator: "",
            ref: [
                {
                    val1: "",
                    exp1: "",
                    fieldname: "IRP$oReq$oApplicant$aAddr$sCity",
                    displayname: "APPLICANT_ADDR_CITY",
                    ExpType: "Value",
                    FType: "IFF STRUCTURE",
                    DType: "S",
                    AFSpec: "",
                    exp2: "is",
                    val2: "Pune",
                    operator: "",
                },
            ],
        },
    ],
} as { CritList: Rule[] };
const creditRules = fileData1;

const loanObjTrue = {
    REQUEST: {
        oReq: {
            oApplication: {dLoanAmt: 60000},
            oApplicant: {
                aAddr: {sCity: "pune"},
                aEmpl: [
                    {
                        sWorkExps: 30,
                    },
                    {
                        sWorkExps: 10,
                    },
                ],
            },
        },
    },
};

const loanObjFalse = {
    REQUEST: {
        oReq: {
            oApplication: {dLoanAmt: 60000},
            oApplicant: {
                aAddr: {sCity: "pune"},
                aEmpl: [
                    {
                        sWorkExps: 10,
                    },
                    {
                        sWorkExps: 19,
                    },
                ],
            },
        },
    },
};

describe("Checking policy criterions rules generation ", function() {
    const iFFData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + iffDataJson, "utf8"));
    policy.CritList = fileData1;
    const policyModel = new PolicyModel(policy, iFFData);
    const breJs = generate(policyModel.generateCriterion());

    it("should return output generated string", function() {
        assert.equal(breJs.length > 0, true);
    });

    const truLoanResObj = execute(breJs, loanObjTrue);
    const falseLoanResObj = execute(breJs, loanObjFalse);
    it("should return true for loanObjTrue", function() {
        assert.equal(truLoanResObj.ruleResult, "true");
    });

    it("should return false for loanObjFalse", function() {
        assert.notEqual(falseLoanResObj.ruleResult, "false");
    });

    it("should fetch 1 master data for criteria", function() {
        const masterData = [];
        const policyData: PolicyModel = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/criteria_policy1.json", "utf8"));
        const iffData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + iffDataJson, "utf8"));
        getAllCriteriaMasterFields(policyData.creditPolicy.CritList, masterData, iffData, policyData.customFields);
        console.log(masterData);
        assert.equal(masterData.length, 1);
    });

    it("should fetch 2 master data for criteria", function() {
        const masterData = [];
        const policyData: PolicyModel = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/criteria_policy2.json", "utf8"));
        const iffData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + iffDataJson, "utf8"));
        getAllCriteriaMasterFields(policyData.creditPolicy.CritList, masterData, iffData, policyData.customFields);
        console.log(masterData);
        assert.equal(masterData.length, 2);
    });

});
