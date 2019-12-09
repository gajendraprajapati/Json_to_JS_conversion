import * as assert from "assert";

const application = require("../../brexData/data/checkLoan.json");
const policy = require("../../brexData/data/policy5.json");

import * as fs from "fs";
import { Config } from "../config";
import { generateBREJson } from "../src/com/softcell/sobre/adapters/customFieldAdapter";
import { PolicyModel } from "../src/com/softcell/sobre/models/policyModel";
import { generateAndExecute } from "../src/generatePolicyProd";

describe("Generating Bre json ", function() {
    it("should return output generated string", function() {
        const iFFData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/iffData.json", "utf8"));

        const policyModel = new PolicyModel(policy, iFFData);
        const output = policyModel.generateCriterion();
        console.log(JSON.stringify(output, null, 2));
    });
});

describe("Generating Bre json and execute rule on input loan", function() {
    it("should return loan output", function() {
        const iFFData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/iffData.json", "utf8"));
        // let breJson = require('../../brexData/data/breJson.json');

        const policyModel = new PolicyModel(policy, iFFData);
        const breJson = policyModel.generateCriterion();
        const output = generateAndExecute(breJson, null);

        fs.writeFile("temp.js", output, (err) => {
            if (err) { console.log(err); }
            console.log("Successfully Written to File.");
        });

        console.log("-------------");
        console.log(output);
    });
});
