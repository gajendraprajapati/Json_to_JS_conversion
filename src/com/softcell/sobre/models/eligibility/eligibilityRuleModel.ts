import { PolicyBase } from "../policyBase";

import { IBasePolicy } from "../policyModel";
import { EligibilityOutcomeModel } from "./eligibilityOutcomeModel";
import { EligibilityConditionModel } from "./eligibilityConditionModel";
import { OutputAliasMaker, ExpressionMaker, ExpressionsMaker, OperandMaker, IFConditionExpressionMaker } from "../breClass";
import * as OperationsUtil from "../../util/OperationsUtil";
import * as IFFhelper from "../../helper/IFFHelper";
import { CONSTANTS } from "../../constants/constants";
import { CustomField } from "../customFieldModel";
import * as _ from "lodash";
import { getAllDependentCustomFields } from "../../../../../generatePolicyProd";
import * as OperandHelper from "../../helper/OperandHelper";
import * as IFFHelper from "../../helper/IFFHelper";
import * as StringUtil from "../../util/StringUtil";


export class EligibilityRuleModel extends PolicyBase implements IBasePolicy{
    public ElgbltyID: number;
    public name: string;
    public Condition: EligibilityConditionModel[];
    public Outcome: EligibilityOutcomeModel;
    public GridID: number;
    public INSTITUTION_ID: number;
    public createdby: string;
    public createDate: string;
    public ACTIVE: boolean;
    public updateDate: string;
    public updatedby: string;
    public expressionTree: ExpressionMaker;
    public outerOperands: ExpressionMaker[];
    public  customFields : CustomField[];
    public baseField : string;

    constructor(props: EligibilityRuleModel,name : any, iffData: any, customFields : CustomField[]) {
        super(iffData);
        if (!props) {
            return;
        }
        const {Condition = []} = props;
        this.ElgbltyID = props.ElgbltyID;
        this.name = name;
        this.Condition = Condition ? props.Condition.map((x)=>{return new EligibilityConditionModel(x,iffData,customFields)}) : [];
        this.Outcome = props.Outcome;
        this.GridID = props.GridID;
        this.INSTITUTION_ID = props.INSTITUTION_ID;
        this.createdby = props.createdby;
        this.createDate = props.createDate;
        this.ACTIVE = props.ACTIVE;
        this.updateDate = props.updateDate;
        this.updatedby = props.updatedby;
        this.outerOperands = [];
        this.customFields = customFields;
        this.expressionTree = {} as ExpressionMaker
    }

    public generate(){
        let expression = this.constructExpression();

        for(let conditionCout = 0; conditionCout< this.Condition.length; conditionCout ++){
            const currentCondition = this.Condition[conditionCout];
            if (conditionCout == 0) {
               this.expressionTree.operator = currentCondition.outOperator;
            }
            const outerOperand = currentCondition.generate();
            this.outerOperands.push(outerOperand);
        }

        if (this.Condition.length == 1) {
            const { operator, template, operands } = this.outerOperands[0] || {} as ExpressionMaker;
            this.expressionTree.operator = operator;
            this.expressionTree.template = template;
            this.expressionTree.operands = operands;
        }
        return expression;
    }

    private constructExpression(isTrade = false){
        const eligibilityRuleExpressions = new ExpressionsMaker(CONSTANTS.FOR_EACH,[]);
        const gridIdExp = EligibilityRuleModel.generateExp(`outputObjIterator.GridID`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER,
                            this.GridID, CONSTANTS.VALUE, CONSTANTS.types.INTEGER);
        const computeDispExpression = EligibilityRuleModel.generateExp(`outputObjIterator.COMPUTE_DISP`,CONSTANTS.FIELD, CONSTANTS.types.STRING,
                                        this.Outcome.COMPUTE_DISP, CONSTANTS.VALUE, CONSTANTS.types.STRING);
        const computeLogicExpression =  EligibilityRuleModel.generateExp(`outputObjIterator.COMPUTE_LOGIC`, CONSTANTS.FIELD, CONSTANTS.types.STRING,
                                            this.Outcome.COMPUTE_LOGIC, CONSTANTS.VALUE, CONSTANTS.types.STRING);
        const remarkExpression = EligibilityRuleModel.generateExp(`outputObjIterator.REMARK`, CONSTANTS.FIELD, CONSTANTS.types.STRING,
                                    this.Outcome.REMARK, CONSTANTS.VALUE, CONSTANTS.types.STRING);
        const eligibilityNameExpression =  EligibilityRuleModel.generateExp(`outputObjIterator.ELIGIBILITY_NAME`, CONSTANTS.FIELD, CONSTANTS.types.STRING,
            this.name, CONSTANTS.VALUE, CONSTANTS.types.STRING);
        const eligibilityIdExpression = EligibilityRuleModel.generateExp(`outputObjIterator.ElgbltyID`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER,
            this.ElgbltyID, CONSTANTS.VALUE, CONSTANTS.types.INTEGER);

        const additionalFieldsExpression = new ExpressionMaker(CONSTANTS.STATEMENT, "=",[]);
        const additionalFieldsExpressionLeftOperand = new OperandMaker(`outputObjIterator.ADDITIONAL_FIELDS`, CONSTANTS.FIELD, "object");
        let addFieldOperand = {};

        if(this.Outcome &&  this.Outcome.DECISION && this.Outcome.DECISION.toUpperCase() == "APPROVED"){
            addFieldOperand = this.getEligibilityRange();

            if(addFieldOperand["MAX"]) {
                const maxAmountExpression = new ExpressionMaker(CONSTANTS.STATEMENT, "=",[]);
                const maxAmountLeftOperand = new OperandMaker(`outputObjIterator.MAX_AMOUNT`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
                const maxAmountRightOperand = new OperandMaker(addFieldOperand["MAX"], CONSTANTS.VALUE, CONSTANTS.types.INTEGER);
                maxAmountExpression.operands.push(maxAmountLeftOperand);
                maxAmountExpression.operands.push(maxAmountRightOperand);
                eligibilityRuleExpressions.expressions.push(maxAmountExpression);
            }

            if(addFieldOperand["MIN"]) {
                const minAmountExpression = new ExpressionMaker(CONSTANTS.STATEMENT, "=",[]);
                const minAmountLeftOperand = new OperandMaker(`outputObjIterator.MIN_AMOUNT`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
                const minAmountRightOperand = new OperandMaker(addFieldOperand["MIN"], CONSTANTS.VALUE, CONSTANTS.types.INTEGER);
                minAmountExpression.operands.push(minAmountLeftOperand);
                minAmountExpression.operands.push(minAmountRightOperand);
                eligibilityRuleExpressions.expressions.push(minAmountExpression);
            }

            if(addFieldOperand["TENOR"]) {
                const maxTenorExpression = new ExpressionMaker(CONSTANTS.STATEMENT, "=",[]);
                const maxTenorLeftOperand = new OperandMaker(`outputObjIterator.MAX_TENOR`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
                const maxTenorRightOperand = new OperandMaker(addFieldOperand["TENOR"], CONSTANTS.VALUE, CONSTANTS.types.INTEGER);
                maxTenorExpression.operands.push(maxTenorLeftOperand);
                maxTenorExpression.operands.push(maxTenorRightOperand);
                eligibilityRuleExpressions.expressions.push(maxTenorExpression);
            }
        }

        const additionalFieldsExpressionRightOperand = new OperandMaker(addFieldOperand, CONSTANTS.VALUE, "object");
        additionalFieldsExpression.operands.push(additionalFieldsExpressionLeftOperand);
        additionalFieldsExpression.operands.push(additionalFieldsExpressionRightOperand);

        const decisionStmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const decisionStmtLeftOperand = new OperandMaker("outputObjIterator.DECISION", CONSTANTS.FIELD, CONSTANTS.types.STRING);
        decisionStmt.operands.push(decisionStmtLeftOperand);
        this.expressionTree = new ExpressionMaker(CONSTANTS.STATEMENT, "", this.outerOperands);
        if(isTrade) {
            const decisionStmtTradeOperand = new OperandMaker(this.Outcome.DECISION,CONSTANTS.VALUE,CONSTANTS.types.STRING);
            decisionStmt.operands.push(decisionStmtTradeOperand)
        } else {
            const decisionStmtRightStmtOperand = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(this.Outcome.DECISION, " "), this.expressionTree);
            decisionStmt.operands.push(decisionStmtRightStmtOperand);
        }

        // const condPushStmt = this.arrayPushStmtBasedOnDecision();
        const approvePushStmt = EligibilityRuleModel.arrayPushExp("tempApprovedArray","Approved");
        const queuePushStmt = EligibilityRuleModel.arrayPushExp("tempQueueArray", "Queue");
        const decliinePushStmt = EligibilityRuleModel.arrayPushExp("tempDeclineArray","Declined");

        const conditonalPushStmt = new ExpressionMaker(CONSTANTS.STRING_OPERATION, CONSTANTS.stringOperators.NOT_EQUAL,[]);
        const conditionalPushStmtLeftOperand = new OperandMaker("outputObjIterator.DECISION", CONSTANTS.FIELD,CONSTANTS.types.STRING);
        const conditionalPushStmtRightOperand = new OperandMaker(" ",CONSTANTS.VALUE,  CONSTANTS.types.STRING );
        conditonalPushStmt.operands.push(conditionalPushStmtLeftOperand);
        conditonalPushStmt.operands.push(conditionalPushStmtRightOperand);

        let computeFlag = false;
        let computedAmmoutField = "";
        if(this.Outcome && this.Outcome.DECISION && this.Outcome.DECISION.toUpperCase() == "APPROVED" ){
            computeFlag = true;
            computedAmmoutField = OperationsUtil.computeLogicBasedOnFields(this.Outcome.COMPUTE_LOGIC, this.iffData, isTrade);
        }
        const computedAmountExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=",[]);
        const computedAmountExpLeftOperand = new OperandMaker(`outputObjIterator.COMPUTED_AMOUNT`, CONSTANTS.FIELD,CONSTANTS.types.INTEGER);
        let computedAmountExpRightOperand;
        if(StringUtil.notBlank(computedAmmoutField)) {
            computedAmountExpRightOperand = new OperandMaker(computedAmmoutField, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        } else {
            computedAmountExpRightOperand = new OperandMaker(0, CONSTANTS.VALUE, CONSTANTS.types.INTEGER);
        }

        computedAmountExp.operands.push(computedAmountExpLeftOperand);
        computedAmountExp.operands.push(computedAmountExpRightOperand);
        
        const eligibilityAmt = computeFlag && this.computeEligibilityAmtExpression();

        const loanAmtStmt = new ExpressionMaker(CONSTANTS.STATEMENT, ">", []);
        const loanAmtStmtLeftOperand = new OperandMaker(CONSTANTS.DLOAN_AMOUNT, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        const loanAmtStmtRightOperand = new OperandMaker(0, CONSTANTS.VALUE,CONSTANTS.types.INTEGER);
        loanAmtStmt.operands.push(loanAmtStmtLeftOperand);
        loanAmtStmt.operands.push(loanAmtStmtRightOperand);

        const approvedAmtStmt = new ExpressionMaker(CONSTANTS.STATEMENT, ">", []);
        const approvedAmtStmtLeftOperand = new OperandMaker(CONSTANTS.DLOAN_AMOUNT, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        const approvedAmtStmtRightOperand = new OperandMaker("outputObjIterator.ELIGIBILITY_AMOUNT", CONSTANTS.FIELD,CONSTANTS.types.INTEGER);
        approvedAmtStmt.operands.push(approvedAmtStmtLeftOperand);
        approvedAmtStmt.operands.push(approvedAmtStmtRightOperand);

        const outputOperandTrueCase = new OperandMaker("outputObjIterator.ELIGIBILITY_AMOUNT", CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        const outputOperandFalseCase = new OperandMaker(CONSTANTS.DLOAN_AMOUNT, CONSTANTS.FIELD,CONSTANTS.types.INTEGER);
        const approvedAmtIfCond = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(outputOperandTrueCase,outputOperandFalseCase),approvedAmtStmt);
        const approvedAmtIfCondition = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(approvedAmtIfCond, approvedAmtStmtRightOperand), loanAmtStmt);

        const approveAmmountExpression = new ExpressionMaker(CONSTANTS.STATEMENT,"=", []);
        const approveAmmountExpressionLeftOperand = new OperandMaker("outputObjIterator.APPROVED_AMOUNT", CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
        approveAmmountExpression.operands.push(approveAmmountExpressionLeftOperand);
        approveAmmountExpression.operands.push(approvedAmtIfCondition);

        const valueObjExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=",[]);
        const valueObjExpLeftOperand = new OperandMaker("outputObjIterator.VALUES", CONSTANTS.FIELD,"object");
        const valueObjExpRigltOperand = new OperandMaker({}, CONSTANTS.VALUE,"object");
        valueObjExp.operands.push(valueObjExpLeftOperand);
        valueObjExp.operands.push(valueObjExpRigltOperand);
        eligibilityRuleExpressions.expressions.push(valueObjExp);

        this.Condition.forEach((elem)=>{
            eligibilityRuleExpressions.expressions.push(...elem.generateValues());
        });
        eligibilityRuleExpressions.expressions.push(this.getExp());
        eligibilityRuleExpressions.expressions.push(gridIdExp);
        eligibilityRuleExpressions.expressions.push(computeDispExpression);
        eligibilityRuleExpressions.expressions.push(computeLogicExpression);
        eligibilityRuleExpressions.expressions.push(remarkExpression);
        eligibilityRuleExpressions.expressions.push(eligibilityIdExpression);
        eligibilityRuleExpressions.expressions.push(eligibilityNameExpression);
        eligibilityRuleExpressions.expressions.push(additionalFieldsExpression);
        eligibilityRuleExpressions.expressions.push(decisionStmt);
        computeFlag && eligibilityRuleExpressions.expressions.push(computedAmountExp);
        computeFlag && eligibilityRuleExpressions.expressions.push(eligibilityAmt);
        eligibilityRuleExpressions.expressions.push(approveAmmountExpression);
        eligibilityRuleExpressions.expressions.push(approvePushStmt);
        eligibilityRuleExpressions.expressions.push(queuePushStmt);
        eligibilityRuleExpressions.expressions.push(decliinePushStmt);

        return eligibilityRuleExpressions;
    }

    private getEligibilityRange(){
        const rangeArr = this.Outcome.ADDITIONAL_FIELDS;
        const result = {};
        for(let rangeCount = 0; rangeCount<rangeArr.length;rangeCount++){
            const curObj = rangeArr[rangeCount];
            if(curObj.name == "MAX") {
                result["MAX"] = curObj.value;
            } else if(curObj.name == "MIN") {
                result["MIN"] = curObj.value;
            } else {
                result[curObj.name] = curObj.value;
            }
        }
        return result;
    }

    private static generateExp(operand1, operandType1, dataType1, operand2, operandType2, dataType2){
        const expression = new ExpressionMaker(CONSTANTS.STATEMENT, "=",[]);
        const leftOperand = new OperandMaker(operand1,operandType1, dataType1);
        const rightOperand = new OperandMaker(operand2,operandType2, dataType2);
        expression.operands.push(leftOperand);
        expression.operands.push(rightOperand);
        return expression;
    }

    private computeEligibilityAmtExpression(){
        const eligibilityAmtMutualyExclusiveStmt = new ExpressionsMaker(CONSTANTS.MUTUAL_EXCLUSIVE_EXPRESSIONS,[]);

        const eligibilityAmtRange = this.getEligibilityRange();

        if(eligibilityAmtRange["MAX"] && eligibilityAmtRange["MIN"]) {
            const eligibilityAmtMaxExp = new ExpressionMaker(CONSTANTS.STATEMENT, ">=",[]);
            const eligibilityAmtMaxLeftOperand = new OperandMaker(`outputObjIterator.COMPUTED_AMOUNT`,CONSTANTS.FIELD,CONSTANTS.types.INTEGER );
            const eligibilityAmtMaxRightOperand = new OperandMaker(eligibilityAmtRange["MAX"], CONSTANTS.VALUE, CONSTANTS.types.INTEGER);
            eligibilityAmtMaxExp.operands.push(eligibilityAmtMaxLeftOperand);
            eligibilityAmtMaxExp.operands.push(eligibilityAmtMaxRightOperand);
            const maxOperand = new OperandMaker(eligibilityAmtRange["MAX"], CONSTANTS.VALUE, CONSTANTS.types.INTEGER);
            const eligibilityAmtMax = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(maxOperand, 0),eligibilityAmtMaxExp);

            const eligibilityMinAmt = new ExpressionMaker(CONSTANTS.STATEMENT,"<=",[]);
            const eligibilityMinAmtLeftOperand = new OperandMaker(`outputObjIterator.COMPUTED_AMOUNT`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
            const eligibilityMinAmtRightOperand = new OperandMaker(eligibilityAmtRange["MIN"], CONSTANTS.VALUE,CONSTANTS.types.INTEGER);
            eligibilityMinAmt.operands.push(eligibilityMinAmtLeftOperand);
            eligibilityMinAmt.operands.push(eligibilityMinAmtRightOperand);
            const minOperand = new OperandMaker(eligibilityAmtRange["MIN"], CONSTANTS.VALUE, CONSTANTS.types.INTEGER);
            const eligibilityAmtMin = new IFConditionExpressionMaker(CONSTANTS.IF_COND,new OutputAliasMaker(minOperand, ""),eligibilityMinAmt );

            eligibilityAmtMutualyExclusiveStmt.expressions.push(eligibilityAmtMax);
            eligibilityAmtMutualyExclusiveStmt.expressions.push(eligibilityAmtMin);
        }

        const eligibilityDefaultExpression = new ExpressionMaker(CONSTANTS.STATEMENT, "=",[]);
        const eligibilityAmtDefaultOperand = new OperandMaker(true, CONSTANTS.VALUE,CONSTANTS.types.BOOLEAN);
        eligibilityDefaultExpression.operands.push(eligibilityAmtDefaultOperand);
        const defaultIFCondStmt = new IFConditionExpressionMaker(CONSTANTS.IF_COND,new OutputAliasMaker(new OperandMaker("outputObjIterator.COMPUTED_AMOUNT",CONSTANTS.FIELD,CONSTANTS.types.INTEGER), ""),eligibilityDefaultExpression);
        eligibilityAmtMutualyExclusiveStmt.expressions.push(defaultIFCondStmt);

        const finalEligibilityExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const leftOperand = new OperandMaker("outputObjIterator.ELIGIBILITY_AMOUNT", CONSTANTS.FIELD,CONSTANTS.types.INTEGER);
        finalEligibilityExp.operands.push(leftOperand);
        finalEligibilityExp.operands.push(eligibilityAmtMutualyExclusiveStmt);

        return finalEligibilityExp;
    }

    private static arrayPushStmtBasedOnDecision(){
        const mutualExclPushStmt = new ExpressionsMaker(CONSTANTS.FOR_EACH,[]);

        const approvePushStmt = EligibilityRuleModel.arrayPushExp("tempApprovedArray","Approved");
        const decliinePushStmt = EligibilityRuleModel.arrayPushExp("tempDeclineArray","Declined");
        const queuePushStmt = EligibilityRuleModel.arrayPushExp("tempQueueArray", "Queue");

        mutualExclPushStmt.expressions.push(approvePushStmt);
        mutualExclPushStmt.expressions.push(decliinePushStmt);
        mutualExclPushStmt.expressions.push(queuePushStmt);
        return mutualExclPushStmt;
    }

    private static arrayPushExp(array, decision){
        const pushStmt = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.PUSH, []);
        const arrayPushDetailsStmtLeftOperand = new OperandMaker(`${array}`, CONSTANTS.FIELD, "string");
        const arrayPushDetailsStmtRightOperand = new OperandMaker("outputObjIterator", CONSTANTS.FIELD, "object");
        pushStmt.operands.push(arrayPushDetailsStmtLeftOperand);
        pushStmt.operands.push(arrayPushDetailsStmtRightOperand);
        const conditonalPushStmt = new ExpressionMaker(CONSTANTS.STRING_OPERATION, CONSTANTS.stringOperators.EQUAL,[]);
        const conditionalPushStmtLeftOperand = new OperandMaker("outputObjIterator.DECISION", CONSTANTS.FIELD,CONSTANTS.types.STRING);
        const conditionalPushStmtRightOperand = new OperandMaker(decision,CONSTANTS.VALUE,  CONSTANTS.types.STRING );
        conditonalPushStmt.operands.push(conditionalPushStmtLeftOperand);
        conditonalPushStmt.operands.push(conditionalPushStmtRightOperand);
        return new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(pushStmt, ""),conditonalPushStmt);
    }

    public generateTradeEligibility(){
        const tradeExpression = new ExpressionsMaker(CONSTANTS.FOR_EACH,[]);
        const eligibilityBaseField = this.getBaseField();
        const outputCustomFieldss = this.getCustomFieldFromOutcome();
        tradeExpression.expressions.push(...outputCustomFieldss);
        for(let conditionCout = 0; conditionCout< this.Condition.length; conditionCout ++){
            const currentCondition = this.Condition[conditionCout];
            let split = currentCondition.fieldname.split("$");
            let customFieldAsGlobal;
            if(split[0] == CONSTANTS.CUSTOM_FIELDS){
                customFieldAsGlobal = OperandHelper.getAllDepedentCustonFieldsAsTrade(currentCondition.fieldname,  this.customFields, this.iffData);
            }

            tradeExpression.expressions.push(customFieldAsGlobal);

            for(let refCount =0;refCount <currentCondition.ref.length; refCount++){
                const currentRef = currentCondition.ref[refCount];
                let split = currentRef.fieldname.split("$");
                let customFieldAsGlobalRef;
                if(split[0] == CONSTANTS.CUSTOM_FIELDS){
                    customFieldAsGlobalRef = OperandHelper.getAllDepedentCustonFieldsAsTrade(currentRef.fieldname,  this.customFields, this.iffData);
                }
                tradeExpression.expressions.push(customFieldAsGlobalRef);
            }
            if (conditionCout == 0) {
               this.expressionTree.operator = currentCondition.outOperator;
            }
            const outerOperand = currentCondition.generateTradeEligibility(eligibilityBaseField);
            this.outerOperands.push(outerOperand);
        }
        if (this.Condition.length == 1) {
            const { operator, template, operands } = this.outerOperands[0] || {} as ExpressionMaker;
            this.expressionTree.operator = operator;
            this.expressionTree.template = template;
            this.expressionTree.operands = operands;
        }
        tradeExpression.expressions.push(this.tradeLevelExpression());
        
        return tradeExpression;
    }

    private tradeLevelExpression(){
        const ifExpression = new ExpressionMaker(CONSTANTS.NUMBER_OPERATION,"<",[]);
        const globalFieldName =  CONSTANTS.GLOBAL_VAR + "." + "tradeEligibility" + ifExpression.UUID;
        const eligibilityRuleExpressions = this.constructExpression(true);
        const matchedEligibility = new ExpressionMaker(CONSTANTS.STATEMENT,"=",[]);
        const matchedEligibilityLeftOperand = new OperandMaker(`matched`, CONSTANTS.FIELD,"array");
        const matchedEligibilityRightOperand = new ExpressionsMaker(CONSTANTS.MUTUAL_EXCLUSIVE_EXPRESSIONS,[]);
        const outPutAliasOperand = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION,CONSTANTS.operators.PUSH,[]);
        const outPutAliasOperandLeft = new OperandMaker(`match`, CONSTANTS.FIELD,"array");
        const outPutAliasOperandRight = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.MAP,[]);
        const outPutAliasOperandRight_left = new OperandMaker(globalFieldName, CONSTANTS.FIELD,"array");
        const outPutAliasOperandRight_right = eligibilityRuleExpressions;
        outPutAliasOperandRight.operands.push(outPutAliasOperandRight_left);
        outPutAliasOperandRight.operands.push(outPutAliasOperandRight_right);
        outPutAliasOperand.operands.push(outPutAliasOperandLeft);
        outPutAliasOperand.operands.push(outPutAliasOperandRight);

        const ifCondOutputAlias = new OutputAliasMaker(outPutAliasOperand,"");

      
        const ifExpressionLeftOperand = new OperandMaker(0, CONSTANTS.VALUE,CONSTANTS.types.INTEGER);
        const ifExpressionRightOperand = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.SIZE,[]);
        const ifExpressionRightOperand_LeftOperand = new ExpressionMaker(CONSTANTS.ASSIGN_AND_RETURN,"=",[]);

        const innerLeftOperand = new OperandMaker(globalFieldName, CONSTANTS.FIELD, "array");
        const innerRightOperand = new ExpressionMaker(CONSTANTS.INTERSECTION_OPERATION, CONSTANTS.operators.INTERSECTION,[]);
        const leftIntersectionOperand = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION,CONSTANTS.operators.FILTER,[]);

        const leftOperand = new OperandMaker(this.getBaseField(), CONSTANTS.FIELD,"array");
        this.expressionTree = new ExpressionMaker(CONSTANTS.STATEMENT, this.Condition[0].outOperator, this.outerOperands);
        leftIntersectionOperand.operands.push(leftOperand);
        leftIntersectionOperand.operands.push(this.expressionTree);
        innerRightOperand.operands.push(leftIntersectionOperand);
        ifExpressionRightOperand_LeftOperand.operands.push(innerLeftOperand);
        ifExpressionRightOperand_LeftOperand.operands.push(innerRightOperand);
        ifExpressionRightOperand.operands.push(ifExpressionRightOperand_LeftOperand);
        ifExpression.operands.push(ifExpressionLeftOperand);
        ifExpression.operands.push(ifExpressionRightOperand);

        return new IFConditionExpressionMaker(CONSTANTS.IF_COND,ifCondOutputAlias,ifExpression);
    }

    public getBaseField(){
        const eligibilityTradeFields:any = ["CIBIL_RESPONSE$accountList", "EXPERIAN_RESPONSE$caisAccount$caisAccountDetails", "HIGHMARK_RESPONSE$baseReports$baseReport$accountList", "MERGED_RESPONSE$activeTradelines"];

        for(let i = 0; i <this.Condition.length; i ++) {
            const condition = this.Condition[i];
            const baseField = OperandHelper.summaryLevelBaseField(condition.fieldname, condition.FType, this.customFields, this.iffData);
            const split = IFFHelper.splitIffField(baseField, "$");

            if(eligibilityTradeFields.includes(split[0])){
                const arrayBaseField = OperationsUtil.getFieldBasedOnStructure(CONSTANTS.IFF_STRUCTURE, baseField,"");
                const split = IFFHelper.splitIffField(arrayBaseField, ".");
                return split[0]
            }

            for (let j =0; j< condition.ref.length; j++) {
                const ref = condition.ref[j];
                const baseField = OperandHelper.summaryLevelBaseField(ref.fieldname, ref.FType, this.customFields, this.iffData);
                const split = IFFHelper.splitIffField(baseField, "$");
                if(eligibilityTradeFields.includes(split[0])){
                    const arrayBaseField = OperationsUtil.getFieldBasedOnStructure(CONSTANTS.IFF_STRUCTURE, baseField,"");
                    const split = IFFHelper.splitIffField(arrayBaseField, ".");
                    return split[0]
                }
            }
        }
        const computedAmtCustomFieldArray = OperationsUtil.computeLogicBasedOnFields(this.Outcome.COMPUTE_LOGIC, this.iffData, OperationsUtil.isTradeLevelEligibility(this.INSTITUTION_ID), true);

        for(let i = 0 ; i< computedAmtCustomFieldArray.length ; i ++) {
            const elem = computedAmtCustomFieldArray[i];
            if(elem.split("$")[0] == CONSTANTS.CUSTOM_FIELDS){
                const baseField = OperandHelper.summaryLevelBaseField(elem, "CUSTOM", this.customFields, this.iffData);
                const split = IFFHelper.splitIffField(baseField, "$");

                if(eligibilityTradeFields.includes(split[0])){
                    const arrayBaseField = OperationsUtil.getFieldBasedOnStructure(CONSTANTS.IFF_STRUCTURE, baseField,"");
                    const split = IFFHelper.splitIffField(arrayBaseField, ".");
                    return split[0]
                }
            }else {
                const splitNonCustomField = IFFHelper.splitIffField(elem, "$");
                if(eligibilityTradeFields.includes(splitNonCustomField[0])){
                    const arrayBaseField = OperationsUtil.getFieldBasedOnStructure(CONSTANTS.IFF_STRUCTURE, elem,"");
                    const split = IFFHelper.splitIffField(arrayBaseField, ".");
                    return split[0];
                }

            }
        }
    }

    private getCustomFieldFromOutcome(){
        let outputCustomField = [];
        const computedAmtCustomFieldArray = OperationsUtil.computeLogicBasedOnFields(this.Outcome.COMPUTE_LOGIC, this.iffData, true, true);
        Array.isArray(computedAmtCustomFieldArray) && computedAmtCustomFieldArray.length > 0 && computedAmtCustomFieldArray.forEach((elem)=>{
          if(elem.split("$")[0] == CONSTANTS.CUSTOM_FIELDS){
            outputCustomField.push(OperandHelper.getAllDepedentCustonFieldsAsTrade(elem,this.customFields,this.iffData));
          }
      });
      return outputCustomField;

    }
    private getExp() {
        const tempRefExp = [];

        this.Condition.forEach((rule: EligibilityConditionModel) => {
            const tempExp = "";
            const temArr = [];
            if (rule.val1 == "" && rule.exp1 == "") {
                temArr.push(`( ${rule.displayname} ${rule.exp2} ${rule.val2} )`);
                temArr.push(rule.operator);
                if (rule.ref.length == 0) {
                    temArr.push(rule.outOperator + " ");
                    tempRefExp.push(temArr.join(" "));

                } else {
                temArr.push(rule.getExp());
                tempRefExp.push(` ( ${temArr.join(" ")} ) `);
                tempRefExp.push(rule.outOperator);
                }
            } else {
                temArr.push(`( ( ${rule.val1} ${rule.exp1} ${rule.displayname} )`);
                temArr.push("&&");
                temArr.push(`( ${rule.displayname} ${rule.exp2} ${rule.val2} ) )`);
                temArr.push(rule.operator);
                if (rule.ref.length == 0) {
                    temArr.push(rule.outOperator + " ");
                    tempRefExp.push(temArr.join(" "));

                } else {
                temArr.push(rule.getExp());
                tempRefExp.push(` ( ${temArr.join(" ")} ) `);
                tempRefExp.push(rule.outOperator);
                // tempExp = ` ( ( ( ${rule.val1} ${rule.exp1} ${rule.displayname} ) && ( ${rule.displayname} ${rule.exp2} ${rule.val2} ) ) ${rule.operator} ${rule.getExp()} ) ${rule.outOperator}`
            }
            // tempRefExp.push(tempExp);
        }
        });
        const expression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const leftOperand = new OperandMaker("outputObjIterator.GRID_EXP", CONSTANTS.FIELD, "string");
        const rightOperand = new OperandMaker(tempRefExp.join(""), CONSTANTS.VALUE, "string");
        expression.operands.push(leftOperand);
        expression.operands.push(rightOperand);
        return expression;
    }
}


