import { CONSTANTS } from "../constants/constants";
import * as OperandHelper from "../helper/OperandHelper";
import { IFConditionExpressionMaker } from "../models/breClass";
import { ExpressionMaker, ExpressionsMaker, OperandMaker } from "./breClass";
import { Condition } from "./customRuleConditionModel";
import { Outcome } from "./customRuleOutcomeModel";
import { PolicyBase } from "./policyBase";

export class RULE extends PolicyBase {
    public Condition: Condition[];
    public Outcome: Outcome;

    constructor(props?: RULE, iffData?: any) {
        super(iffData);
        if (!props) {
            return;
        }
        const { Condition: cond = [], Outcome: outc } = props;
        this.Condition = cond.map((x) => new Condition(x, iffData));
        this.Outcome = new Outcome(outc);
    }
}
