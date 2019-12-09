import { PolicyBase } from "../policyBase";

import { IBasePolicy } from "../policyModel";

export class EligibiltyAdditionalFieldsModel extends PolicyBase implements IBasePolicy{
    public name: string;
    public value: number;
    public generate(){
    }
    
}