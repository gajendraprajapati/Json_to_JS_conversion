import { CONSTANTS } from "../../constants/constants";
import { prepareLeafOperands } from "../../helper/OperandHelper";
import { ExpressionMaker, IFConditionExpressionMaker, OutputAliasMaker } from "../breClass";
import { PolicyBase } from "../policyBase";
import { IBasePolicy } from "../policyModel";

export class BandOutcomeModel extends PolicyBase implements IBasePolicy {
    public val1: string;
    public exp1: string;
    public fieldname: string;
    public displayname: string;
    public ExpType: string;
    public exp2: string;
    public val2: string;
    public band: string;
    public AFSpec: string;
    public FType: string;
    public DType: string;
    public operator: string;
    public ref: any[];

    constructor(props: BandOutcomeModel, iffData: any) {
        super(iffData);
        if (!props) {
            return;
        }

        this.val1 = props.val1;
        this.exp1 = props.exp1;
        this.fieldname = props.fieldname;
        this.displayname = props.displayname;
        this.ExpType = props.ExpType;
        this.exp2 = props.exp2;
        this.val2 = props.val2;
        this.band = props.band;
        this.AFSpec = props.AFSpec;
        this.FType = props.FType;
        this.DType = props.DType;
        this.operator = props.operator;
    }

    public generate() {
        const innerOperand = prepareLeafOperands(this, false, false, "", "", this.iffData);
        return new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(this.band, ""), innerOperand);
    }

}
