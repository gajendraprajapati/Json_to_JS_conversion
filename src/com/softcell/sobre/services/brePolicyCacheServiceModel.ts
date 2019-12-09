import * as fs from "fs";
import * as _ from "lodash";

export class BrePolicyCacheServiceModel {

    private configFilepath: string;

    public setLocalFilePath(filePath: string) {
        this.configFilepath = filePath;
        console.log(`BrePolicy Service: Cache Path set to ${this.configFilepath}`);
    }

    public getLocalFilePath() {
        return this.configFilepath;
    }

   
    public writepolicyToLocal(brePolicy: any) {
            console.log(brePolicy.InstitutionID + '   ' + brePolicy.PolicyID);
            if ((brePolicy.InstitutionID && brePolicy.PolicyID)) {
                const key = `${brePolicy.InstitutionID.toString()}_${brePolicy.PolicyID.toString()}.json`;

                if (!fs.existsSync(this.configFilepath)) {
                    fs.mkdirSync(this.configFilepath);
                    console.log(`BrePolicy Service : Created BreCreditPolicy Cache Directory at ${this.configFilepath}`);
                }
                fs.writeFileSync(this.configFilepath + key, JSON.stringify(brePolicy), 'utf-8');
                console.log(`BrePolicy Service: File has been created for ${key}`);
               
            }
    }
}
export default BrePolicyCacheServiceModel;


