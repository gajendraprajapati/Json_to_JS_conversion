import { CONSTANTS } from "../../constants/constants";
import { ExpressionMaker, ExpressionsMaker, OperandMaker } from "../breClass";
import { PolicyBase } from "../policyBase";
import { IBasePolicy } from "../policyModel";
import { AttributeModel } from "./attributeModel";
import { CustomField } from "../customFieldModel";

export class CategoryModel extends PolicyBase implements IBasePolicy {
    public name: string;
    public attributes: AttributeModel[];
    public weight: number;
    public color: string;

    constructor(props: CategoryModel, iffData: any, customFields: CustomField[]) {
        super(iffData);
        if (!props) {
            return;
        }

        this.name = props.name;
        const { attributes = [] } = props;
        this.attributes = attributes.map((x) => new AttributeModel(x, this.iffData, customFields));
        this.weight = props.weight;
        this.color = props.color;
    }

    public generate() {
        const attributeExp = [];
        this.attributes.forEach((attribute: AttributeModel) => {
            attributeExp.push(attribute.generate(this.name));
        });
        const expArr =  attributeExp.reduce((prev, cur) => {
            return prev.concat(cur);
        }, []);
        const sumExp = new ExpressionMaker(CONSTANTS.STATEMENT, "+", expArr);
        const categoryMultiplication = new ExpressionMaker(CONSTANTS.STATEMENT, "*", []);
        categoryMultiplication.operands.push(new OperandMaker((this.weight ? this.weight : 1), CONSTANTS.VALUE, "number"));
        categoryMultiplication.operands.push( sumExp );

        return categoryMultiplication;
    }

    public generateScore() {
        const categoryScores = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);
        let attributeSumArr = [];
        const categoryNameExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const categoryNameExpLeftOperand = new OperandMaker("outputObjIterator.name", CONSTANTS.FIELD, "string");
        const categoryNameExpRightOperand = new OperandMaker(this.name, CONSTANTS.VALUE, "string");
        categoryNameExp.operands.push(categoryNameExpLeftOperand);
        categoryNameExp.operands.push(categoryNameExpRightOperand);
        categoryScores.expressions.push(categoryNameExp);
        this.attributes.forEach((attribute: AttributeModel) => {
            attributeSumArr.push(attribute.generateScore(this.name)[1]);
        });
        attributeSumArr = attributeSumArr.reduce((prev, cur) => {
            return prev.concat(cur);
        }, []);

        const attributeScore = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const attributeScoreLeftOperand = new OperandMaker("outputObjIterator.score", CONSTANTS.FIELD, "string");
        attributeScore.operands.push(attributeScoreLeftOperand);
        const attributeScoreRightOperand = new ExpressionMaker(CONSTANTS.STATEMENT, "+", [...attributeSumArr]);

        const categoryMultiplication = new ExpressionMaker(CONSTANTS.STATEMENT, "*", []);
        categoryMultiplication.operands.push(new OperandMaker((this.weight ? this.weight : 1), CONSTANTS.VALUE, "number"));
        categoryMultiplication.operands.push( attributeScoreRightOperand );

        attributeScore.operands.push(categoryMultiplication);
        categoryScores.expressions.push(attributeScore);

        const plansExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const plansExpLeftOperand = new OperandMaker("outputObjIterator.Plans", CONSTANTS.FIELD, "array");
        const plansExpRightOperand = new OperandMaker([[]], CONSTANTS.VALUE, "array");
        plansExp.operands.push(plansExpLeftOperand);
        plansExp.operands.push(plansExpRightOperand);
        categoryScores.expressions.push(plansExp);

        this.attributes.forEach((attribute: AttributeModel) => {
            const categoryPushStmt = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, "push", []);
            const categoryPushStmtLeftOperand = new OperandMaker("outputObjIterator.Plans[0]", CONSTANTS.FIELD, "array");
            categoryPushStmt.operands.push(categoryPushStmtLeftOperand);
            categoryPushStmt.operands.push(attribute.generateScore(this.name)[0]);
            categoryScores.expressions.push(categoryPushStmt);
        });

        const scoreTreeScoresPushStmt = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, "push", []);
        const scoreTreeScoresPushStmtLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}.SCORE_TREE.Scores`, CONSTANTS.FIELD, "object");
        const scoreTreeScoresPushStmtRightOperand = new OperandMaker("outputObjIterator", CONSTANTS.FIELD, "object");
        scoreTreeScoresPushStmt.operands.push(scoreTreeScoresPushStmtLeftOperand);
        scoreTreeScoresPushStmt.operands.push(scoreTreeScoresPushStmtRightOperand);

        categoryScores.expressions.push(scoreTreeScoresPushStmt);
        return categoryScores;
    }

    public generateValueAndExp() {
        const valExp = [];
        this.attributes.forEach((attribute: AttributeModel) => {
            valExp.push(attribute.generateValueAndExp(this.name));
        });

        return valExp.reduce((prev, cur) => {
            return prev.concat(cur);
        }, []);
    }

}
