import { PolicyBase } from "../policyBase";

import { IBasePolicy } from "../policyModel";
import { EligibiltyAdditionalFieldsModel } from "./eligibilityAdditionalFieldsModel";

export class EligibilityOutcomeModel extends PolicyBase implements IBasePolicy{
    public DECISION: string;
    public COMPUTE_DISP: string;
    public COMPUTE_LOGIC: string;
    public REMARK: string;
    public ADDITIONAL_FIELDS: EligibiltyAdditionalFieldsModel[];

    constructor(props: EligibilityOutcomeModel, iffData: any) {
        super(iffData);
        if (!props) {
            return;
        }
        this.DECISION = props.DECISION;
        this.COMPUTE_DISP = props.COMPUTE_DISP;
        this.COMPUTE_LOGIC = props.COMPUTE_LOGIC;
        this.REMARK = props.REMARK;
        this.ADDITIONAL_FIELDS = props.ADDITIONAL_FIELDS;
    }
    public generate(){

    }

}