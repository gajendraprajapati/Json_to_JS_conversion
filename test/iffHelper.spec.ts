import * as fs from "fs";
import { Config } from "../config";
import * as IFFHelper from "../src/com/softcell/sobre/helper/IFFHelper";

describe("Iff Helper Spec ", function() {
    it("should return corresponding iff data", function() {
        const iFFData = JSON.parse(fs.readFileSync(Config.dataDirectoryPath + "/iffData.json", "utf8"));

        console.log( IFFHelper.iffStructure("IFF STRUCTURE", "BUREAU_RESPONSE$subjectReturnCode", iFFData) );
    });
});
