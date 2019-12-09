import { CONSTANTS } from "../../constants/constants";
import * as OperandHelper from "../../helper/OperandHelper";
import { ExpressionMaker, ExpressionsMaker, IFConditionExpressionMaker, OperandMaker, OutputAliasMaker } from "../breClass";
import { PolicyBase } from "../policyBase";
import { IBasePolicy } from "../policyModel";
import { LogicRefModel } from "./categoryRefModel";
import { LogicModel } from "./logicModel";
import * as StringUtil from "../../util/StringUtil";
import * as OperationsUtil from "../../util/OperationsUtil";
import { CustomField } from "../customFieldModel";

export class ScoreRuleModel extends PolicyBase {
    public logic: LogicModel[];
    public weight: any;
    public ItemID: number;
    public weightFieldDisplayName: string;
    public weightType: string;

    constructor(props: ScoreRuleModel, iffData: any, customFields: CustomField[]) {
        super(iffData);
        if (!props) {
            return;
        }

        const { logic = [] } = props;
        this.weight = props.weight;
        this.weightFieldDisplayName = props.weightFieldDisplayName;
        this.weightType = props.weightType;
        this.logic = logic.map((x) => {
            x.weight = this.weight;
            return new LogicModel(x, this.iffData, customFields);
        });

        this.ItemID = props.ItemID;
    }

    public generate(catName, attributeName) {
        const ifStmtArr = [];
        let firstDScore;
        let dScoreOperand;
        let cScoreOperand;
        let weightOperand;
        const logicDscore = new ExpressionMaker(CONSTANTS.ASSIGN_AND_RETURN, "=", []);
        const logicCscore = new ExpressionMaker(CONSTANTS.ASSIGN_AND_RETURN, "=", []);
        const scoreMultiplication = new ExpressionMaker(CONSTANTS.STATEMENT, "*", []);
        let scoreMultiplicationLeftOperand;
        if(!StringUtil.notBlank(this.weightType) || StringUtil.toLowerCase(this.weightType) == CONSTANTS.VALUE) {
            scoreMultiplicationLeftOperand = new OperandMaker((this.weight ? this.weight : 1), CONSTANTS.VALUE, CONSTANTS.types.INTEGER)
        } else {
            const field = OperationsUtil.getFieldBasedOnStructure(CONSTANTS.IFF_STRUCTURE, this.weight, "");
            scoreMultiplicationLeftOperand = new OperandMaker(field, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        }
        scoreMultiplication.operands.push(scoreMultiplicationLeftOperand);

        this.logic.forEach((curLogic: LogicModel, index: number) => {
            if (index == 0) {
                firstDScore = Number(curLogic.score);
                dScoreOperand = `${CONSTANTS.loanOutput}["SCORE-DATA"].SCORE_DETAILS["${catName}"]["${attributeName}"]["${curLogic.displayname}"].dScore`;
                cScoreOperand = `${CONSTANTS.loanOutput}["SCORE-DATA"].SCORE_DETAILS["${catName}"]["${attributeName}"]["${curLogic.displayname}"].cScore`;
                weightOperand = `${CONSTANTS.loanOutput}["SCORE-DATA"].SCORE_DETAILS["${catName}"]["${attributeName}"]["${curLogic.displayname}"].weight`;
                logicDscore.operands.push(new OperandMaker(dScoreOperand, CONSTANTS.FIELD, CONSTANTS.types.INTEGER));
                logicCscore.operands.push(new OperandMaker(cScoreOperand, CONSTANTS.FIELD, CONSTANTS.types.INTEGER));
            }
            ifStmtArr.push(curLogic.generate());
        });
        const defaultScoreExpStmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const defaultScoreExpStmtOperand = new OperandMaker(true, CONSTANTS.VALUE, "any");
        defaultScoreExpStmt.operands.push(defaultScoreExpStmtOperand);
        const defautIFStmt = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(new OperandMaker("", CONSTANTS.VALUE, CONSTANTS.types.STRING), ""), defaultScoreExpStmt);
        ifStmtArr.push(defautIFStmt);
        logicCscore.operands.push(scoreMultiplication);
        scoreMultiplication.operands.push(logicDscore);

        const weightExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const weightExpLeftOperand = new OperandMaker(weightOperand, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        weightExp.operands.push(weightExpLeftOperand);
        weightExp.operands.push(scoreMultiplicationLeftOperand);
        logicCscore.operands.push(weightExp);

        const mutExclusiveStmt = new ExpressionsMaker(CONSTANTS.MUTUAL_EXCLUSIVE_EXPRESSIONS, ifStmtArr);
        logicDscore.operands.push(mutExclusiveStmt);

        return logicCscore;
    }

    public generateScore(catName, attributeName) {
        let cScoreOperand;
        const scoreRuleRetArr: Array<ExpressionsMaker | OperandMaker[]> = [];
        const logicExp = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);

        this.logic.forEach((curLogic: LogicModel, index: number) => {
            if (index == 0) {
                const logicNameExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
                const logicNameExpLeftOperand = new OperandMaker("outputObjIterator.name", CONSTANTS.FIELD, CONSTANTS.types.STRING);
                const logicNameExpRigltOperand = new OperandMaker(curLogic.displayname, CONSTANTS.VALUE, CONSTANTS.types.STRING);
                logicNameExp.operands.push(logicNameExpLeftOperand);
                logicNameExp.operands.push(logicNameExpRigltOperand);
                logicExp.expressions.push(logicNameExp);

                const logicScoreExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
                const logicScoreExpleftOperand = new OperandMaker("outputObjIterator.score", CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
                const logicScoreExpRightOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"]["SCORE_DETAILS"]["${catName}"]["${attributeName}"]["${curLogic.displayname}"].cScore`, CONSTANTS.FIELD, "number");
                logicScoreExp.operands.push(logicScoreExpleftOperand);
                logicScoreExp.operands.push(logicScoreExpRightOperand);
                logicExp.expressions.push(logicScoreExp);

                cScoreOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"]["SCORE_DETAILS"]["${catName}"]["${attributeName}"]["${curLogic.displayname}"].cScore`, CONSTANTS.FIELD, "number");
            }
        });

        scoreRuleRetArr.push(logicExp);
        scoreRuleRetArr.push(cScoreOperand);
        return scoreRuleRetArr;
    }

    public generateValueAndExp(catName, attributeName) {
        let dScoreOperand;
        let firstDScore;
        const expression = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);
        const logicexpression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const logicDefaultIfCondExpresssion = new ExpressionMaker(CONSTANTS.STRING_OPERATION, CONSTANTS.stringOperators.EQUAL, []);
        let maxRefIndex = 0;
        let max = 0;
        this.logic.forEach((curLogik, index) => {
            if(index == 0) {
                dScoreOperand = `${CONSTANTS.loanOutput}["SCORE-DATA"].SCORE_DETAILS["${catName}"]["${attributeName}"]["${curLogik.displayname}"].dScore`;
                firstDScore = Number(curLogik.score);
                const expressionLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].SCORE_DETAILS["${catName}"]["${attributeName}"]["${curLogik.displayname}"]["expression"]`, CONSTANTS.FIELD, CONSTANTS.types.STRING);
                logicexpression.operands.push(expressionLeftOperand);
                const logicDefaultCondExpressionLeftOperand = new OperandMaker(dScoreOperand, CONSTANTS.FIELD, CONSTANTS.types.STRING);
                const logicDefaultCondExpressionRightOperand = new OperandMaker("", CONSTANTS.VALUE, CONSTANTS.types.STRING);
                logicDefaultIfCondExpresssion.operands.push(logicDefaultCondExpressionLeftOperand);
                logicDefaultIfCondExpresssion.operands.push(logicDefaultCondExpressionRightOperand);
            }

            if (curLogik.ref.length > max) {
                maxRefIndex = index;
            }
            max = curLogik.ref.length;
        });
        const logicExpMutualExclusiveStmt = new ExpressionsMaker(CONSTANTS.MUTUAL_EXCLUSIVE_EXPRESSIONS, []);
        const defaultExpIfStmt = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker("No Rule Matched", ""), logicDefaultIfCondExpresssion);
        logicExpMutualExclusiveStmt.expressions.push(defaultExpIfStmt);

        this.logic.forEach((curLogic: LogicModel, index: number) => {
            const logicValueStmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
            const logicStmtLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].SCORE_DETAILS["${catName}"]["${attributeName}"]["${curLogic.displayname}"]["value"]["${curLogic.displayname}"]`, CONSTANTS.FIELD, CONSTANTS.types.STRING);
            const logicStmtRightOperand = OperandHelper.valueRightOperand(curLogic, this.iffData);
            logicValueStmt.operands.push(logicStmtLeftOperand);
            logicValueStmt.operands.push(logicStmtRightOperand);
            expression.expressions.push(logicValueStmt);
            curLogic.ref.forEach((logicRef: LogicRefModel, index: number) => {
                const logicValueStmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
                const refStmtLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].SCORE_DETAILS["${catName}"]["${attributeName}"]["${curLogic.displayname}"]["value"]["${logicRef.displayname}"]`, CONSTANTS.FIELD, CONSTANTS.types.STRING);
                const refStmtRightOperand = OperandHelper.valueRightOperand(logicRef, this.iffData);
                logicValueStmt.operands.push(refStmtLeftOperand);
                logicValueStmt.operands.push(refStmtRightOperand);
                expression.expressions.push(logicValueStmt);
            });
            const logicIfCondExpression = new ExpressionMaker(CONSTANTS.STATEMENT, "==", []);
            const logicIfCondExpressionLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].SCORE_DETAILS["${catName}"]["${attributeName}"]["${curLogic.displayname}"].dScore`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
            const logicIfCondExpressionRightOperand = new OperandMaker(curLogic.score, CONSTANTS.VALUE, CONSTANTS.types.INTEGER);
            logicIfCondExpression.operands.push(logicIfCondExpressionLeftOperand);
            logicIfCondExpression.operands.push(logicIfCondExpressionRightOperand);

            const tempRefExp = [];
            const tempExp = "";
            const temArr = [];
            if (curLogic.val1 == "" && curLogic.exp1 == "") {
                temArr.push(`(( ${curLogic.displayname} ${curLogic.exp2} ${curLogic.val2}  ))`);
                temArr.push(curLogic.operator);
                if (curLogic.ref.length == 0) {
                    temArr.push(curLogic.operator + " ");
                    tempRefExp.push(temArr.join(" "));
                } else {
                    temArr.push(curLogic.getExp());
                    tempRefExp.push(` ( ${temArr.join(" ")} ) `);
                }
            } else {
                temArr.push(`( ( ${curLogic.val1} ${curLogic.exp1} ${curLogic.displayname} )`);
                temArr.push("&&");
                temArr.push(`( ${curLogic.displayname} ${curLogic.exp2} ${curLogic.val2} ) `);
                temArr.push(curLogic.operator);
                if (curLogic.ref.length == 0) {
                    temArr.push(curLogic.operator + " ");
                    tempRefExp.push(temArr.join(" "));
                } else {
                    temArr.push(curLogic.getExp());
                    tempRefExp.push(` ( ${temArr.join(" ")} ) `);
                }
            }
            const refIfCond = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(tempRefExp.join(""), ""), logicIfCondExpression);
            logicExpMutualExclusiveStmt.expressions.push(refIfCond);
        });
        logicexpression.operands.push(logicExpMutualExclusiveStmt);
        expression.expressions.push(logicexpression);

        // prepare default dScore after calculating FINAL_SCORE. Default dScore should be assigned to first condition dScore if not matching rule
        if (dScoreOperand && dScoreOperand.trim().length > 0) {
            const ifExp = new ExpressionMaker(CONSTANTS.STRING_OPERATION, CONSTANTS.stringOperators.EQUAL, []);
            const ifExpLeftOperand = new OperandMaker(dScoreOperand, CONSTANTS.FIELD, CONSTANTS.types.STRING);
            const ifExpRightOperand = new OperandMaker("", CONSTANTS.VALUE, CONSTANTS.types.STRING);
            ifExp.operands.push(ifExpLeftOperand);
            ifExp.operands.push(ifExpRightOperand);
            const outputAliasTrueOperand = new OperandMaker(firstDScore, CONSTANTS.VALUE, CONSTANTS.types.INTEGER);
            const outputAliasFalseOperand = new OperandMaker(dScoreOperand, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
            const ifCondition = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(outputAliasTrueOperand, outputAliasFalseOperand), ifExp);

            const defaultDScoreExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
            const defaultDScoreLeftOperand = new OperandMaker(dScoreOperand, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
            defaultDScoreExp.operands.push(defaultDScoreLeftOperand);
            defaultDScoreExp.operands.push(ifCondition);

            expression.expressions.push(defaultDScoreExp);
        }

        return expression;
    }

}
