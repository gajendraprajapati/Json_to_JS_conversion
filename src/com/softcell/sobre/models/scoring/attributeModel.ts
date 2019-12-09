import { CONNREFUSED } from "dns";
import { CONSTANTS } from "../../constants/constants";
import { ExpressionMaker, ExpressionsMaker, IFConditionExpressionMaker, OperandMaker, OutputAliasMaker } from "../breClass";
import { PolicyBase } from "../policyBase";
import { IBasePolicy } from "../policyModel";
import { ScoreRuleModel } from "./scoreRuleModel";
import { CustomField } from "../customFieldModel";

export class AttributeModel extends PolicyBase implements IBasePolicy {
    public name: string;
    public scorRules: ScoreRuleModel[];
    public weight: number;
    public color: string;

    constructor(props: AttributeModel, iffData: any, customFields: CustomField[]) {
        super(iffData);
        if (!props) {
            return;
        }

        this.name = props.name;
        const { scorRules = [] } = props;
        this.scorRules = scorRules.map((x) => new ScoreRuleModel(x, this.iffData, customFields));
        this.weight = props.weight;
        this.color = props.color;
    }

    public generate(name) {
        const scoreRuleExp = [];
        this.scorRules.forEach((scoreRule: ScoreRuleModel) => {
            const attributeMultiplication = new ExpressionMaker(CONSTANTS.STATEMENT, "*", []);
            attributeMultiplication.operands.push(new OperandMaker((this.weight ? this.weight : 1), CONSTANTS.VALUE, "number"));
            attributeMultiplication.operands.push( scoreRule.generate(name, this.name) );
            scoreRuleExp.push(attributeMultiplication);
        });
        return scoreRuleExp;
    }

    public generateScore(name) {
        let sumArray = [];
        const attributeScores = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);
        const attributeNameExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const attributeNameExpLeftOperand = new OperandMaker("outputObjIterator.name", CONSTANTS.FIELD, "string");
        const attributeNameExpRightOperand = new OperandMaker(this.name, CONSTANTS.VALUE, "string");
        attributeNameExp.operands.push(attributeNameExpLeftOperand);
        attributeNameExp.operands.push(attributeNameExpRightOperand);
        attributeScores.expressions.push(attributeNameExp);
        this.scorRules.forEach((scoreRule: ScoreRuleModel) => {
            const attributeMultiplication = new ExpressionMaker(CONSTANTS.STATEMENT, "*", []);
            attributeMultiplication.operands.push(new OperandMaker((this.weight ? this.weight : 1), CONSTANTS.VALUE, "number"));
            attributeMultiplication.operands.push( scoreRule.generateScore(name, this.name)[1] );
            sumArray.push( attributeMultiplication );
        });

        sumArray =  sumArray.reduce((prev, cur) => {
            return prev.concat(cur);
        }, []);

        const attributeScore = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const attributeScoreLeftOperand = new OperandMaker("outputObjIterator.score", CONSTANTS.FIELD, "string");
        attributeScore.operands.push(attributeScoreLeftOperand);
        const attributeScoreRightOperand = new ExpressionMaker(CONSTANTS.STATEMENT, "+", sumArray);
        attributeScore.operands.push(attributeScoreRightOperand);
        attributeScores.expressions.push(attributeScore);

        const attributeFieldStmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const attributeFieldStmtLeftOperand = new OperandMaker("outputObjIterator.Fields", CONSTANTS.FIELD, "array");
        const attributeFieldStmtRightOperand = new OperandMaker([[]], CONSTANTS.VALUE, "array");
        attributeFieldStmt.operands.push(attributeFieldStmtLeftOperand);
        attributeFieldStmt.operands.push(attributeFieldStmtRightOperand);
        attributeScores.expressions.push(attributeFieldStmt);

        this.scorRules.forEach((scoreRule: ScoreRuleModel) => {
            const attributePushRightOperand = scoreRule.generateScore(name, this.name)[0];
            const attributePushStmt = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, "push", []);
            const attributePushStmtLeftOperand = new OperandMaker("outputObjIterator.Fields[0]", CONSTANTS.FIELD, "array");
            attributePushStmt.operands.push(attributePushStmtLeftOperand);
            attributePushStmt.operands.push(attributePushRightOperand);
            attributeScores.expressions.push(attributePushStmt);
        });

        return [attributeScores, sumArray];
    }

    public generateValueAndExp(name) {
        const valExp = [];
        this.scorRules.forEach((scoreRule: ScoreRuleModel) => {
          valExp.push(scoreRule.generateValueAndExp(name, this.name));
        });
        return valExp;
    }
}
