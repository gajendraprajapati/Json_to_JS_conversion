import { PolicyBase } from "../policyBase";

import { IBasePolicy } from "../policyModel";

export class eligibilityAggrigatedValueModel extends PolicyBase implements IBasePolicy{
    public FIELD_NAME: string;
    public DISP_NAME: string;
    public MAX: string;
    public MIN: string;

    public generate(){
        
    }
}