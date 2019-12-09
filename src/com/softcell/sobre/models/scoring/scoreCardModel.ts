import { CONSTANTS } from "../../constants/constants";
import * as OperationsUtil from "../../util/OperationsUtil";
import * as StringUtil from "../../util/StringUtil";
import { ExpressionMaker, ExpressionsMaker, IFConditionExpressionMaker, OperandMaker, OutputAliasMaker } from "../breClass";
import { PolicyBase } from "../policyBase";
import { IBasePolicy } from "../policyModel";
import { CreditPolicy } from "../policyModel";
import { BandConfigModel } from "./bandConfigModel";
import { CategoryModel } from "./categoryModel";
import { LogicRefModel } from "./categoryRefModel";
import * as EncDecryptUtil from "../../util/EncDecryptUtil";
import {isNullOrUndefined} from "util";
import { CustomField } from "../customFieldModel";

export class ScoreCardModel extends PolicyBase implements IBasePolicy {
    public name: string;
    public baseScore: string;
    public baseOprtr: string;
    public bandConfig: BandConfigModel[];
    public categories: CategoryModel[];
    public createdby: string;
    public createDate: string;
    public tableMinScore: string;
    public tableMaxScore: string;
    public creditPolicy: CreditPolicy;
    public baseOperations: any = [CONSTANTS.scoringBaseOperator.ADDITION, CONSTANTS.scoringBaseOperator.DIFFERENCE, CONSTANTS.scoringBaseOperator.MULTIPLICATION, CONSTANTS.scoringBaseOperator.DIVISION];

    constructor(props: ScoreCardModel, iffData: any, creditPolicy: CreditPolicy, customFields: CustomField[]) {
        super(iffData);
        if (!props) {
            return;
        }
        this.name = props.name;
        this.baseScore = props.baseScore;
        this.baseOprtr = props.baseOprtr;
        const { bandConfig = [], categories = []} = props;
        this.bandConfig = bandConfig ? bandConfig.map((x) => new BandConfigModel(x, this.iffData) ) : [];
        this.categories = categories ? categories.map((x) => new CategoryModel(x, this.iffData, customFields)) : [];
        this.createdby = props.createdby;
        this.createDate = props.createDate;
        this.tableMinScore = props.tableMinScore;
        this.tableMaxScore = props.tableMaxScore;
        this.creditPolicy = creditPolicy;
    }

    public generate() {
        const scoreCardExpression = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);
        const scoreCardExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const scoreCardExpLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].FINAL_SCORE`, CONSTANTS.FIELD, "number");

        let baseScoreOpExp;
        const scoringBaseOperation = OperationsUtil.scoringOperations(this.baseOprtr);
        if (this.baseOperations.includes(scoringBaseOperation)) {
            baseScoreOpExp = new ExpressionMaker(CONSTANTS.STATEMENT, scoringBaseOperation, []);
        } else {
            baseScoreOpExp = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, scoringBaseOperation, []);
        }

        const baseScoreOpExpRightOperand = new OperandMaker(this.baseScore, CONSTANTS.VALUE, "number");
        const scoreValueExp = new ExpressionMaker(CONSTANTS.ASSIGN_AND_RETURN, "=", [], EncDecryptUtil.encrypt(this.name), this.name, CONSTANTS.SCORING, undefined, "true") ;
        const scoreValueExpLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].SCORE_VALUE`, CONSTANTS.FIELD, "number");
        const statusExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const statusExpLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].STATUS`, CONSTANTS.FIELD, CONSTANTS.types.STRING);
        const statusExpRightOperand = new OperandMaker("SUCCESS", CONSTANTS.VALUE, CONSTANTS.types.STRING);
        statusExp.operands.push(statusExpLeftOperand);
        statusExp.operands.push(statusExpRightOperand);

        const minExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const minExpLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].dMinScore`, CONSTANTS.FIELD, CONSTANTS.types.STRING);
        const minExpRightOperand = new OperandMaker(this.tableMinScore, CONSTANTS.VALUE, CONSTANTS.types.STRING);
        minExp.operands.push(minExpLeftOperand);
        minExp.operands.push(minExpRightOperand);

        const maxExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const maxExpLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].dMaxScore`, CONSTANTS.FIELD, CONSTANTS.types.STRING);
        const maxExpRightOperand = new OperandMaker(this.tableMaxScore, CONSTANTS.VALUE, CONSTANTS.types.STRING);
        maxExp.operands.push(maxExpLeftOperand);
        maxExp.operands.push(maxExpRightOperand);

        const scoringSampleObj = this.createSampleObj();
        const scoreNameExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const scoreNameExpLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].SCORECARD_NAME`, CONSTANTS.FIELD, CONSTANTS.types.STRING);
        const scoreNameExpRightOperand = new OperandMaker(this.name, CONSTANTS.VALUE, CONSTANTS.types.STRING);
        scoreNameExp.operands.push(scoreNameExpLeftOperand);
        scoreNameExp.operands.push(scoreNameExpRightOperand);
        scoreCardExpression.expressions.push(scoreNameExp);

        const scoreDataSampleExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const scoreDataSampleExpLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].SCORE_DETAILS`, CONSTANTS.FIELD, "object");
        const scoreDataSampleExpRightOperand = new OperandMaker(scoringSampleObj, CONSTANTS.VALUE, "object");
        scoreDataSampleExp.operands.push(scoreDataSampleExpLeftOperand);
        scoreDataSampleExp.operands.push(scoreDataSampleExpRightOperand);
        scoreCardExpression.expressions.push(scoreDataSampleExp);

        let sumOperandArr = [];
        const scoreTreeScoreExp = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);
        const scoreTreeScoreStmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const scoreTreeScoreStmtLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}.SCORE_TREE.Scores`, CONSTANTS.FIELD, "array");
        const scoreTreeScoreStmtRightOperand = new OperandMaker([], CONSTANTS.VALUE, "array");
        scoreTreeScoreStmt.operands.push(scoreTreeScoreStmtLeftOperand);
        scoreTreeScoreStmt.operands.push(scoreTreeScoreStmtRightOperand);
        scoreTreeScoreExp.expressions.push(scoreTreeScoreStmt);

        let scoreValueArray = [];
        this.categories.forEach((category: CategoryModel) => {
            sumOperandArr.push(category.generate());
            scoreTreeScoreExp.expressions.push(category.generateScore());
            scoreValueArray.push(category.generateValueAndExp());
        });

        scoreValueArray = scoreValueArray.reduce((prev, cur) => {
            return prev.concat(cur);
        }, []);
        const finalBandMutualExclusiveStmt = new ExpressionsMaker(CONSTANTS.MUTUAL_EXCLUSIVE_EXPRESSIONS, []);
        const finalBandMutualExclusiveStmtArray = [];
        this.bandConfig.forEach((bandconfig: BandConfigModel) => {
            finalBandMutualExclusiveStmtArray.push(bandconfig.generate());
        });
        const defaultBandStmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const defaultBandStmtleftOperand = new OperandMaker(true, CONSTANTS.VALUE, "any");
        defaultBandStmt.operands.push(defaultBandStmtleftOperand);

        const defaultIFCond = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker("", 0), defaultBandStmt);

        finalBandMutualExclusiveStmt.expressions = finalBandMutualExclusiveStmtArray.reduce((prev, cur) => {
            return prev.concat(cur);
        }, []);
        finalBandMutualExclusiveStmt.expressions.push(defaultIFCond);

        let scoreValueExpRightOperand;
        const sumExp = new ExpressionMaker(CONSTANTS.STATEMENT, "+", sumOperandArr);
        if (StringUtil.toLowerCase(scoringBaseOperation) == "exp" || StringUtil.toLowerCase(scoringBaseOperation) == "exp1") {
            scoreValueExpRightOperand = new ExpressionMaker(CONSTANTS.STATEMENT, "-", []);
            const adjustment = OperationsUtil.getScoreAdjustment(this.name);
            const adjustmentOperand = new OperandMaker(adjustment, "value", "number");

            scoreValueExpRightOperand.operands.push(sumExp);
            scoreValueExpRightOperand.operands.push(adjustmentOperand);
        } else {
            scoreValueExpRightOperand = sumExp;
        }

        scoreCardExp.operands.push(scoreCardExpLeftOperand);
        scoreCardExp.operands.push(baseScoreOpExp);
        scoreValueExp.operands.push(scoreValueExpLeftOperand);
        scoreValueExp.operands.push(scoreValueExpRightOperand);
        scoreValueExp.operands.push(statusExp);

        if (this.tableMaxScore != "0" || this.tableMinScore != "0") {
            scoreValueExp.operands.push(minExp);
            scoreValueExp.operands.push(maxExp);
        }

        baseScoreOpExp.operands.push(scoreValueExp);
        if (this.baseOperations.includes(scoringBaseOperation)) {
            let baseScoreOpExpRightOperand;
            if (StringUtil.notBlank(this.baseScore)) {
                baseScoreOpExpRightOperand = new OperandMaker(this.baseScore, CONSTANTS.VALUE, "number");
            } else {
                baseScoreOpExpRightOperand = new OperandMaker(0, CONSTANTS.VALUE, "number");
            }
            baseScoreOpExp.operands.push(baseScoreOpExpRightOperand);
        }

        scoreCardExpression.expressions.push(scoreCardExp);
        const finalBandExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const finalBandExpLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].FINAL_BAND`, CONSTANTS.FIELD, "number");
        finalBandExp.operands.push(finalBandExpLeftOperand);
        finalBandExp.operands.push(finalBandMutualExclusiveStmt);

        if (this.tableMaxScore != "0" || this.tableMinScore != "0") {
            const scoreRangeExp = this.scoreRange();
            scoreCardExpression.expressions.push(scoreRangeExp);
        }

        const scoreValueExpression = new ExpressionsMaker(CONSTANTS.FOR_EACH, scoreValueArray);

        //Add FINAL_SCORE to workflow
        const finalScoreWorkflowExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const finalScoreWorkflowLeft = new OperandMaker(`${CONSTANTS.loanInput}.${CONSTANTS.WORKFLOW_FIELDS}.FINAL_SCORE`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        const finalScoreWorkflowRight = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].FINAL_SCORE`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        finalScoreWorkflowExp.operands.push(finalScoreWorkflowLeft);
        finalScoreWorkflowExp.operands.push(finalScoreWorkflowRight);
        scoreCardExpression.expressions.push(finalScoreWorkflowExp);
        scoreCardExpression.expressions.push(finalBandExp);

        //Add SCORE_VALUE to workflow
        const scoreValueWorkflowExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const scoreValueWorkflowLeft = new OperandMaker(`${CONSTANTS.loanInput}.${CONSTANTS.WORKFLOW_FIELDS}.CALCULATED_SCORE`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        const scoreValueWorkflowRight = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].SCORE_VALUE`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        scoreValueWorkflowExp.operands.push(scoreValueWorkflowLeft);
        scoreValueWorkflowExp.operands.push(scoreValueWorkflowRight);
        scoreCardExpression.expressions.push(scoreValueWorkflowExp);

        //Add FINAL_SCORE to workflow
        const finalScoreNameWorkflowExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const finalScoreNameWorkflowLeft = new OperandMaker(`${CONSTANTS.loanInput}.${CONSTANTS.WORKFLOW_FIELDS}["${this.name}_SCORE"]`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        const finalScoreNameWorkflowRight = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].FINAL_SCORE`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        finalScoreNameWorkflowExp.operands.push(finalScoreNameWorkflowLeft);
        finalScoreNameWorkflowExp.operands.push(finalScoreNameWorkflowRight);
        scoreCardExpression.expressions.push(finalScoreNameWorkflowExp);

        //Add FINAL_BAND to workflow
        const finalBandNameWorkflowExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const finalBandNameWorkflowLeft = new OperandMaker(`${CONSTANTS.loanInput}.${CONSTANTS.WORKFLOW_FIELDS}["${this.name}_SCORE_BAND"]`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        const finalBandNameWorkflowRight = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].FINAL_BAND`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        finalBandNameWorkflowExp.operands.push(finalBandNameWorkflowLeft);
        finalBandNameWorkflowExp.operands.push(finalBandNameWorkflowRight);
        scoreCardExpression.expressions.push(finalBandNameWorkflowExp);

        scoreCardExpression.expressions.push(scoreValueExpression);
        const scoreTreeExp = this.createScoreTreeExp();
        scoreCardExpression.expressions.push(scoreTreeExp);
        scoreCardExpression.expressions.push(scoreTreeScoreExp);
        return scoreCardExpression;
    }

    private createSampleObj() {
        const category = this.categories;
        const sampleObj = {};

        for (let categoryCount = 0; categoryCount < category.length; categoryCount++) {
            const curCategory = category[categoryCount];
            sampleObj[curCategory.name] = {};
            const attribute = curCategory.attributes;

            for (let attributeCount = 0; attributeCount < attribute.length; attributeCount++) {
                const curAttribute = attribute[attributeCount];
                sampleObj[curCategory.name][curAttribute.name] = {};
                const scoreRule = curAttribute.scorRules;

                for (let scoreRuleCount = 0; scoreRuleCount < scoreRule.length; scoreRuleCount++) {
                    const curScore = scoreRule[scoreRuleCount];
                    const logic = curScore.logic;

                    logic.forEach((curLogic, index) => {
                        if (index == 0) {
                            sampleObj[curCategory.name][curAttribute.name][curLogic.displayname] = {};
                            sampleObj[curCategory.name][curAttribute.name][curLogic.displayname].dField = curLogic.fieldname;
                            sampleObj[curCategory.name][curAttribute.name][curLogic.displayname].FieldName = curLogic.displayname;
                            sampleObj[curCategory.name][curAttribute.name][curLogic.displayname].value = {};
                            sampleObj[curCategory.name][curAttribute.name][curLogic.displayname].value[curLogic.displayname] = "";
                            curLogic.ref.forEach((catRef) => {
                                sampleObj[curCategory.name][curAttribute.name][curLogic.displayname].value[catRef.displayname] = "";
                            });
                        }
                    });
                }
            }
        }
        return sampleObj;
    }

    private createScoreTreeExp() {
        const scoreTreeExpression = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);

        const scoreTreeObj = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const scoreTreeObjLeftOperand = new OperandMaker(CONSTANTS.loanOutput + ".SCORE_TREE", CONSTANTS.FIELD, "object");
        const scoreTreeObjRightOperand = new OperandMaker({}, CONSTANTS.VALUE, "object");
        scoreTreeObj.operands.push(scoreTreeObjLeftOperand);
        scoreTreeObj.operands.push(scoreTreeObjRightOperand);
        scoreTreeExpression.expressions.push(scoreTreeObj);

        const masterMapStmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const masterMapStmtleftOperand = new OperandMaker(CONSTANTS.loanOutput + ".SCORE_TREE.masterMap", CONSTANTS.FIELD, "object");
        const masterMapStmtRightOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].SCORE_DETAILS`, CONSTANTS.FIELD, "object");
        masterMapStmt.operands.push(masterMapStmtleftOperand);
        masterMapStmt.operands.push(masterMapStmtRightOperand);
        scoreTreeExpression.expressions.push(masterMapStmt);

        const scoringBaseOperation = OperationsUtil.scoringOperations(this.baseOprtr);
        if (this.baseOperations.includes(scoringBaseOperation) && StringUtil.notBlank(this.baseScore)) {
            const scoreTreeBaseScore = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
            const scoreTreeBaseScoreLeftOperand = new OperandMaker(CONSTANTS.loanOutput + ".SCORE_TREE.baseScore", CONSTANTS.FIELD, "number");
            const scoreTreeBaseScoreRightOperand = new OperandMaker(this.baseScore, CONSTANTS.VALUE, "number");
            scoreTreeBaseScore.operands.push(scoreTreeBaseScoreLeftOperand);
            scoreTreeBaseScore.operands.push(scoreTreeBaseScoreRightOperand);
            scoreTreeExpression.expressions.push(scoreTreeBaseScore);
        }

        if (this.tableMaxScore != "0" || this.tableMinScore != "0") {
            const minExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
            const minExpLeftOperand = new OperandMaker("loanResObj.SCORE_TREE.dMinScore", CONSTANTS.FIELD, CONSTANTS.types.STRING);
            const minExpRightOperand = new OperandMaker(this.tableMinScore, CONSTANTS.VALUE, CONSTANTS.types.STRING);
            minExp.operands.push(minExpLeftOperand);
            minExp.operands.push(minExpRightOperand);

            const maxExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
            const maxExpLeftOperand = new OperandMaker("loanResObj.SCORE_TREE.dMaxScore", CONSTANTS.FIELD, CONSTANTS.types.STRING);
            const maxExpRightOperand = new OperandMaker(this.tableMaxScore, CONSTANTS.VALUE, CONSTANTS.types.STRING);
            maxExp.operands.push(maxExpLeftOperand);
            maxExp.operands.push(maxExpRightOperand);

            scoreTreeExpression.expressions.push(minExp);
            scoreTreeExpression.expressions.push(maxExp);
        }

        const scoreTreeBaseOperator = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const scoreTreeBaseOperatorLeftOperand = new OperandMaker(CONSTANTS.loanOutput + ".SCORE_TREE.baseOperator", CONSTANTS.FIELD, CONSTANTS.types.STRING);
        const scoreTreeBaseOperatorRightOperand = new OperandMaker(this.baseOprtr, CONSTANTS.VALUE, CONSTANTS.types.STRING);
        scoreTreeBaseOperator.operands.push(scoreTreeBaseOperatorLeftOperand);
        scoreTreeBaseOperator.operands.push(scoreTreeBaseOperatorRightOperand);
        scoreTreeExpression.expressions.push(scoreTreeBaseOperator);

        const tableIdExpression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const tableIdExpressionLeftOperand = new OperandMaker(CONSTANTS.loanOutput + ".SCORE_TREE.TableID", CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        const tableIdExpressionRightOperand = new OperandMaker(this.getTableId(), CONSTANTS.VALUE, CONSTANTS.types.INTEGER);
        tableIdExpression.operands.push(tableIdExpressionLeftOperand);
        tableIdExpression.operands.push(tableIdExpressionRightOperand);
        scoreTreeExpression.expressions.push(tableIdExpression);

        const appScoreStmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const appScoreLeftOperand = new OperandMaker(CONSTANTS.loanOutput + ".SCORE_TREE.AppScore", CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        const appScoreStmtRightOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].SCORE_VALUE`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        appScoreStmt.operands.push(appScoreLeftOperand);
        appScoreStmt.operands.push(appScoreStmtRightOperand);
        scoreTreeExpression.expressions.push(appScoreStmt);

        const scoreCardNamestmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const scoreCardNamestmtLeftOperand = new OperandMaker(CONSTANTS.loanOutput + ".SCORE_TREE.SCORECARD_NAME", CONSTANTS.FIELD, CONSTANTS.types.STRING);
        const scoreCardNamestmtRightOperand = new OperandMaker(this.name, CONSTANTS.VALUE, CONSTANTS.types.STRING);
        scoreCardNamestmt.operands.push(scoreCardNamestmtLeftOperand);
        scoreCardNamestmt.operands.push(scoreCardNamestmtRightOperand);
        scoreTreeExpression.expressions.push(scoreCardNamestmt);

        const scoreTreeFinalScoreStmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const scoreTreeFinalScoreStmtLeftOperand = new OperandMaker(CONSTANTS.loanOutput + ".SCORE_TREE.FINAL_SCORE", CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        const scoreTreeFinalScoreStmtRightOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].FINAL_SCORE`, CONSTANTS.FIELD, "number");
        scoreTreeFinalScoreStmt.operands.push(scoreTreeFinalScoreStmtLeftOperand);
        scoreTreeFinalScoreStmt.operands.push(scoreTreeFinalScoreStmtRightOperand);
        scoreTreeExpression.expressions.push(scoreTreeFinalScoreStmt);

        const scoreTreeFinalBandStmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const scoreTreeFinalBandStmtLeftOperand = new OperandMaker(CONSTANTS.loanOutput + ".SCORE_TREE.FINAL_BAND", CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        const scoreTreeFinalBandStmtRightOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].FINAL_BAND`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        scoreTreeFinalBandStmt.operands.push(scoreTreeFinalBandStmtLeftOperand);
        scoreTreeFinalBandStmt.operands.push(scoreTreeFinalBandStmtRightOperand);
        scoreTreeExpression.expressions.push(scoreTreeFinalBandStmt);
        return scoreTreeExpression;
    }

    private getTableId() {
        const tableId = this.creditPolicy && this.creditPolicy.TableID && this.creditPolicy.TableID.filter((s) => s.name == this.name);
        if (tableId && tableId.length > 0) {
            return tableId[0].TableID ? tableId[0].TableID : 0;
        } else {
            const tableId = this.creditPolicy && this.creditPolicy.TableID && this.creditPolicy.TableID[0] && this.creditPolicy.TableID[0].TableID;
            return tableId ? tableId : 0;
        }
    }

    private scoreRange() {
        const finalScoreStmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const finalScoreLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].FINAL_SCORE`, CONSTANTS.FIELD, "number");
        finalScoreStmt.operands.push(finalScoreLeftOperand);
        const finalScoreRightOperand = new ExpressionsMaker(CONSTANTS.MUTUAL_EXCLUSIVE_EXPRESSIONS, []);

        const maxScoreExp = new ExpressionMaker(CONSTANTS.NUMBER_OPERATION, ">", []);
        const maxScoreExpLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].FINAL_SCORE`, CONSTANTS.FIELD, "number");
        const maxScoreExpRightOperand = new OperandMaker(this.tableMaxScore, CONSTANTS.VALUE, CONSTANTS.types.INTEGER);
        maxScoreExp.operands.push(maxScoreExpLeftOperand);
        maxScoreExp.operands.push(maxScoreExpRightOperand);

        const maxScoreIfCond = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(this.tableMaxScore, `${CONSTANTS.loanOutput}["SCORE-DATA"].FINAL_SCORE`), maxScoreExp);
        finalScoreRightOperand.expressions.push(maxScoreIfCond);

        const minScoreExp = new ExpressionMaker(CONSTANTS.NUMBER_OPERATION, "<", []);
        const minScoreExpLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].FINAL_SCORE`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        const minScoreExpRightOperand = new OperandMaker(this.tableMinScore, CONSTANTS.VALUE, CONSTANTS.types.INTEGER);
        minScoreExp.operands.push(minScoreExpLeftOperand);
        minScoreExp.operands.push(minScoreExpRightOperand);

        const minScoreIfCond = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(this.tableMinScore, `${CONSTANTS.loanOutput}["SCORE-DATA"].FINAL_SCORE`), minScoreExp);
        finalScoreRightOperand.expressions.push(minScoreIfCond);

        const defaultScoreStmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const defaultScoreStmtOperand = new OperandMaker(true, CONSTANTS.VALUE, "any");
        defaultScoreStmt.operands.push(defaultScoreStmtOperand);

        const defaultIFCond = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"].FINAL_SCORE`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER), 0), defaultScoreStmt);
        finalScoreRightOperand.expressions.push(defaultIFCond);

        finalScoreStmt.operands.push(finalScoreRightOperand);

        return finalScoreStmt;
    }

    public static getAdditionalScores() {
        const additionalScoreExpression = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);

        const additionalScoreObj = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const additionalScoreObjLeftOperand = new OperandMaker("additionalScores", CONSTANTS.FIELD, CONSTANTS.types.OBJECT);
        const additionalScoreObjRightOperand = new OperandMaker({}, CONSTANTS.VALUE, CONSTANTS.types.OBJECT);
        additionalScoreObj.operands.push(additionalScoreObjLeftOperand);
        additionalScoreObj.operands.push(additionalScoreObjRightOperand);
        additionalScoreExpression.expressions.push(additionalScoreObj);

        const addtionalScoreScoreData = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const addtionalScoreScoreDataLeftOperand = new OperandMaker(`additionalScores["SCORE-DATA"]`, CONSTANTS.FIELD, CONSTANTS.types.OBJECT);
        const addtionalScoreScoreDataRightOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"]`, CONSTANTS.FIELD, CONSTANTS.types.OBJECT);
        addtionalScoreScoreData.operands.push(addtionalScoreScoreDataLeftOperand);
        addtionalScoreScoreData.operands.push(addtionalScoreScoreDataRightOperand);
        additionalScoreExpression.expressions.push(addtionalScoreScoreData);

        const addtionalScoreScoreTree = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const addtionalScoreScoreTreeLeftOperand = new OperandMaker(`additionalScores["SCORE_TREE"]`, CONSTANTS.FIELD, CONSTANTS.types.OBJECT);
        const addtionalScoreScoreTreeRightOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE_TREE"]`, CONSTANTS.FIELD, CONSTANTS.types.OBJECT);
        addtionalScoreScoreTree.operands.push(addtionalScoreScoreTreeLeftOperand);
        addtionalScoreScoreTree.operands.push(addtionalScoreScoreTreeRightOperand);
        additionalScoreExpression.expressions.push(addtionalScoreScoreTree);

        return additionalScoreExpression;
    }

    public static additionalScoresPopExp() {
        const scoreRuleReassignExp = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);
        const additionalScorePop = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const additionalScorePopLeftOperand = new OperandMaker("tempScoreObj", CONSTANTS.FIELD, CONSTANTS.types.OBJECT);
        const additionalScorePopRightOperand = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, "shift", []);
        const additionalScorePopRightOperand_operand = new OperandMaker(CONSTANTS.loanOutput + "."+ CONSTANTS.ADDITIONAL_SCORECARDS, CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        additionalScorePopRightOperand.operands.push(additionalScorePopRightOperand_operand);
        additionalScorePop.operands.push(additionalScorePopLeftOperand);
        additionalScorePop.operands.push(additionalScorePopRightOperand);
        scoreRuleReassignExp.expressions.push(additionalScorePop);

        const scoreDataExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const scoreDataExpLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"]`, CONSTANTS.FIELD, CONSTANTS.types.OBJECT);
        const scoreDataExpRightOperand = new OperandMaker(`tempScoreObj["SCORE-DATA"]`, CONSTANTS.FIELD, CONSTANTS.types.OBJECT);
        scoreDataExp.operands.push(scoreDataExpLeftOperand);
        scoreDataExp.operands.push(scoreDataExpRightOperand);
        scoreRuleReassignExp.expressions.push(scoreDataExp);

        const scoreTreeExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const scoreTreeExpLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE_TREE"]`, CONSTANTS.FIELD, CONSTANTS.types.OBJECT);
        const scoreTreeExpRightOperand = new OperandMaker(`tempScoreObj["SCORE_TREE"]`, CONSTANTS.FIELD, CONSTANTS.types.OBJECT);
        scoreTreeExp.operands.push(scoreTreeExpLeftOperand);
        scoreTreeExp.operands.push(scoreTreeExpRightOperand);
        scoreRuleReassignExp.expressions.push(scoreTreeExp);

        return scoreRuleReassignExp;
    }
}
