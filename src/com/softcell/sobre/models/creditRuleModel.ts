import { CONSTANTS } from "../constants/constants";
import { ExpressionMaker, ExpressionsMaker, IFConditionExpressionMaker, OperandMaker, OutputAliasMaker } from "./breClass";
import { PolicyBase } from "./policyBase";
import { IBasePolicy } from "./policyModel";
import { RuleList } from "./ruleListModel";
import * as EncDecryptUtil from "../util/EncDecryptUtil";
import {Expression} from "./breModel";
import * as StringUtil from "../util/StringUtil";
import { CustomField } from "./customFieldModel";

export class CreditRule extends PolicyBase implements IBasePolicy {
    public RuleID: string;
    public name: string;
    public type: string;
    public createdby: string;
    public updatedby: string;
    public RuleList: RuleList[];

    constructor(props?: CreditRule, iffData?: any, customFields?: CustomField[]) {
        super(iffData);
        if (!props) {
            return;
        }
        this.RuleID = props.RuleID;
        this.name = props.name;
        this.type = props.type;
        this.createdby = props.createdby;
        this.updatedby = props.updatedby;
        const ruleList = props.RuleList;
        this.RuleList = ruleList.map((x) => new RuleList(x, iffData, customFields));
    }

    public generate( ) {
        return this.generateCreditRule();
    }

    private generateCreditRule() {
        const BREXCreditRule = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);
        const expression = this.constructCreditExp();
        BREXCreditRule.expressions.push(expression);
        this.RuleList.forEach((ruleList: RuleList, index: number) => {
            if(ruleList.ACTIVE) {
                ruleList.generate(BREXCreditRule);
            }
        });
        const decisionExpression = this.constructDecisionExp();
        BREXCreditRule.expressions.push(decisionExpression);
        return BREXCreditRule;
    }

    public generateAdditionalCreditRule() {
        const BREXCreditRule = this.generateCreditRule();
        //generate additional CR    
        const addCreditRule = this.additionalCreditRulePushStmt();
        BREXCreditRule.expressions.push(addCreditRule);
        return BREXCreditRule;
    }

    private constructCreditExp() {

        const expression = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);

        // Decision Object formation. Push this to the main expression `statements` array object
        const responseStmt = CreditRule.createExp(".DECISION_RESPONSE", {}, CONSTANTS.types.OBJECT);
        expression.expressions.push(responseStmt);

        // RuleId Object formation. Push this to the main expression `statements` array object
        const ruleIdStmt = CreditRule.createExp(".DECISION_RESPONSE.RuleID", this.RuleID, CONSTANTS.types.INTEGER);
        expression.expressions.push(ruleIdStmt);

        // Details Object formation. Push this to the main expression `statements` array object
        const detailsStmt = CreditRule.createExp(".DECISION_RESPONSE.Details", [], CONSTANTS.types.ARRAY);
        expression.expressions.push(detailsStmt);

        // Decision Object formation. Push this to the main expression `statements` array object
        const decisionStmt = CreditRule.createExp(".DECISION_RESPONSE.Decision", "", CONSTANTS.types.STRING);
        expression.expressions.push(decisionStmt);

        return expression;
    }

    private static createExp(leftOperand: string, rightOperand: any, operandType: string) {
        const responseStmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const decisionResponseStmtLeftOperand = new OperandMaker(CONSTANTS.loanOutput + leftOperand, CONSTANTS.FIELD, operandType);
        const decisionResponseStmtRightOperand = new OperandMaker(rightOperand, CONSTANTS.VALUE, operandType);
        responseStmt.operands.push(decisionResponseStmtLeftOperand);
        responseStmt.operands.push(decisionResponseStmtRightOperand);
        return responseStmt;
    }

    private constructDecisionExp() {
        const decisionExpression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const leftDecisionOperand = new OperandMaker(CONSTANTS.loanOutput + ".DECISION_RESPONSE.Decision", CONSTANTS.FIELD, CONSTANTS.types.STRING);
        const rightDecisionOperand = new ExpressionsMaker(CONSTANTS.MUTUAL_EXCLUSIVE_EXPRESSIONS, [], EncDecryptUtil.encrypt(this.name), CONSTANTS.RULE_NAME + " - " + this.name, CONSTANTS.CREDIT_RULE);
        decisionExpression.operands.push(leftDecisionOperand);
        decisionExpression.operands.push(rightDecisionOperand);

        // Decision Object formation for declined decision
        const declinedDecisionStmt = this.createArrayDecisionExp(CONSTANTS.operators.SOME, "Declined");
        rightDecisionOperand.expressions.push(declinedDecisionStmt);

        // Decision Object formation for queue decision
        const queueDecisionStmt = this.createArrayDecisionExp(CONSTANTS.operators.SOME, "Queue");
        rightDecisionOperand.expressions.push(queueDecisionStmt);

        // Decision Object formation for approved decision
        const approvedDecisionStmt = this.createArrayDecisionExp(CONSTANTS.operators.SOME, "Approved");
        rightDecisionOperand.expressions.push(approvedDecisionStmt);

        const defaultDecisionStmt = this.createArrayDecisionExp(CONSTANTS.operators.EVERY, " ");
        rightDecisionOperand.expressions.push(defaultDecisionStmt);
        return decisionExpression;
    }

    private additionalCreditRulePushStmt() {
        const stmt = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.PUSH, [], EncDecryptUtil.encrypt(this.name), CONSTANTS.RULE_NAME + " - " + this.name, CONSTANTS.CREDIT_RULE);
        const arrayPushDetailsStmtLeftOperand = new OperandMaker("additionalCreditRule", CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        const arrayPushDetailsStmtRightOperand = new OperandMaker(CONSTANTS.loanOutput + ".DECISION_RESPONSE", CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        stmt.operands.push(arrayPushDetailsStmtLeftOperand);
        stmt.operands.push(arrayPushDetailsStmtRightOperand);
        return stmt;
    }

    private static createAdditionalDecisionExp(decisionConcatExpression:Expression, operator: string, decision: string) {
        let decisionStmt;
        if (!StringUtil.notBlank(decision)) {
            const defaultExpression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
            const defaultOperand = new OperandMaker(true, CONSTANTS.VALUE, CONSTANTS.types.ANY);
            defaultExpression.operands.push(defaultOperand);
            decisionStmt = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(decision, ""), defaultExpression);
        } else {
            const decisionExpressionStmt = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, operator, []);
            decisionStmt = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(decision, ""), decisionExpressionStmt);
            decisionExpressionStmt.operands.push(decisionConcatExpression);
            const decisionExpressionRightExpression = new ExpressionMaker(CONSTANTS.STRING_OPERATION, CONSTANTS.stringOperators.EQUAL, []);
            decisionExpressionStmt.operands.push(decisionExpressionRightExpression);
            const decisionExpressionFirstRightOperand = new OperandMaker("obj", CONSTANTS.FIELD, CONSTANTS.types.STRING);
            const decisionExpressionSecondRightOperand = new OperandMaker(decision, CONSTANTS.VALUE, CONSTANTS.types.STRING);
            decisionExpressionRightExpression.operands.push(decisionExpressionFirstRightOperand);
            decisionExpressionRightExpression.operands.push(decisionExpressionSecondRightOperand);
        }
        return decisionStmt;
    }

    private createArrayDecisionExp(operator: string, decision: string) {
        let decisionStmt;
        if (!StringUtil.notBlank(decision)) {
            const defaultExpression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
            const defaultOperand = new OperandMaker(true, CONSTANTS.VALUE, CONSTANTS.types.ANY);
            defaultExpression.operands.push(defaultOperand);
            decisionStmt = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker("", ""), defaultExpression);
        } else {
            const decisionExpressionStmt = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, operator, [], EncDecryptUtil.encrypt(this.name), CONSTANTS.RULE_NAME + " - " + this.name, CONSTANTS.CREDIT_RULE);
            decisionStmt = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(decision, ""), decisionExpressionStmt , this.RuleID, this.name, CONSTANTS.CREDIT_RULE);
            const decisionStmtLeftOperand = new OperandMaker(CONSTANTS.loanOutput + ".DECISION_RESPONSE.Details", CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
            const decisionStmtMiddleOperand = new OperandMaker("obj.Outcome", CONSTANTS.FIELD, CONSTANTS.types.STRING);
            const decisionStmtRightOperand = new OperandMaker(decision, CONSTANTS.VALUE, CONSTANTS.types.STRING);
            decisionExpressionStmt.operands.push(decisionStmtLeftOperand);
            decisionExpressionStmt.operands.push(decisionStmtMiddleOperand);
            decisionExpressionStmt.operands.push(decisionStmtRightOperand);
        }
        return decisionStmt;
    }

    public static generateMultiCreditRuleDecision() {
        const BREXJson = [];
        const multiCRDecisionStmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const multiCRDecisionLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}.DECISION_RESPONSE.Decision`, CONSTANTS.FIELD, CONSTANTS.types.STRING);
        const multiCRDecisionRightExpression = new ExpressionsMaker(CONSTANTS.MUTUAL_EXCLUSIVE_EXPRESSIONS, []);
        multiCRDecisionStmt.operands.push(multiCRDecisionLeftOperand);
        multiCRDecisionStmt.operands.push(multiCRDecisionRightExpression);

        const decisionConcatExpression = new ExpressionMaker(CONSTANTS.INTERSECTION_OPERATION, CONSTANTS.operators.CONCAT, []);
        const decisionConcatFirstOperand = new OperandMaker(`${CONSTANTS.loanOutput}.DECISION_RESPONSE.Decision`, CONSTANTS.FIELD, CONSTANTS.types.STRING);
        decisionConcatExpression.operands.push(decisionConcatFirstOperand);
        const decisionConcatSecondExpression = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.MAP, []);
        decisionConcatExpression.operands.push(decisionConcatSecondExpression);
        const decisionConcatSecondLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}.ADDITIONAL_CREDITRULES`, CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        const decisionConcatSecondRightOperand = new OperandMaker(`obj.Decision`, CONSTANTS.FIELD, CONSTANTS.types.STRING);
        decisionConcatSecondExpression.operands.push(decisionConcatSecondLeftOperand);
        decisionConcatSecondExpression.operands.push(decisionConcatSecondRightOperand);

        const decisionDeclinedStmt = CreditRule.createAdditionalDecisionExp(decisionConcatExpression, CONSTANTS.operators.SOME, "Declined");
        const decisionQueueStmt = CreditRule.createAdditionalDecisionExp(decisionConcatExpression, CONSTANTS.operators.SOME, "Queue");
        const decisionApprovedStmt = CreditRule.createAdditionalDecisionExp(decisionConcatExpression, CONSTANTS.operators.SOME, "Approved");
        const decisionDefaultStmt = CreditRule.createAdditionalDecisionExp(decisionConcatExpression, CONSTANTS.operators.SOME, " ");

        multiCRDecisionRightExpression.expressions.push(decisionDeclinedStmt);
        multiCRDecisionRightExpression.expressions.push(decisionQueueStmt);
        multiCRDecisionRightExpression.expressions.push(decisionApprovedStmt);
        multiCRDecisionRightExpression.expressions.push(decisionDefaultStmt);

        return multiCRDecisionStmt;
    }

    public static generateFinalDecision() {
        const BREXJson = [];
        const finalResponse = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const finalResponseLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}.DECISION_RESPONSE.Decision`, CONSTANTS.FIELD, CONSTANTS.types.STRING);
        const finalResponseRightOperand = new ExpressionsMaker(CONSTANTS.MUTUAL_EXCLUSIVE_EXPRESSIONS, []);
        finalResponse.operands.push(finalResponseLeftOperand);
        finalResponse.operands.push(finalResponseRightOperand);

        const finalResponseRightExpression = new ExpressionMaker(CONSTANTS.STRING_OPERATION, CONSTANTS.FINAL_DECISION, []);
        const finalResponseRightExpressionLeft = new OperandMaker(`${CONSTANTS.loanOutput}.DECISION_RESPONSE.Decision`, CONSTANTS.FIELD, CONSTANTS.types.STRING);
        const finalResponseRightExpressionRight = new OperandMaker(`${CONSTANTS.loanOutput}.ELIGIBILITY_RESPONSE.DECISION`, CONSTANTS.FIELD, CONSTANTS.types.STRING);
        finalResponseRightExpression.operands.push(finalResponseRightExpressionLeft);
        finalResponseRightExpression.operands.push(finalResponseRightExpressionRight);

        const conditionMaker = new ExpressionMaker(CONSTANTS.STATEMENT, "&&", []);
        const creditRuleNotNullMaker = new ExpressionMaker(CONSTANTS.STATEMENT, "!=", []);
        const creditRuleNotNullLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}.DECISION_RESPONSE`, CONSTANTS.FIELD, CONSTANTS.types.OBJECT);
        const creditRuleNotNullRightOperand = new OperandMaker("null", CONSTANTS.VALUE, CONSTANTS.types.OBJECT);
        creditRuleNotNullMaker.operands.push(creditRuleNotNullLeftOperand);
        creditRuleNotNullMaker.operands.push(creditRuleNotNullRightOperand);
        const eligibilityNotNullMaker = new ExpressionMaker(CONSTANTS.STATEMENT, "!=", []);
        const eligibilityNotNullLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}.ELIGIBILITY_RESPONSE`, CONSTANTS.FIELD, CONSTANTS.types.OBJECT);
        const eligibilityNotNullRightOperand = new OperandMaker("null", CONSTANTS.VALUE, CONSTANTS.types.OBJECT);
        eligibilityNotNullMaker.operands.push(eligibilityNotNullLeftOperand);
        eligibilityNotNullMaker.operands.push(eligibilityNotNullRightOperand);

        conditionMaker.operands.push(creditRuleNotNullMaker);
        conditionMaker.operands.push(eligibilityNotNullMaker);
        const finalResponseIf1 = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(finalResponseRightExpression, ""), conditionMaker);
        finalResponseRightOperand.expressions.push(finalResponseIf1);

        const conditionDecision = new ExpressionMaker(CONSTANTS.STRING_OPERATION, CONSTANTS.stringOperators.NOT_EQUAL, []);
        conditionDecision.operands.push(finalResponseLeftOperand);
        conditionDecision.operands.push(new OperandMaker("", CONSTANTS.VALUE, CONSTANTS.types.STRING));
        const finalResponseIf2 = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(finalResponseLeftOperand, ""), conditionDecision);
        finalResponseRightOperand.expressions.push(finalResponseIf2);

        const defaultExpression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const defaultOperand = new OperandMaker(true, CONSTANTS.VALUE, CONSTANTS.types.ANY);
        defaultExpression.operands.push(defaultOperand);
        const finalResponseIf3 = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker("Queue", ""), defaultExpression);
        finalResponseRightOperand.expressions.push(finalResponseIf3);

        return finalResponse
    }

    public static getAdditionalRule() {
        const expression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const leftOperand = new OperandMaker("additionalCreditRule", CONSTANTS.FIELD, CONSTANTS.types.OBJECT);
        const rightOperand = new OperandMaker([], CONSTANTS.VALUE, CONSTANTS.types.OBJECT);
        expression.operands.push(leftOperand);
        expression.operands.push(rightOperand);
        return expression;
    }

    public static getAdditionalCreditRule(expression: ExpressionsMaker) {
        const additionalCreditRuleExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const leftOperand = new OperandMaker(CONSTANTS.loanOutput + ".ADDITIONAL_CREDITRULES", CONSTANTS.FIELD, CONSTANTS.types.OBJECT);
        const rightOperand = new OperandMaker("additionalCreditRule", CONSTANTS.FIELD, CONSTANTS.types.OBJECT);
        additionalCreditRuleExp.operands.push(leftOperand);
        additionalCreditRuleExp.operands.push(rightOperand);
        return additionalCreditRuleExp;
    }
}
