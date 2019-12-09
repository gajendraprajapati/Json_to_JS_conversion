import { prepareLeafOperands } from "../../helper/OperandHelper";
import { PolicyBase } from "../policyBase";
import { IBasePolicy } from "../policyModel";

export class BandConditionRefModel extends PolicyBase implements IBasePolicy {

    public AFSpec: String;
    public DType: String;
    public ExpType: String;
    public FType: String;
    public displayname: String;
    public exp1: String;
    public exp2: String;
    public fieldname: String;
    public operator: String;
    public val1: String;
    public val2: String;

    constructor(props: BandConditionRefModel, iffData: any) {
        super(iffData);
        if (!props) {
            return;
        }

        this.AFSpec = props.AFSpec;
        this.DType = props.DType;
        this.ExpType = props.ExpType;
        this.FType = props.FType;
        this.displayname = props.displayname;
        this.exp1 = props.exp1;
        this.exp2 = props.exp2;
        this.fieldname = props.fieldname;
        this.operator = props.operator;
        this.val1 = props.val1;
        this.val2 = props.val2;
    }

    public generate() {
        const innerOperand = prepareLeafOperands(this, false, false, "", "", this.iffData);
        return innerOperand;

    }

}
