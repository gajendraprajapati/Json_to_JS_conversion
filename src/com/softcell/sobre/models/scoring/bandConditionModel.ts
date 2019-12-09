import { CONSTANTS } from "../../constants/constants";
import { prepareLeafOperands } from "../../helper/OperandHelper";
import { ExpressionMaker } from "../breClass";
import { PolicyBase } from "../policyBase";
import { IBasePolicy } from "../policyModel";
import { BandConditionRefModel } from "./bandConditionRef";

export class BandConditionModel extends PolicyBase implements IBasePolicy {

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
    public outOperator: string;
    public ref: BandConditionRefModel[];

    constructor(props: BandConditionModel, iffData: any) {
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
        this.outOperator = props.outOperator;
        const {ref = []} = props;
        this.ref = ref.map((x) => new BandConditionRefModel(x, this.iffData));

    }

    public generate() {
        const outerOperand = new ExpressionMaker(CONSTANTS.STATEMENT, " ", []);
        const innerOperands = [];
        outerOperand.operands = innerOperands;
        const innerOperand = prepareLeafOperands(this, false, false, "", "", this.iffData);
        innerOperands.push(innerOperand);

        this.ref.forEach((ref: BandConditionRefModel, index: number) => {
            if (index == 0) {
                outerOperand.operator = this.operator;
            }

            const innerOperand = ref.generate();
            innerOperands.push(innerOperand);
        });

        if (this.ref.length == 0) {
            outerOperand.template = innerOperand.template;
            outerOperand.operator = innerOperand.operator;
            outerOperand.operands = innerOperand.operands;
        }
        return outerOperand;

    }

}
