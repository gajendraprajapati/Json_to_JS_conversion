import { PolicyBase } from "../policyBase";
import { IBasePolicy, CreditPolicy } from "../policyModel";
import { EligibilityRuleModel } from "./eligibilityRuleModel";
import { eligibilityAggrigatedValueModel } from "./eligibilityAggrigatedValueModel";
import { ExpressionsMaker, ExpressionMaker, OperandMaker, IFConditionExpressionMaker, OutputAliasMaker } from "../breClass";
import { CONSTANTS } from "../../constants/constants";
import * as OperationsUtil from "../../util/OperationsUtil";
import * as OperandHelper from "../../helper/OperandHelper";
import * as StringUtil from "../../util/StringUtil";
import { CustomField } from "../customFieldModel";

export class EligibilityModel extends PolicyBase implements IBasePolicy {
    public INSTITUTION_ID: number;
    public ElgbltyID: number;
    public name: string;
    public status: string;
    public createdby: string;
    public updatedby: string;
    public createDate: string;
    public AGRTD_VALUES: eligibilityAggrigatedValueModel[];
    public DEC_PRRTY: string[];
    public updateDate: string;
    public RULES: EligibilityRuleModel[];
    public customFields: CustomField;
    constructor(props: EligibilityModel, iffData: any, customFields: CustomField[] ) {
        super(iffData);
        if (!props) {
            return;
        }
        this.INSTITUTION_ID = props.INSTITUTION_ID;
        const { RULES = [] } = props;
        this.ElgbltyID = props.ElgbltyID;
        this.name = props.name;
        this.status = props.status;
        this.createdby = props.createdby;
        this.updatedby = props.updatedby;
        this.createDate = props.createDate;
        this.AGRTD_VALUES = props.AGRTD_VALUES;
        this.DEC_PRRTY = props.DEC_PRRTY;
        this.updateDate = props.updateDate;
        this.RULES = RULES ? RULES.map((x) => { return new EligibilityRuleModel(x, props.name, iffData, customFields) }) : [];
    }

    generate(expFlag?) {
        const expression = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);

        const tempApproveArray = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const tempApproveArrayLeftOperand = new OperandMaker("tempApprovedArray", CONSTANTS.FIELD,"array");
        const tempApproveArrayRightOperand = new OperandMaker([], CONSTANTS.VALUE,"array");
        tempApproveArray.operands.push(tempApproveArrayLeftOperand);
        tempApproveArray.operands.push(tempApproveArrayRightOperand);
        expression.expressions.push(tempApproveArray);

        const tempDeclineArray = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const tempDeclineArrayLeftOperand = new OperandMaker("tempDeclineArray", CONSTANTS.FIELD,"array");
        const tempDeclineArrayRightOperand = new OperandMaker([], CONSTANTS.VALUE,"array");
        tempDeclineArray.operands.push(tempDeclineArrayLeftOperand);
        tempDeclineArray.operands.push(tempDeclineArrayRightOperand);
        expression.expressions.push(tempDeclineArray);

        const tempQueueArray = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const tempQueueArrayLeftOperand = new OperandMaker("tempQueueArray", CONSTANTS.FIELD,"array");
        const tempQueueArrayRightOperand = new OperandMaker([], CONSTANTS.VALUE,"array");
        tempQueueArray.operands.push(tempQueueArrayLeftOperand);
        tempQueueArray.operands.push(tempQueueArrayRightOperand);
        expression.expressions.push(tempQueueArray);

        const defaultEligibility = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const defaultEligibilityLeftOperand = new OperandMaker("defaultEligibility", CONSTANTS.FIELD, CONSTANTS.types.OBJECT);
        const defaultEligibilityRightOperand = new OperandMaker({}, CONSTANTS.VALUE, CONSTANTS.types.OBJECT);
        defaultEligibility.operands.push(defaultEligibilityLeftOperand);
        defaultEligibility.operands.push(defaultEligibilityRightOperand);
        expression.expressions.push(defaultEligibility);

        const defaultEligibilityDecision = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const defaultEligibilityDecisionLeftOperand = new OperandMaker("defaultEligibility.DECISION", CONSTANTS.FIELD, CONSTANTS.types.STRING);
        const defaultEligibilityDecisionRightOperand = new OperandMaker("Queue", CONSTANTS.VALUE, CONSTANTS.types.STRING);
        defaultEligibilityDecision.operands.push(defaultEligibilityDecisionLeftOperand);
        defaultEligibilityDecision.operands.push(defaultEligibilityDecisionRightOperand);
        expression.expressions.push(defaultEligibilityDecision);

        const defaultEligibilityId = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const defaultEligibilityIdLeftOperand = new OperandMaker("defaultEligibility.ElgbltyID", CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        const defaultEligibilityIdRightOperand = new OperandMaker(this.ElgbltyID, CONSTANTS.VALUE, CONSTANTS.types.INTEGER);
        defaultEligibilityId.operands.push(defaultEligibilityIdLeftOperand);
        defaultEligibilityId.operands.push(defaultEligibilityIdRightOperand);
        expression.expressions.push(defaultEligibilityId);

        const defaultEligibilityName = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const defaultEligibilityNameLeftOperand = new OperandMaker("defaultEligibility.ELIGIBILITY_NAME", CONSTANTS.FIELD, CONSTANTS.types.STRING);
        const defaultEligibilityNameRightOperand = new OperandMaker(this.name, CONSTANTS.VALUE, CONSTANTS.types.STRING);
        defaultEligibilityName.operands.push(defaultEligibilityNameLeftOperand);
        defaultEligibilityName.operands.push(defaultEligibilityNameRightOperand);
        expression.expressions.push(defaultEligibilityName);

        const defaultEligibilityRemark = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const defaultEligibilityRemarkLeftOperand = new OperandMaker("defaultEligibility.REMARK", CONSTANTS.FIELD, CONSTANTS.types.STRING);
        const defaultEligibilityRemarkRightOperand = new OperandMaker("No eligibility criteria matched", CONSTANTS.VALUE, CONSTANTS.types.STRING);
        defaultEligibilityRemark.operands.push(defaultEligibilityRemarkLeftOperand);
        defaultEligibilityRemark.operands.push(defaultEligibilityRemarkRightOperand);
        expression.expressions.push(defaultEligibilityRemark);

        const defaultEligibilityApproved = new ExpressionMaker(CONSTANTS.STATEMENT, ">", []);
        const defaultEligibilityApprovedLeftOperand = new OperandMaker(CONSTANTS.DLOAN_AMOUNT, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        const defaultEligibilityApprovedRightOperand = new OperandMaker("0", CONSTANTS.VALUE, CONSTANTS.types.INTEGER);
        defaultEligibilityApproved.operands.push(defaultEligibilityApprovedLeftOperand);
        defaultEligibilityApproved.operands.push(defaultEligibilityApprovedRightOperand);

        const defaultEligibilityApprovedIfCondition = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(defaultEligibilityApprovedLeftOperand, defaultEligibilityApprovedRightOperand), defaultEligibilityApproved);
        const defaultEligibilityApprovedExpression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const approveAmmountExpressionLeftOperand = new OperandMaker("defaultEligibility.APPROVED_AMOUNT", CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        defaultEligibilityApprovedExpression.operands.push(approveAmmountExpressionLeftOperand);
        defaultEligibilityApprovedExpression.operands.push(defaultEligibilityApprovedIfCondition);
        expression.expressions.push(defaultEligibilityApprovedExpression);

        for (let ruleCount = 0; ruleCount < this.RULES.length; ruleCount++) {
            const currentRule = this.RULES[ruleCount];
            if(OperationsUtil.isTradeLevelEligibility(this.INSTITUTION_ID)){
                const eligibilityBaseField = currentRule.getBaseField();

                if(eligibilityBaseField) {
                    expression.expressions.push(currentRule.generateTradeEligibility());
                } else {
                    expression.expressions.push(currentRule.generate());
                }
            } else {
                expression.expressions.push(currentRule.generate());
            }
        }
        const finalEligibilityOutput = this.getFinalEligibilityOutput();
        expression.expressions.push(finalEligibilityOutput);

        const matchEligibilityExpression = new ExpressionMaker(CONSTANTS.STATEMENT,"=", []);
        const matchEligibilityLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}.${CONSTANTS.ELIGIBILITY_RESPONSE}["MATCHED_ELIGIBILITY"]`, CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        const matchEligibilityRightExpression = new ExpressionMaker(CONSTANTS.INTERSECTION_OPERATION, CONSTANTS.operators.CONCAT, []);
        const firstOperand = new OperandMaker("tempApprovedArray", CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        const secondOperand = new OperandMaker("tempDeclineArray", CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        const thirdOperand = new OperandMaker("tempQueueArray", CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        matchEligibilityRightExpression.operands.push(firstOperand);
        matchEligibilityRightExpression.operands.push(secondOperand);
        matchEligibilityRightExpression.operands.push(thirdOperand);
        matchEligibilityExpression.operands.push(matchEligibilityLeftOperand);
        matchEligibilityExpression.operands.push(matchEligibilityRightExpression);
        expression.expressions.push(matchEligibilityExpression);

        const additionalEligibilityPushExp = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION,CONSTANTS.operators.PUSH,[]);
        const pushExpLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}.${CONSTANTS.ADDITIONAL_ELIGIBILITY}`, CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        const pushExpRightOperand = new OperandMaker(`${CONSTANTS.loanOutput}.${CONSTANTS.ELIGIBILITY_RESPONSE}`, CONSTANTS.FIELD,CONSTANTS.types.ARRAY);
        additionalEligibilityPushExp.operands.push(pushExpLeftOperand);
        additionalEligibilityPushExp.operands.push(pushExpRightOperand);
        if(expFlag){
            expression.expressions.push(EligibilityModel.arrayPushExp("additionalApproveArray", "Approved"))
            expression.expressions.push(EligibilityModel.arrayPushExp("additionalDeclineArray", "Declined"))
            expression.expressions.push(EligibilityModel.arrayPushExp("additionalDeclineArray","Queue"))
        }
        return expression;
    }

    private getFinalEligibilityOutput(){
        const eligibilityResponse = new ExpressionMaker(CONSTANTS.STATEMENT,"=",[]);
        const eligibilityResponseLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}.${CONSTANTS.ELIGIBILITY_RESPONSE}`, CONSTANTS.FIELD,"object");
        eligibilityResponse.operands.push(eligibilityResponseLeftOperand);
        const finalExp = new ExpressionsMaker(CONSTANTS.MUTUAL_EXCLUSIVE_EXPRESSIONS,[]);
        const approveStmt = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, "maxBy", []);
        const approveStmtLeftOperand = new OperandMaker("tempApprovedArray", CONSTANTS.FIELD,"array");
        const approveStmtRightOperand = new OperandMaker("obj.ELIGIBILITY_AMOUNT", CONSTANTS.VALUE, CONSTANTS.types.INTEGER);
        approveStmt.operands.push(approveStmtLeftOperand);
        approveStmt.operands.push(approveStmtRightOperand);

        const approvePushStmt = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, "cloneDeep", []);
        approvePushStmt.operands.push(approveStmt);

        const approvedArrayLengthCheckExp = new ExpressionMaker(CONSTANTS.NUMBER_OPERATION, ">", []);
        const approvedArrayLeftOperand = new OperandMaker("tempApprovedArray.length", CONSTANTS.FIELD,"array");
        const approvedArrayRightOperand = new OperandMaker(0,CONSTANTS.VALUE,CONSTANTS.types.INTEGER);
        approvedArrayLengthCheckExp.operands.push(approvedArrayLeftOperand);
        approvedArrayLengthCheckExp.operands.push(approvedArrayRightOperand);

        const approveIfStmt = new IFConditionExpressionMaker(CONSTANTS.IF_COND,new OutputAliasMaker(approvePushStmt,""),approvedArrayLengthCheckExp);

        const queueIfExp = new ExpressionMaker(CONSTANTS.NUMBER_OPERATION, ">",[]);
        const queueIfExpLeftOperand = new OperandMaker("tempQueueArray.length", CONSTANTS.FIELD,"array");
        const queueIfExpRightOperand = new OperandMaker(0,CONSTANTS.VALUE,CONSTANTS.types.INTEGER);
        queueIfExp.operands.push(queueIfExpLeftOperand);
        queueIfExp.operands.push(queueIfExpRightOperand);
        const finalqueue = new OperandMaker("tempQueueArray[0]", CONSTANTS.FIELD,"object");

        const queuePushStmt = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, "cloneDeep", []);
        queuePushStmt.operands.push(finalqueue);
        const queueIfStmt = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(queuePushStmt,""),queueIfExp);

        const declineIfExp = new ExpressionMaker(CONSTANTS.NUMBER_OPERATION, ">",[]);
        const declineIfExpLeftOperand = new OperandMaker("tempDeclineArray.length", CONSTANTS.FIELD,"array");
        const declineIfExpRightOperand = new OperandMaker(0,CONSTANTS.VALUE,CONSTANTS.types.INTEGER);
        declineIfExp.operands.push(declineIfExpLeftOperand);
        declineIfExp.operands.push(declineIfExpRightOperand);
        const finalDecline = new OperandMaker("tempDeclineArray[0]", CONSTANTS.FIELD,"object");

        const declinePushStmt = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, "cloneDeep", []);
        declinePushStmt.operands.push(finalDecline);

        const declineIfStmt = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(declinePushStmt,""),declineIfExp);

        const defaultExpression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const defaultOperand = new OperandMaker(true, CONSTANTS.VALUE, "any");
        defaultExpression.operands.push(defaultOperand);
        let defaultOutputAlias = new OutputAliasMaker(new OperandMaker("defaultEligibility", CONSTANTS.FIELD, CONSTANTS.types.OBJECT), "");
        const defaultEligibility = new IFConditionExpressionMaker(CONSTANTS.IF_COND, defaultOutputAlias, defaultExpression);

        if(!( this.DEC_PRRTY && this.DEC_PRRTY.length>0)){
            this.DEC_PRRTY = [
                "Approved",
                "Queue",
                "Declined"
              ];
        }

        for(let count = 0; count < this.DEC_PRRTY.length;count++){
            if(this.DEC_PRRTY[count] =="Approved"){
                finalExp.expressions.push(approveIfStmt);
            }
            if(this.DEC_PRRTY[count] =="Declined"){
                finalExp.expressions.push(declineIfStmt);
            }
            if(this.DEC_PRRTY[count] =="Queue"){
                finalExp.expressions.push(queueIfStmt);
            }
        }
        finalExp.expressions.push(defaultEligibility);
        eligibilityResponse.operands.push(finalExp);
        return eligibilityResponse;
    }

    private static arrayPushExp(array, decision){
        const pushStmt = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.PUSH, []);
        const arrayPushDetailsStmtLeftOperand = new OperandMaker(array, CONSTANTS.FIELD, "string");
        const arrayPushDetailsStmtRightOperand = new OperandMaker(`${CONSTANTS.loanOutput}.${CONSTANTS.ELIGIBILITY_RESPONSE}`, CONSTANTS.FIELD, "object");
        pushStmt.operands.push(arrayPushDetailsStmtLeftOperand);
        pushStmt.operands.push(arrayPushDetailsStmtRightOperand);
        const expression = new ExpressionMaker(CONSTANTS.STRING_OPERATION, CONSTANTS.operators.EQUAL, []);
        const leftOperand = new OperandMaker(`${CONSTANTS.loanOutput}.${CONSTANTS.ELIGIBILITY_RESPONSE}.DECISION`, CONSTANTS.FIELD,CONSTANTS.types.STRING);
        const rightOperand = new OperandMaker(decision,CONSTANTS.VALUE,CONSTANTS.types.INTEGER);
        expression.operands.push(leftOperand);
        expression.operands.push(rightOperand);
        return new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(pushStmt, ""),expression);
    }

    public static arrayShitOperation(array, operator){
        const eligibilityPopExp = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION,operator,[]);
        const eligibilityPopOperand = new OperandMaker(array, CONSTANTS.FIELD,CONSTANTS.types.ARRAY);
        eligibilityPopExp.operands.push(eligibilityPopOperand);
        return eligibilityPopExp;
    }

    public static additionalIfExpression(array){
        const expression = new ExpressionMaker(CONSTANTS.NUMBER_OPERATION, ">", []);
        const leftOperand = new OperandMaker(`${array}.length`, CONSTANTS.FIELD,CONSTANTS.types.ARRAY);
        const rightOperand = new OperandMaker(0,CONSTANTS.VALUE,CONSTANTS.types.INTEGER);
        expression.operands.push(leftOperand);
        expression.operands.push(rightOperand);
        return expression;
    }

    public static getAdditionalEligibilityExpression(){
        const additionalEligibilityExpressions = new ExpressionsMaker(CONSTANTS.FOR_EACH,[]);

        const additionalApprovedArray = new ExpressionMaker(CONSTANTS.STATEMENT,"=",[]);
        const additionalApproveLeftOperand = new OperandMaker("additionalApproveArray", CONSTANTS.FIELD,CONSTANTS.types.ARRAY);
        const additionalApproveRightOperand = new OperandMaker([],CONSTANTS.VALUE,CONSTANTS.types.ARRAY);
        additionalApprovedArray.operands.push(additionalApproveLeftOperand);
        additionalApprovedArray.operands.push(additionalApproveRightOperand);

        const additionalDeclineArray = new ExpressionMaker(CONSTANTS.STATEMENT,"=",[]);
        const additionalDeclineLeftOperand = new OperandMaker("additionalDeclineArray", CONSTANTS.FIELD,CONSTANTS.types.ARRAY);
        const additionalDeclineRightOperand = new OperandMaker([],CONSTANTS.VALUE,CONSTANTS.types.ARRAY);
        additionalDeclineArray.operands.push(additionalDeclineLeftOperand);
        additionalDeclineArray.operands.push(additionalDeclineRightOperand);

        const additionalQueueArray = new ExpressionMaker(CONSTANTS.STATEMENT,"=",[]);
        const additionalQueueLeftOperand = new OperandMaker("additionalQueueArray", CONSTANTS.FIELD,CONSTANTS.types.ARRAY);
        const additionalQueueRightOperand = new OperandMaker([],CONSTANTS.VALUE,CONSTANTS.types.ARRAY);
        additionalQueueArray.operands.push(additionalQueueLeftOperand);
        additionalQueueArray.operands.push(additionalQueueRightOperand);

        additionalEligibilityExpressions.expressions.push(additionalApprovedArray);
        additionalEligibilityExpressions.expressions.push(additionalDeclineArray);
        additionalEligibilityExpressions.expressions.push(additionalQueueArray);

        return additionalEligibilityExpressions;
    }

    public static getAdditionalEligibilityFinalExp() {
        const finalMutualExclusiveExp = new ExpressionsMaker(CONSTANTS.MUTUAL_EXCLUSIVE_EXPRESSIONS,[]);
        const approveExpression = EligibilityModel.additionalIfExpression("additionalApproveArray");
        const finalEligibilityLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}.${CONSTANTS.ELIGIBILITY_RESPONSE}`, CONSTANTS.FIELD,CONSTANTS.types.OBJECT);
        const finalEligibilityExp = new ExpressionMaker(CONSTANTS.STATEMENT,"=",[]);
        const eligibilityPopExp = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION,"pop",[]);
        const eligibilityPopOperand = new OperandMaker(`additionalApproveArray`, CONSTANTS.FIELD,CONSTANTS.types.ARRAY);
        eligibilityPopExp.operands.push(eligibilityPopOperand);
        finalEligibilityExp.operands.push(finalEligibilityLeftOperand);
        finalEligibilityExp.operands.push(eligibilityPopExp);

        const approveIFStmt = new IFConditionExpressionMaker(CONSTANTS.IF_COND,new OutputAliasMaker(EligibilityModel.arrayShitOperation("additionalApproveArray","pop"),""),approveExpression);
        const declineExoressions = new ExpressionsMaker(CONSTANTS.FOR_EACH,[]);
        const declineExpression = EligibilityModel.additionalIfExpression("additionalDeclineArray");
        const declineOutputExp = new ExpressionMaker(CONSTANTS.STATEMENT,"=",[]);
        const declineOutputAlias = new OperandMaker("additionalDeclineArray[0]", CONSTANTS.FIELD,CONSTANTS.types.ARRAY);
        declineOutputExp.operands.push(finalEligibilityLeftOperand);
        declineOutputExp.operands.push(declineOutputAlias);
        const declineIFstmt = new IFConditionExpressionMaker(CONSTANTS.IF_COND,new OutputAliasMaker(EligibilityModel.arrayShitOperation("additionalDeclineArray","shift"),""),declineExpression);
        const queueExpression = EligibilityModel.additionalIfExpression("additionalQueueArray");
        const queueOutputExp = new ExpressionMaker(CONSTANTS.STATEMENT,"=",[]);
        const queueOutputAlias = new OperandMaker("additionalQueueArray[0]", CONSTANTS.FIELD,CONSTANTS.types.ARRAY);
        queueOutputExp.operands.push(finalEligibilityLeftOperand);
        queueOutputExp.operands.push(queueOutputAlias);
        const queueIFstmt = new IFConditionExpressionMaker(CONSTANTS.IF_COND,new OutputAliasMaker(EligibilityModel.arrayShitOperation("additionalDeclineArray","shift"),""),queueExpression);
        finalMutualExclusiveExp.expressions.push(approveIFStmt);
        finalMutualExclusiveExp.expressions.push(queueIFstmt);
        finalMutualExclusiveExp.expressions.push(declineIFstmt);

        const eligibilityResponseExp = new ExpressionMaker(CONSTANTS.STATEMENT,"=",[]);
        eligibilityResponseExp.operands.push(finalEligibilityLeftOperand);
        eligibilityResponseExp.operands.push(finalMutualExclusiveExp);
        return eligibilityResponseExp;
    }
}