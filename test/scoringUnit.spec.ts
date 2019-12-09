import assert = require("assert");
import * as fs from "fs";
import { Config } from "../config";
import { PolicyModel } from "../src/com/softcell/sobre/models/policyModel";
import { strMatchNew, strMatchOld } from "../src/com/softcell/sobre/util/stringCompareVariations";
import { generate } from "../src/generatePolicyProd";
const iFFData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/iffData.json", "utf8"));
const beautify = require("js-beautify").js;
import { generateAndExecute } from "../src/generatePolicyProd";

const fileData1 = fs.readFileSync(Config.dataDirectoryPath + "/analyticalField.json", "utf-8");
const scoreSampleJson = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/samples/scoreCardBreSample_decided.json", "utf-8"));
const scoringPolicy = JSON.parse(fileData1);

describe("js should be generated", function() {
    const policy = new PolicyModel(scoringPolicy, iFFData);
    const breJSON = policy.generate();

    // it("should generate Javascript code", function() {
    //     const application = require("../../brexData/data/checkLoan.json");
    //     const iFFData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/iffData.json", "utf8"));
    //     const breJson = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/samples/scoreCardBreSample_decided.json", "utf-8"));

    //     const policyModel = new PolicyModel(policy, iFFData);
    //     const output = generateAndExecute(breJson, application);

    //     fs.writeFile("temp.js", output, (err) => {
    //         if (err) { console.log(err); }
    //         console.log("Successfully Written to File.");
    //     });

    //     console.log("-------------");
    //     console.log(output);
    // });

    fs.writeFileSync(Config.dataDirectoryPath + "/analyticalBreJSON.json", beautify(JSON.stringify(breJSON)) );
    const breJs = generate(breJSON);
    fs.writeFileSync(Config.dataDirectoryPath + "/analyticalBreJS.js", breJs);

    // it("should generate brejson", function() {
    //     assert.equal(breJSON.length > 0, true);
    // });
    // it("should generate breJS", function() {
    //     assert.equal(breJs.length > 0, true);

    // });

    // it("sample bre json", function() {
    //     const sampleJs = generate(scoreSampleJson);
    //     fs.writeFileSync(Config.dataDirectoryPath + "/sampleScoreJS.js", sampleJs);
    //     assert.equal(sampleJs.length > 0, true);

    // });

    // it("generate brejs from modifield json", function() {
    //     const modJs = generate(scoreSampleJson);
    //     fs.writeFileSync(Config.dataDirectoryPath + "/modBREScoreJS.js", modJs);
    //     assert.equal(modJs.length > 0, true);
    // });

});
