import { CONSTANTS } from "../../constants/constants";
import { ExpressionMaker, ExpressionsMaker, IFConditionExpressionMaker, OperandMaker, OutputAliasMaker } from "../breClass";
import { PolicyBase } from "../policyBase";
import { IBasePolicy } from "../policyModel";
import { BandConditionModel } from "./bandConditionModel";
import { BandOutcomeModel } from "./bandOutcomeModel";

export class BandConfigModel extends PolicyBase implements IBasePolicy {
    public bandCondition: BandConditionModel[];
    public bandOutcome: BandOutcomeModel[];
    // outerOperands: Array<ExpressionMaker>;
    public expressionTree: ExpressionMaker;

    constructor(props: BandConfigModel, iffData: any) {
        super(iffData);
        if (!props) {
            return;
        }

        const { bandCondition = [], bandOutcome = [] } = props;
        this.bandCondition = bandCondition.map((x) => new BandConditionModel(x, this.iffData));
        this.bandOutcome = bandOutcome.map((x) => new BandOutcomeModel(x, this.iffData));

    }

    public generate() {
        const outerOperands = [];
        const bandOutCome = [];
        let expressionTreeOperator;
        const bandOutComeMutulExp = new ExpressionsMaker(CONSTANTS.MUTUAL_EXCLUSIVE_EXPRESSIONS, []);
        if (this.bandCondition.length == 0) {
            this.bandOutcome.forEach((bandoutcome: BandOutcomeModel) => {
                bandOutCome.push(bandoutcome.generate());

            });

            return bandOutCome;

        }
        this.bandCondition.forEach((bandcondtion: BandConditionModel, index: number) => {
            if (index == 0) {
                expressionTreeOperator = bandcondtion.outOperator;
            }
            const outerOperand = bandcondtion.generate();
            outerOperands.push(outerOperand);
        });

        this.bandOutcome.forEach((bandoutcome: BandOutcomeModel) => {
            bandOutComeMutulExp.expressions.push(bandoutcome.generate());

        });

        return BandConfigModel.assignBand(bandOutComeMutulExp, outerOperands, expressionTreeOperator);
    }

    private static assignBand(bandOutComeMutulExp: ExpressionsMaker, outerOperands, expressionTreeOperator) {
        const outcomeStmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const expressionTree = new ExpressionMaker(CONSTANTS.STATEMENT, expressionTreeOperator, outerOperands);
        const outcomeRightStmtOperand = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(bandOutComeMutulExp, " "), expressionTree);
        outcomeStmt.operands.push(outcomeRightStmtOperand);
        return outcomeRightStmtOperand;
    }

}
