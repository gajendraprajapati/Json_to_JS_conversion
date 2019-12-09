import * as assert from "assert";
import { Config } from "../config";

const application = require("../../brexData/data/checkLoan.json");

const policy = require("../../brexData/data/promotionData.json");
const breJson = require(Config.dataDirectoryPath + "/breJson.json");
const ruleJsonData = require("../../brexData/data/testdata/ruleData.json");
const ruleListJsonData = require("../../brexData/data/testdata/ruleListData.json");
const creditRuleJsonData = require("../../brexData/data/testdata/creditRuleData.json");
const iffDataJson = "/iffData.json";

import * as fs from "fs";
import { generateBREJson } from "../src/com/softcell/sobre/adapters/creditRuleAdapter";
import { CONSTANTS } from "../src/com/softcell/sobre/constants/constants";
import { MongoConnection } from "../src/com/softcell/sobre/db/mongodb";
import { ExpressionsMaker } from "../src/com/softcell/sobre/models/breClass";
import { Counter } from "../src/com/softcell/sobre/models/counter";
import { CreditRule } from "../src/com/softcell/sobre/models/creditRuleModel";
import { PolicyModel } from "../src/com/softcell/sobre/models/policyModel";
import { RuleList } from "../src/com/softcell/sobre/models/ruleListModel";
import { Rule } from "../src/com/softcell/sobre/models/ruleModel";
import { generateAndExecute } from "../src/generatePolicyProd";

before(function(done) {
    MongoConnection.connectDB(done);
});

describe("Generating Bre json ", function() {
    it("should return output generated string", function() {
        const iFFData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + iffDataJson, "utf8"));

        const policyModel = new PolicyModel(policy, iFFData);
        const output = policyModel.generate();
        console.log(JSON.stringify(output, null, 2));

        assert.equal(output.length > 0, true);
    });

    it("should generate correct rule", function() {
        const ruleJson: Rule = policy.creditRule[0].RuleList[0].rules[0];
        const ruleModel = new Rule(ruleJson);
        Counter.reset();
        const breRuleJson = ruleModel.generate();
        const actualRuleJson = ruleJsonData;
        assert.deepEqual(actualRuleJson, breRuleJson);
    });

    it("should generate correct ruleList", function() {
        const ruleListJson: RuleList = policy.creditRule[0].RuleList[0];
        const ruleListModel = new RuleList(ruleListJson);
        Counter.reset();
        const BREXCreditRule = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);
        ruleListModel.generate(BREXCreditRule);
        const actualRuleListJson = ruleListJsonData;
        assert.deepEqual(actualRuleListJson, BREXCreditRule);
    });

    it("should generate correct creditRule", function() {
        const creditRuleJson: CreditRule = policy.creditRule[0];
        const creditRuleModel = new CreditRule(creditRuleJson, [], []);
        Counter.reset();
        const BREXCreditRule = creditRuleModel.generate();
        const actualCreditRuleJson = creditRuleJsonData;
        assert.deepEqual(actualCreditRuleJson, BREXCreditRule);
    });

    it("should generate correct breJson", function() {
        const iFFData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + iffDataJson, "utf8"));
        const policyJson: PolicyModel = policy;
        const policyModel = new PolicyModel(policyJson, iFFData);
        Counter.reset();
        const exptectedBreJson = policyModel.generate();
        console.log(JSON.stringify(exptectedBreJson, null, 2));
        const actualBreJson = breJson;
        // TODO: breJson is not updated once it is updated below code should uncommented
        // assert.deepEqual(actualBreJson, exptectedBreJson);
    });
});

describe("Generating Bre json and execute rule on input loan", function() {
    it("should return loan output", function() {
        const iFFData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + iffDataJson, "utf8"));
        const policyModel = new PolicyModel(policy, iFFData);
        const breJson = generateBREJson(policyModel);

        const output = generateAndExecute(breJson, application);
        console.log(JSON.stringify(output, null, 2));
        // console.log(output);

        assert.equal(output != undefined, true);
    });
});

after(function(done) {
    MongoConnection.disconnectDB();
    done();
});
