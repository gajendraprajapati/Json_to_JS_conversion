import * as fs from "fs";
import * as _ from "lodash";
import * as path from "path";

export class WorkflowFieldModel {

    private configFilepath: string;
    private workfloFileName : string = `workFlowFields.json`;
    private fullWorkFLowPath: string;

    public setLocalFilePath(filePath: string) {
        this.configFilepath = filePath;
        this.fullWorkFLowPath = path.join(this.configFilepath, this.workfloFileName);
        console.log(`BrePolicy Service: Cache Path set to ${this.configFilepath}`);
    }
   
    public writeWorkflowFieldsToLocal(brePolicy: any) {
               
                if (!fs.existsSync(this.configFilepath)) {
                    fs.mkdirSync(this.configFilepath);
                    console.log(`WorkFLow Fields : Created Workflow Fields Cache Directory at ${this.configFilepath}`);
                }
                fs.writeFileSync(this.fullWorkFLowPath, JSON.stringify(brePolicy), 'utf-8');
                console.log(`WorkFLow Fields: File has been created for ${this.workfloFileName}`);
               
    }
    public loadWorkflowFieldsFunction() {
        const workflowField =  JSON.parse(fs.readFileSync(this.fullWorkFLowPath, 'utf-8'));
        workflowField.forEach((curField) => {
            let objKey = Object.keys(curField)[1];
            const keyArry = objKey.split("_");
            if (keyArry.length == 1) {
                let fieldname = keyArry[0];
                console.log("workflow Field function created with key " , objKey);
                global[fieldname] = new Function(curField[objKey].parameter, curField[objKey].body);
            } else {
                let workflowFieldName = keyArry.slice(1, keyArry.length).join("_");
                global[workflowFieldName] = new Function(curField[objKey].parameter, curField[objKey].body);
                console.log("workflow Field function created with key " , objKey);
            }
        });
    }
    public readWorkFLowField(){
        return JSON.parse(fs.readFileSync(this.fullWorkFLowPath, 'utf-8'));
    }
}


