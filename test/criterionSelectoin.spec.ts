import * as assert from "assert";
import * as fs from "fs";
import { Config } from "../config";
import { CONSTANTS } from "../src/com/softcell/sobre/constants/constants";
import { ExpressionMaker, ExpressionsMaker, IFConditionExpressionMaker, OperandMaker, OutputAliasMaker } from "../src/com/softcell/sobre/models/breClass";
import { PolicyModel } from "../src/com/softcell/sobre/models/policyModel";
import { RuleList } from "../src/com/softcell/sobre/models/ruleListModel";
import { Rule } from "../src/com/softcell/sobre/models/ruleModel";
import SoBREPolicyModel from "../src/com/softcell/sobre/models/soberPolicyModel";
import { execute, generate, generateAndExecute } from "../src/generatePolicyProd";
import { getAllCriteriaMasterFields } from "../src/generatePolicyProd";
const policy = require("../../brexData/data/policy5.json");
import { WorkFLowConfigModel } from "../src/com/softcell/sobre/models/workFlowConfigModel";
import policyCacheService from "../src/com/softcell/sobre/services/policyCacheService";

const myConfig = Config;
const CONSUMER_DURABLES = "Consumer Durables";
const IRPoReqoApplicationsLoanType = "IRP$oReq$oApplication$sLoanType";
// console.log(Config.dataDirectoryPath + 'samples/creditRuleBreSample.json');
const policies: any[] =
    [
        {
            creditPolicy:
            {
                INSTITUTION_ID: 4019,
                priority: 5,
                PolicyID: 5,
                status: "Active",
                createdDate: "2018-10-08T21:33:33.898+05:30",
                AppList: [
                    {
                        name: "GoNoGo",
                        value: "01",
                    },
                ],
                ProdList: [
                    {
                        name: CONSUMER_DURABLES,
                        value: CONSUMER_DURABLES,
                    },
                ],
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
            },
        }];

const loanObjTrue = {
    HEADER: { "INSTITUTION-ID": 4019 , "APP-TYPE": "01"},
    REQUEST: {

        oReq: {
            oApplication: { dLoanAmt: 60000, sLoanType: CONSUMER_DURABLES },
            oApplicant: {
                aAddr: { sCity: "pune" },
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
    HEADER: {
        "INSTITUTION-ID": 4019,
        "APP-TYPE": "01",
    },
    REQUEST: {

        oReq: {
            oApplication: { dLoanAmt: 60000,
        sLoanType: CONSUMER_DURABLES },
            oApplicant: {
                aAddr: { sCity: "pune" },
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

const workflowConfig: WorkFLowConfigModel = {
    intitutionId: 4019,
    flowConfiguration: [
        {
            productType: CONSUMER_DURABLES,
            productKey: IRPoReqoApplicationsLoanType,
            applicationProcess: true,
            matrixProcess: true,
            productProcess: true,
            decisionProcess: true,
            scoreProcess: true,
            criteriaProcess: true,
            eligibiltyAllowed: true,
            calculateCustomField: true,
            contionalScore: true,
        },
        {
            productType: "TWO_WHEELER_LOAN",
            productKey: IRPoReqoApplicationsLoanType,
            applicationProcess: true,
            matrixProcess: true,
            productProcess: true,
            decisionProcess: true,
            scoreProcess: true,
            criteriaProcess: true,
            eligibiltyAllowed: true,
            calculateCustomField: true,
            contionalScore: true,
        },
        {
            productType: "TW",
            productKey: IRPoReqoApplicationsLoanType,
            applicationProcess: true,
            matrixProcess: true,
            productProcess: true,
            decisionProcess: true,
            scoreProcess: true,
            criteriaProcess: true,
            eligibiltyAllowed: true,
            calculateCustomField: true,
            contionalScore: true,
        },
    ],
} as WorkFLowConfigModel;
describe("Checking policy criterions rules generation ", function() {
    const iFFData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/iffData.json", "utf8"));

    policies.forEach((policyModel) => {
        policyModel.creditPolicy.breJsCriterion = generate((new PolicyModel(policyModel, iFFData)).generateCriterion());

        it("should return output generated string", function() {
            assert.equal(policyModel.creditPolicy.breJsCriterion.length > 0, true);
        });
    });

    const selectedPolicyId = policyCacheService.getPolicyIdUsingPoliciesAndFlow(loanObjTrue, policies.map((x) => x.creditPolicy), workflowConfig);

    it("should return select right policy id generated string", function() {
        assert.equal(selectedPolicyId, 5);
    });
});
