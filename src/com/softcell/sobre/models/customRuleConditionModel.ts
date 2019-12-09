import { CONSTANTS } from "../constants/constants";
import * as OperandHelper from "../helper/OperandHelper";
import { ExpressionMaker, ExpressionsMaker, OperandMaker } from "./breClass";
import { Ref } from "./customFieldRefModel";
import { PolicyBase } from "./policyBase";

export class Condition extends PolicyBase {
    public val1: string;
    public exp1: string;
    public fieldname: string;
    public displayname: string;
    public exp2: string;
    public val2: string;
    public operator: string;
    public outOperator: string;
    public DType: string;
    public AFSpec: string;
    public FType: string;
    public ExpType: string;
    public Difference: string;
    public DiffOpr: string;
    public ref: Ref[];

    constructor(props?: Condition, iffData?: any) {
        super(iffData);
        if (!props) {
            return;
        }
        this.val1 = props.val1;
        this.exp1 = props.exp1;
        this.fieldname = props.fieldname;
        this.displayname = props.displayname;
        this.exp2 = props.exp2;
        this.val2 = props.val2;
        this.operator = props.operator;
        this.outOperator = props.outOperator;
        this.DType = props.DType;
        this.AFSpec = props.AFSpec;
        this.FType = props.FType;
        this.ExpType = props.ExpType;
        this.Difference = props.Difference;
        this.DiffOpr = props.DiffOpr;
        const { ref = [] } = props;
        this.ref = ref.map((x) => new Ref(x, iffData));
    }
}
