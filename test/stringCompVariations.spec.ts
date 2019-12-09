import assert = require("assert");
import * as fs from "fs";
import { Config } from "../config";
import { strMatchNew, strMatchOld } from "../src/com/softcell/sobre/util/stringCompareVariations";

const fileData1 = fs.readFileSync(Config.dataDirectoryPath + "/stringCompTest.json", "utf-8");
const strToMatch = JSON.parse(fileData1);

describe("comparing results of both methods", function() {

    strToMatch.forEach((testCase) => {
        const oldMethodRes = strMatchOld(testCase.leftStr, testCase.rightStr);
        const newMethodRes = strMatchNew(testCase.leftStr, testCase.rightStr);

        it("should compare both result", function() {
            assert.equal(oldMethodRes, newMethodRes);
        });

    });

});
