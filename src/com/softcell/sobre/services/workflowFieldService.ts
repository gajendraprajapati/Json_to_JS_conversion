import * as fs from "fs";
import {WorkflowFieldModel} from "./workflowFieldModel";
export class WorkflowFieldService {
    private _localFilePath: string;
    private workflowFieldsCacheModel: WorkflowFieldModel;
    constructor() {
        this.workflowFieldsCacheModel = new WorkflowFieldModel();
    }
    public setLocalFilePath(filePath: string) {
        this.workflowFieldsCacheModel.setLocalFilePath(filePath);
    }

    public writeWorkflowFieldsToLocal(workflowField) {
        this.workflowFieldsCacheModel.writeWorkflowFieldsToLocal(workflowField);
        
    }
    public getWorkflowField(){
        return this.workflowFieldsCacheModel.readWorkFLowField();
    }
    public generateworkFlowFunction(){
        return this.workflowFieldsCacheModel.loadWorkflowFieldsFunction();
    }
}

export default new WorkflowFieldService();