import { getAllDependentCustomFields } from "../../../../generatePolicyProd";
import { generateBREJson } from "../adapters/customFieldAdapter";
import { CONSTANTS } from "../constants/constants";
import { isCustomType } from "../helper/commonHelper";
import * as IFFHelper from "../helper/IFFHelper";
import * as OperationsUtil from "../util/OperationsUtil";
import * as StringUtil from "../util/StringUtil";
import {
    ExpressionMaker, ExpressionsMaker, IFConditionExpressionMaker, OperandMaker,
    OutputAliasMaker,
} from "./breClass";
import { Counter } from "./counter";
import { CreditRule } from "./creditRuleModel";
import { CustomField } from "./customFieldModel";
import { FinancialFieldModel } from "./financialFieldsModel";
import { MatchingField } from "./matchingFields";
import { PolicyBase } from "./policyBase";
import { Ref2 } from "./ref2Model";
import { RuleList } from "./ruleListModel";
import { Rule } from "./ruleModel";
import { ScoreCardModel } from "./scoring/scoreCardModel";
import { EligibilityModel } from "./eligibility/eligibilityModel";
import { DeviationModel } from "./deviation/deviationModel";
import { AnalyticalRatio } from "./analyticalFields/AnalyticalField";
import { AnalyticalSpecModel } from "./analyticalFields/analyticalSpecModel";

export interface IBasePolicy {
    generate(BREXCreditRule?: ExpressionsMaker | boolean);
}

export class PolicyModel extends PolicyBase implements IBasePolicy {
    public derivedFields: DerivedFields;
    public customFields: CustomField[];
    public creditRule: CreditRule[];
    public eligibility: EligibilityModel[];
    public masterFields: any[];
    public creditPolicy: CreditPolicy;
    public analyticalFieldsDeff: AnalyticalRatio[];
    public analyticalFieldsSpec: AnalyticalSpecModel[];
    public matchingFields: MatchingField[];
    public INSTITUTION_ID: number;
    public financialField: FinancialFieldModel[];
    public scoreCard: ScoreCardModel[];
    public Deviation: DeviationModel[];

    private _processCustomFieldMap: any = {};
    private _customFieldsInOrder: any = [];
    private _eligibilityCustomFields: any = [];
    private _scoreCardCustomFields: any = [];
    private _creditRuleCustomFields: any = [];
    private _eligibilityCustomFieldName: any = [];
    private _scoreCardCustomFieldName: any = [];
    private _creditRuleCustomFieldName: any = [];

    constructor(props: PolicyModel, iffData: any) {
        super(iffData);
        if (!props) {
            return;
        }
        this.INSTITUTION_ID = props.INSTITUTION_ID;
        const { customFields = [], creditRule = [], financialField = [], analyticalFieldsDeff = [],
             matchingFields = [], scoreCard = [], eligibility = [], Deviation = [] ,analyticalFieldsSpec = [] } = props;
        this.customFields = customFields ? customFields.map((x) => new CustomField(x, customFields, iffData)) : [];
        this.derivedFields = new DerivedFields(props.derivedFields);
        this.creditRule = creditRule ? creditRule.map((x) => new CreditRule(x, iffData, this.customFields)) : [];
        // TODO: use factory to assign below fields
        this.eligibility = eligibility ? eligibility.map((x)=> new EligibilityModel(x, iffData, this.customFields)) : [];
        this.masterFields = props.masterFields;
        this.creditPolicy = new CreditPolicy(props.creditPolicy, this.customFields, iffData);
        this.analyticalFieldsDeff = analyticalFieldsDeff.map((x) => new AnalyticalRatio(x, iffData));
        this.analyticalFieldsSpec = analyticalFieldsSpec.map((x)=> new AnalyticalSpecModel(x,iffData));
        this.matchingFields = matchingFields ? matchingFields.map((x) => new MatchingField(x, iffData)) : [];
        this.financialField = financialField ? financialField.map((x) => new FinancialFieldModel(x, this, iffData)) : [];
        this.scoreCard = scoreCard ? scoreCard.map((x) => new ScoreCardModel(x, this.iffData, this.creditPolicy, this.customFields)) : [];
        if (Array.isArray(Deviation)) {
            this.Deviation = Deviation.map((x) => { return new DeviationModel(x, iffData, this.customFields) });
        } else {
            this.Deviation = Deviation ? [new DeviationModel(Deviation, iffData, this.customFields)] : [];
        }
        this._eligibilityCustomFieldName = OperationsUtil.eligibilityCustomFieldCriteria();
        this._scoreCardCustomFieldName = OperationsUtil.scoreCardCustomFieldCriteria(this.scoreCard);
        this._creditRuleCustomFieldName = OperationsUtil.creditRuleCustomFieldCriteria(this.creditRule);

        this.sortCustomFields();
    }

    set processCustomFieldMap(value: any) {
        this._processCustomFieldMap = value;
    }

    set customFieldsInOrder(value: any) {
        this._customFieldsInOrder = value;
    }

    set eligibilityCustomFields(value: any) {
        this._eligibilityCustomFields = value;
    }

    set scoreCardCustomFields(value: any) {
        this._scoreCardCustomFields = value;
    }

    set creditRuleCustomFields(value: any) {
        this._creditRuleCustomFields = value;
    }

    set eligibilityCustomFieldName(value: any) {
        this._eligibilityCustomFieldName = value;
    }

    set scoreCardCustomFieldName(value: any) {
        this._scoreCardCustomFieldName = value;
    }

    set creditRuleCustomFieldName(value: any) {
        this._creditRuleCustomFieldName = value;
    }

    public generate() {
        console.log("Starting the generation of breJSON");
        // IMPORTANT: Do not change sequence of method calls
        return [...PolicyModel.generateMainInfo(),
        ...PolicyModel.generateHeader(),
        ...this.generateCustomFields(),
        ...this.generateScoringCard(),
        ...this.generateEligibility(),
        ...this.generateCreditRule(),
        ...this.generateDeviation()];
    }

    public static generateMainInfo() {
        const BREXJson = [];
        const expression = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);

        // Set Header element in response
        const statusFieldsStmt = PolicyModel.createExp("STATUS", CONSTANTS.types.STRING, "COMPLETED", CONSTANTS.VALUE);
        expression.expressions.push(statusFieldsStmt);

        BREXJson.push(expression);
        return BREXJson;
    }

    public static generateHeader() {
        const BREXJson = [];
        const expression = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);

        // Set Header element in response
        const headerFieldsStmt = PolicyModel.createExp("HEADER", CONSTANTS.types.OBJECT, {}, CONSTANTS.VALUE);
        expression.expressions.push(headerFieldsStmt);

        // Set application id in output
        const applicationIdStmt = PolicyModel.createExp(`HEADER["APPLICATION-ID"]`, CONSTANTS.types.STRING, `${CONSTANTS.loanInput}.HEADER["APPLICATION-ID"]`, CONSTANTS.FIELD);
        expression.expressions.push(applicationIdStmt);

        // Set customer id in output
        const customerIdStmt = PolicyModel.createExp(`HEADER["CUSTOMER-ID"]`, CONSTANTS.types.STRING, `${CONSTANTS.loanInput}.HEADER["CUSTOMER-ID"]`, CONSTANTS.FIELD);
        expression.expressions.push(customerIdStmt);

        // Set customer id in output
        const institutionIdStmt = PolicyModel.createExp(`HEADER["INSTITUTION-ID"]`, CONSTANTS.types.STRING, `${CONSTANTS.loanInput}.HEADER["INSTITUTION-ID"]`, CONSTANTS.FIELD);
        expression.expressions.push(institutionIdStmt);

        // Set current time in output
        const timeStmt = PolicyModel.createExp(`HEADER["RESPONSE-DATETIME"]`, CONSTANTS.types.CUSTOM, `_.responseDateTime()`, CONSTANTS.FIELD);
        expression.expressions.push(timeStmt);

        BREXJson.push(expression);
        return BREXJson;
    }

    public generateCreditRule() {
        const BREXJson = [];
        const creditRuleLength = this.creditRule.length;
        const expression = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);
        const addionalCreditRule = CreditRule.getAdditionalRule();
        expression.expressions.push(addionalCreditRule);
        this.creditRule.forEach((creditRule: CreditRule, id: number) => {
            // push the main Decision object as a 1st expression`
            if (id == creditRuleLength - 1) {
                expression.expressions.push(creditRule.generate());
            } else {
                expression.expressions.push(creditRule.generateAdditionalCreditRule());
            }
        });
        if (creditRuleLength > 1) {
            const addCreditRule = CreditRule.getAdditionalCreditRule(expression);
            expression.expressions.push(addCreditRule);
        }
        BREXJson.push(expression);
        if(creditRuleLength > 0) {
            BREXJson.push(CreditRule.generateMultiCreditRuleDecision());
            BREXJson.push(CreditRule.generateFinalDecision());

            const ruleName = this.creditRule[creditRuleLength - 1].name;
            const workFlowFinalDecision = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
            const workFlowFinalDecisionLeft = new OperandMaker(`${CONSTANTS.loanInput}.${CONSTANTS.WORKFLOW_FIELDS}["${ruleName}"]`, CONSTANTS.FIELD, CONSTANTS.types.STRING);
            const workFlowFinalDecisionRight = new OperandMaker(`${CONSTANTS.loanOutput}.DECISION_RESPONSE.Decision`, CONSTANTS.FIELD, CONSTANTS.types.STRING);
            workFlowFinalDecision.operands.push(workFlowFinalDecisionLeft);
            workFlowFinalDecision.operands.push(workFlowFinalDecisionRight);
            BREXJson.push(workFlowFinalDecision)
        }
        this._creditRuleCustomFields.forEach((curField) => {
            const customField = new CustomField(curField, this.customFields, this.iffData);
            BREXJson.push(customField.generate());
        });
        return BREXJson;
    }

    public generateScoringCard() {
        const BREXJson = [];
        const scoreCardLength = this.scoreCard.length;
        const expression = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);
        const scoreData = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const scoreDataLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}["SCORE-DATA"]`, CONSTANTS.FIELD, CONSTANTS.types.OBJECT);
        const scoreDataRightOperand = new OperandMaker({}, CONSTANTS.VALUE, CONSTANTS.types.OBJECT);
        scoreData.operands.push(scoreDataLeftOperand);
        scoreData.operands.push(scoreDataRightOperand);

        const additionalScoreCardExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const additionalScoreCardleftOperand = new OperandMaker(CONSTANTS.loanOutput + "."+ CONSTANTS.ADDITIONAL_SCORECARDS, CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        const additionalScoreCardRightOperand = new OperandMaker([], CONSTANTS.VALUE, CONSTANTS.types.ARRAY);
        additionalScoreCardExp.operands.push(additionalScoreCardleftOperand);
        additionalScoreCardExp.operands.push(additionalScoreCardRightOperand);
        scoreCardLength > 1 && expression.expressions.push(additionalScoreCardExp);
        scoreCardLength > 0 && expression.expressions.push(scoreData);
        this.scoreCard.forEach((scorecard: ScoreCardModel, index: number) => {
            if(OperationsUtil.isValidScoreCard(scorecard)) {
                if (scoreCardLength == 1) {
                    expression.expressions.push(scorecard.generate());
                } else {
                    expression.expressions.push(scorecard.generate());
                    expression.expressions.push(ScoreCardModel.getAdditionalScores());
                    const additionalScorepushExp = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, "push", []);
                    const additionalScorePushLeftOperand = new OperandMaker(CONSTANTS.loanOutput + "."+ CONSTANTS.ADDITIONAL_SCORECARDS, CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
                    const additionalScorepushExpRightOperand = new OperandMaker("additionalScores", CONSTANTS.FIELD, CONSTANTS.types.OBJECT);
                    additionalScorepushExp.operands.push(additionalScorePushLeftOperand);
                    additionalScorepushExp.operands.push(additionalScorepushExpRightOperand);
                    expression.expressions.push(additionalScorepushExp);
                }
            }
        });
        scoreCardLength > 1 && expression.expressions.push(ScoreCardModel.additionalScoresPopExp());
        BREXJson.push(expression);

        this._scoreCardCustomFields.forEach((curField) => {
            const customField = new CustomField(curField, this.customFields, this.iffData);
            BREXJson.push(customField.generate());
        });
        return BREXJson;
    }

    public generateCustomFields() {
        const BREXJson = [];
        const BREXDerivedFieldRule = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);
        BREXJson.push(BREXDerivedFieldRule);
        Array.prototype.push.apply(BREXDerivedFieldRule.expressions, this.customFieldAttributes());

        this._customFieldsInOrder.forEach((curField) => {
            if (curField.custom_type == CONSTANTS.CUSTOM) {
                const customField = new CustomField(curField, this.customFields, this.iffData);
                BREXDerivedFieldRule.expressions.push(customField.generate());
            }
            if (curField.custom_type == CONSTANTS.MATCHING) {
                const matchingField = new MatchingField(curField, this.iffData);
                BREXDerivedFieldRule.expressions.push(matchingField.generate());
            }
            if (curField.custom_type == CONSTANTS.FINANCIAL) {
                const financialField = new FinancialFieldModel(curField, this, this.iffData);
                BREXDerivedFieldRule.expressions.push(financialField.generate());
            }
            if(curField.custom_type == CONSTANTS.ANALYTICAL){
                const analyticalField = new AnalyticalSpecModel(curField,this.iffData, this.customFields);
                if(analyticalField && analyticalField.RATIO && analyticalField.RATIO.length>0){
                    BREXDerivedFieldRule.expressions.push(analyticalField.generateRatio());
                }else{
                    BREXDerivedFieldRule.expressions.push(analyticalField.generate());
                }
            }
        });

        return BREXJson;
    }
    public generateAnalyticalFields() {
        const BREXJson = [];
        const BREXDerivedFieldRule = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);

        const operationTypeMap = {};

        // this.analyticalFieldsDeff.forEach((analyticalField: AnalyticalRatio) => {
        //     operationTypeMap[analyticalField.FIELD_NAME] = analyticalField.DEFF_TYPE;
        //     if (analyticalField.DEFF_TYPE == CONSTANTS.outcomeType.DIVISION) {
        //        BREXDerivedFieldRule.expressions.push(analyticalField.generate());
        //     }
        // });
        this.analyticalFieldsSpec.forEach((analyticalSpec: AnalyticalSpecModel) => {
            if(analyticalSpec.RATIO.length > 0){
                BREXDerivedFieldRule.expressions.push(analyticalSpec.generateRatio())
            }else{
                BREXDerivedFieldRule.expressions.push(analyticalSpec.generate());
            }
        });

        BREXJson.push(BREXDerivedFieldRule);

        return BREXJson;
    }

    public generateEligibility(){
        const BREXJson = [];
        const eligibityLength = this.eligibility.length;
        const eligibilityExpression = new ExpressionsMaker(CONSTANTS.FOR_EACH,[]);

        const multipleEligbility = EligibilityModel.getAdditionalEligibilityExpression();
        eligibityLength >1 && eligibilityExpression.expressions.push(multipleEligbility);
        const eligibilityResponseExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const eligibilityResponseExpLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}.${CONSTANTS.ELIGIBILITY_RESPONSE}`, CONSTANTS.FIELD, CONSTANTS.types.OBJECT);
        const eligibilityResponseExpRightOperand = new OperandMaker({},CONSTANTS.VALUE,CONSTANTS.types.OBJECT);
        eligibilityResponseExp.operands.push(eligibilityResponseExpLeftOperand);
        eligibilityResponseExp.operands.push(eligibilityResponseExpRightOperand);

        const additionalEligibilityExp = new ExpressionMaker(CONSTANTS.STATEMENT,"=",[]);
        const additionalEligibilityExpLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}.${CONSTANTS.ADDITIONAL_ELIGIBILITY}`,CONSTANTS.FIELD,CONSTANTS.types.ARRAY);
        const additionalEligibilityExpRightOperand = new OperandMaker([], CONSTANTS.VALUE,CONSTANTS.types.ARRAY);
        additionalEligibilityExp.operands.push(additionalEligibilityExpLeftOperand);
        additionalEligibilityExp.operands.push(additionalEligibilityExpRightOperand);
        eligibityLength > 1 && eligibilityExpression.expressions.push(additionalEligibilityExp);
        if(eligibityLength > 0){
            eligibilityExpression.expressions.push(eligibilityResponseExp);
        }

        for(let eligibilityCount = 0; eligibilityCount < eligibityLength; eligibilityCount++){
            const currEligibility = this.eligibility[eligibilityCount];
            if(eligibityLength>1){
                eligibilityExpression.expressions.push(currEligibility.generate(true));//TODO remove the flag later
            }else{
                eligibilityExpression.expressions.push(currEligibility.generate());
            }
        }
        const approveSortExp = EligibilityModel.additionalIfExpression("additionalApproveArray");
        const eligibilitySortExp = new ExpressionMaker(CONSTANTS.STATEMENT,"=",[]);
        const eligibilitySortExpLeftOperand = new OperandMaker("additionalApproveArray",CONSTANTS.FIELD,CONSTANTS.types.ARRAY);
        const eligibilitySortExpRightOperand = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION,"sortBy",[]);
        const sortRigtOperand = new OperandMaker("obj.ELIGIBILITY_AMOUNT", CONSTANTS.FIELD,CONSTANTS.types.INTEGER);
        eligibilitySortExp.operands.push(eligibilitySortExpLeftOperand);
        eligibilitySortExpRightOperand.operands.push(eligibilitySortExpLeftOperand);
        eligibilitySortExpRightOperand.operands.push(sortRigtOperand);
        eligibilitySortExp.operands.push(eligibilitySortExpRightOperand);
        
        const falseCaseAlias = new OperandMaker("additionalApproveArray", CONSTANTS.FIELD,CONSTANTS.types.ARRAY);
        const eligibilityIFSortExp = new IFConditionExpressionMaker(CONSTANTS.IF_COND,new OutputAliasMaker(eligibilitySortExp,falseCaseAlias),approveSortExp);
        const ifMutualExclusiveExp = new ExpressionsMaker(CONSTANTS.FOR_EACH,[]);
        ifMutualExclusiveExp.expressions.push(eligibilityIFSortExp);
        eligibityLength > 1 && eligibilityExpression.expressions.push(ifMutualExclusiveExp);
        eligibityLength > 1 && eligibilityExpression.expressions.push(EligibilityModel.getAdditionalEligibilityFinalExp());

        const matchEligibilityExpression = new ExpressionMaker(CONSTANTS.STATEMENT,"=", []);
        const matchEligibilityLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}["${CONSTANTS.ADDITIONAL_ELIGIBILITY}"]`, CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        const matchEligibilityRightExpression = new ExpressionMaker(CONSTANTS.INTERSECTION_OPERATION, CONSTANTS.operators.CONCAT, []);
        const firstOperand = new OperandMaker("additionalApproveArray", CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        const secondOperand = new OperandMaker("additionalDeclineArray", CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        const thirdOperand = new OperandMaker("additionalQueueArray", CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        matchEligibilityRightExpression.operands.push(firstOperand);
        matchEligibilityRightExpression.operands.push(secondOperand);
        matchEligibilityRightExpression.operands.push(thirdOperand);
        matchEligibilityExpression.operands.push(matchEligibilityLeftOperand);
        matchEligibilityExpression.operands.push(matchEligibilityRightExpression);
        eligibityLength > 1 && eligibilityExpression.expressions.push(matchEligibilityExpression);
        BREXJson.push(eligibilityExpression);

        //START: add Eligibility fields to workflow
        if(eligibityLength > 0) {
            const workFlowDecision = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
            const workFlowDecisionLeft = new OperandMaker(`${CONSTANTS.loanInput}.${CONSTANTS.WORKFLOW_FIELDS}.ELIGIBLE_DECISION`, CONSTANTS.FIELD, CONSTANTS.types.STRING);
            const workFlowDecisionRight = new OperandMaker(`${CONSTANTS.loanOutput}.${CONSTANTS.ELIGIBILITY_RESPONSE}.DECISION`, CONSTANTS.FIELD, CONSTANTS.types.STRING);
            workFlowDecision.operands.push(workFlowDecisionLeft);
            workFlowDecision.operands.push(workFlowDecisionRight);
            eligibilityExpression.expressions.push(workFlowDecision);

            const workFlowEligLoan = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
            const workFlowEligLoanLeft = new OperandMaker(`${CONSTANTS.loanInput}.${CONSTANTS.WORKFLOW_FIELDS}.ELIGIBLE_LOAN_AMOUNT`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
            const workFlowEligLoanRight = new OperandMaker(`${CONSTANTS.loanOutput}.${CONSTANTS.ELIGIBILITY_RESPONSE}.ELIGIBILITY_AMOUNT`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
            workFlowEligLoan.operands.push(workFlowEligLoanLeft);
            workFlowEligLoan.operands.push(workFlowEligLoanRight);
            eligibilityExpression.expressions.push(workFlowEligLoan);

            const workFlowApprovedLoan = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
            const workFlowApprovedLoanLeft = new OperandMaker(`${CONSTANTS.loanInput}.${CONSTANTS.WORKFLOW_FIELDS}.APPROVED_AMT`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
            const workFlowApprovedLoanRight = new OperandMaker(`${CONSTANTS.loanOutput}.${CONSTANTS.ELIGIBILITY_RESPONSE}.APPROVED_AMOUNT`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
            workFlowApprovedLoan.operands.push(workFlowApprovedLoanLeft);
            workFlowApprovedLoan.operands.push(workFlowApprovedLoanRight);
            eligibilityExpression.expressions.push(workFlowApprovedLoan);

            const workFlowMaxTenor = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
            const workFlowMaxTenorLeft = new OperandMaker(`${CONSTANTS.loanInput}.${CONSTANTS.WORKFLOW_FIELDS}.ELIGIBLE_LOAN_TENOR`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
            const workFlowMaxTenorRight = new OperandMaker(`${CONSTANTS.loanOutput}.${CONSTANTS.ELIGIBILITY_RESPONSE}.MAX_TENOR`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
            workFlowMaxTenor.operands.push(workFlowMaxTenorLeft);
            workFlowMaxTenor.operands.push(workFlowMaxTenorRight);
            eligibilityExpression.expressions.push(workFlowMaxTenor);

            const workFlowDP = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
            const workFlowDPLeft = new OperandMaker(`${CONSTANTS.loanInput}.${CONSTANTS.WORKFLOW_FIELDS}.ELIGIBLE_LOAN_DP`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
            const workFlowDPRight = new OperandMaker(`${CONSTANTS.loanOutput}.${CONSTANTS.ELIGIBILITY_RESPONSE}.DP`, CONSTANTS.FIELD, CONSTANTS.types.INTEGER);
            workFlowDP.operands.push(workFlowDPLeft);
            workFlowDP.operands.push(workFlowDPRight);
            eligibilityExpression.expressions.push(workFlowDP);
        }
        //END
        this._eligibilityCustomFields.forEach((curField) => {
            const customField = new CustomField(curField, this.customFields, this.iffData);
            BREXJson.push(customField.generate());
        });
        return BREXJson;
    }

    public generateDeviation() {
        const BREXJson = [];
        const deviationLength  = this.Deviation.length;
        const deviationExpression = new ExpressionsMaker(CONSTANTS.FOR_EACH,[]);

        const deviationResponse = new ExpressionMaker(CONSTANTS.STATEMENT,"=",[]);
        const deviationResponseLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}.${CONSTANTS.DEVIATION_RESPONSE}`, CONSTANTS.FIELD,CONSTANTS.types.OBJECT);
        const deviationResponseRightOperand = new OperandMaker({}, CONSTANTS.VALUE,CONSTANTS.types.OBJECT);
        deviationResponse.operands.push(deviationResponseLeftOperand);
        deviationResponse.operands.push(deviationResponseRightOperand);
        if(deviationLength>0){
            deviationExpression.expressions.push(deviationResponse);
        }

        for(let count = 0; count <deviationLength; count++){
            const currDeviation = this.Deviation[count];
            deviationExpression.expressions.push(currDeviation.generate());
        }
        BREXJson.push(deviationExpression);
        return BREXJson
    }

    public generateCriterion() {
        const BREXJson = [];
        const BREXCreditRule = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);
        BREXJson.push(BREXCreditRule);
        Array.prototype.push.apply(BREXCreditRule.expressions, this.customFieldAttributes());

        const criteriaCustomFields = this.creditPolicy.customFieldForCriteria();
        criteriaCustomFields.forEach((customField: CustomField) => {
            BREXCreditRule.expressions.push(customField.generate());
        });
        const expression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const expressionLeft = new OperandMaker(`${CONSTANTS.loanOutput}.ruleResult`, CONSTANTS.FIELD, "any");
        expression.operands.push(expressionLeft);

        if (this.creditPolicy.CritList.length == 0) {
            const expressionsRight = new OperandMaker("true", CONSTANTS.VALUE, CONSTANTS.types.STRING);
            expression.operands.push(expressionsRight);
            BREXCreditRule.expressions.push(expression);
        } else {
            const expressionsRight = new ExpressionsMaker(CONSTANTS.MUTUAL_EXCLUSIVE_EXPRESSIONS, []);
            expression.operands.push(expressionsRight);
            BREXCreditRule.expressions.push(expression);
            this.creditPolicy.CritList.forEach((rule: Rule) => {
                const outputAlias = new OutputAliasMaker("true", "");
                const ifCondition = new IFConditionExpressionMaker(CONSTANTS.IF_COND, outputAlias, rule.generate());
                expressionsRight.expressions.push(ifCondition);
            });
        }
        return BREXJson;
    }

    private sortCustomFields() {
        this.customFields.forEach((customField) => {
            this.seperatesortingFields(customField);
        });

        this.matchingFields.forEach((matchingField) => {
            if (OperationsUtil.isValidDerivedField(matchingField)) {
                this.seperatesortingFields(matchingField);
            }
        });

        this.financialField.forEach((financialfield) => {
            if (OperationsUtil.isValidDerivedField(financialfield)) {
                this.seperatesortingFields(financialfield);
            }
        });
        this.analyticalFieldsSpec.forEach((analyticalField : AnalyticalSpecModel)=>{
            this.seperatesortingFields(analyticalField);
        });
    }

    private checkAndProcessCondition(condition) {
        const fTypeArr:any = [CONSTANTS.CUSTOM, CONSTANTS.MATCHING, CONSTANTS.FINANCIAL, CONSTANTS.ANALYTICAL];
        if (fTypeArr.includes(condition.FType || condition.FIELD_TYPE)) {
            this.processFieldForSorting(condition.fieldname || condition.FIELD_NAME)
        }
        if (condition.val2 && condition.val2.length > 0) {
            const splitVal2 = IFFHelper.splitIffField(condition.val2, "$");
            if (splitVal2.length > 0 && splitVal2[0] == CONSTANTS.CUSTOM_FIELDS) {
                const fieldname = condition.val2;
                const arr = fieldname.split("$");
                const customFieldToFilledName = arr[arr.length - 1];
                const customFieldOfCondition = this.customFields.filter((x) => x.FIELD_NAME == customFieldToFilledName)[0];
                customFieldOfCondition && !this._processCustomFieldMap[customFieldToFilledName] &&
                    this.processCustomFieldForSorting(customFieldOfCondition);
            }
        }
    }

    private seperatesortingFields(field) {
        if (field.custom_type == CONSTANTS.CUSTOM) {
            this.processCustomFieldForSorting(field);
        }
        if (field.custom_type == CONSTANTS.MATCHING) {
            this.processMatchingFieldsForSorting(field);
        }
        if (field.custom_type == CONSTANTS.FINANCIAL) {
            this.processFinancialFieldForSorting(field);
        }
        if(field.custom_type == CONSTANTS.ANALYTICAL){
            this.processAnalyticalFieldsForSorting(field);
        }
    }

    private processAnalyticalFieldsForSorting(analyticalField){
        if (!this._processCustomFieldMap[analyticalField.FIELD_NAME]) {
            this._processCustomFieldMap[analyticalField.FIELD_NAME] = "started";
        }
        if(analyticalField.RATIO.length>0){
            analyticalField && analyticalField.RATIO && analyticalField.RATIO.forEach((rule) => {
                rule && rule.ref && rule.ref.length && rule.ref.forEach((ref) => {
                    this.checkAndProcessCondition(ref);
                });
            });
        }else{
            analyticalField && analyticalField.FILTER && analyticalField.FILTER.forEach((rule) => {
                this.checkAndProcessCondition(rule);
                rule && rule.ref && rule.ref.length && rule.ref.forEach((ref) => {
                    this.checkAndProcessCondition(ref);
                });
            });
        }
        if (this._processCustomFieldMap[analyticalField.FIELD_NAME] == "started") {
            this._processCustomFieldMap[analyticalField.FIELD_NAME] = "completed";
            this._customFieldsInOrder.push(analyticalField);
        }
    }

    private processFieldForSorting(fieldname: string) {
        const arr = fieldname.split("$");
        const customFieldToFilledName = arr[arr.length - 1];
        const financial:any = [CONSTANTS.FINANCIAL_FIELDS, CONSTANTS.CALCULATED_FIELDS];
        if (financial.includes(arr[0])) {
            const commonFinancialFIeld = this.financialField.filter((x) => x.FIELD_NAME == customFieldToFilledName)[0];
            commonFinancialFIeld && !this._processCustomFieldMap[customFieldToFilledName] &&
            this.processFinancialFieldForSorting(commonFinancialFIeld);
        }

        if (arr[0] == CONSTANTS.MATCHING_FIELDS) {
            const commonMatchingField = this.matchingFields.filter((x) => x.FIELD_NAME == customFieldToFilledName)[0];
            commonMatchingField && !this._processCustomFieldMap[customFieldToFilledName] &&
            this.processMatchingFieldsForSorting(commonMatchingField);
        }
        if (arr[0] == CONSTANTS.CUSTOM_FIELDS) {
            const customFieldOfCondition = this.customFields.filter((x) => x.FIELD_NAME == customFieldToFilledName)[0];
            customFieldOfCondition && !this._processCustomFieldMap[customFieldToFilledName] &&
            this.processCustomFieldForSorting(customFieldOfCondition);
        }
        if(arr[0] == CONSTANTS.ANALYTICAL_FIELDS){
            const customFieldOfCondition = this.customFields.filter((x) => x.FIELD_NAME == customFieldToFilledName)[0];
            customFieldOfCondition && !this._processCustomFieldMap[customFieldToFilledName] &&
            this.processAnalyticalFieldsForSorting(customFieldOfCondition);
        }
    }

    private processOutcomeForSorting(fieldname: string) {
        const arr = fieldname.split("$");
        const customFieldToFilledName = arr[arr.length - 1];
        const customFieldOfCondition = this.customFields.filter((x) => x.FIELD_NAME == customFieldToFilledName)[0];
        customFieldOfCondition && !this._processCustomFieldMap[customFieldToFilledName] &&
        this.processCustomFieldForSorting(customFieldOfCondition);
    }

    private processCustomFieldForSorting(customFiled: CustomField) {
        let isEligibilityCustomField = false, isScoreCardCustomField = false, isCreditRuleCustomField = false;
        if (!this._processCustomFieldMap[customFiled.FIELD_NAME]) {
            this._processCustomFieldMap[customFiled.FIELD_NAME] = "started";
        }
        customFiled && customFiled.RULES && customFiled.RULES.forEach((rule) => {
            rule && rule.Condition && rule.Condition.forEach((condition) => {
                const arr = condition.fieldname.split("$");
                const fieldname = arr[arr.length - 1];
                isEligibilityCustomField = !isEligibilityCustomField ? this._eligibilityCustomFieldName.includes(StringUtil.toUpperCase(fieldname)) : isEligibilityCustomField;
                isScoreCardCustomField = !isScoreCardCustomField ? this._scoreCardCustomFieldName.includes(StringUtil.toUpperCase(fieldname)) : isScoreCardCustomField;
                isCreditRuleCustomField = !isCreditRuleCustomField ? this._creditRuleCustomFieldName.includes(StringUtil.toUpperCase(fieldname)) : isCreditRuleCustomField;

                this.checkAndProcessCondition(condition);
                condition && condition.ref && condition.ref.length && condition.ref.forEach((ref) => {
                    const arr = ref.fieldname.split("$");
                    const fieldname = arr[arr.length - 1];
                    isEligibilityCustomField = !isEligibilityCustomField ? this._eligibilityCustomFieldName.includes(StringUtil.toUpperCase(fieldname)) : isEligibilityCustomField;
                    isScoreCardCustomField = !isScoreCardCustomField ? this._scoreCardCustomFieldName.includes(StringUtil.toUpperCase(fieldname)) : isScoreCardCustomField;
                    isCreditRuleCustomField = !isCreditRuleCustomField ? this._creditRuleCustomFieldName.includes(StringUtil.toUpperCase(fieldname)) : isCreditRuleCustomField;

                    this.checkAndProcessCondition(ref);
                });
            });

            if (rule.Outcome.BASE_FTYPE == CONSTANTS.CUSTOM) {
                this.processOutcomeForSorting(rule.Outcome.BASE_FIELD);
            }

            if (rule.Outcome.COMPR_FTYPE == CONSTANTS.CUSTOM) {
                this.processOutcomeForSorting(rule.Outcome.COMPR_FIELD);
            }

            if (rule.Outcome.EMI_FTYPE == CONSTANTS.CUSTOM) {
                this.processOutcomeForSorting(rule.Outcome.EMI_FIELD);
            }

            if (rule.Outcome.ROI_FTYPE == CONSTANTS.CUSTOM) {
                this.processOutcomeForSorting(rule.Outcome.ROI_FIELD);
            }

            if (rule.Outcome.TENURE_FTYPE == CONSTANTS.CUSTOM) {
                this.processOutcomeForSorting(rule.Outcome.TENURE_FIELD);
            }
        });

        if (this._processCustomFieldMap[customFiled.FIELD_NAME] == "started") {
            this._processCustomFieldMap[customFiled.FIELD_NAME] = "completed";
            isEligibilityCustomField ? this._eligibilityCustomFields.push(customFiled) : "";
            isCreditRuleCustomField ? this._creditRuleCustomFields.push(customFiled) : "";
            isScoreCardCustomField ? this._scoreCardCustomFields.push(customFiled) : "";
            !(isEligibilityCustomField || isScoreCardCustomField || isCreditRuleCustomField) ? this._customFieldsInOrder.push(customFiled) : "";
        }
    }

    private processMatchingFieldsForSorting(matchingField: MatchingField) {
        if (!this._processCustomFieldMap[matchingField.FIELD_NAME]) {
            this._processCustomFieldMap[matchingField.FIELD_NAME] = "started";
        }
        matchingField && matchingField.RULES && matchingField.RULES.forEach((rule) => {
            rule && rule.Condition && rule.Condition.forEach((condition) => {
                this.checkAndProcessCondition(condition);
                condition && condition.ref && condition.ref.length && condition.ref.forEach((ref) => {
                    this.checkAndProcessCondition(ref);
                });
            });
        });
        if (this._processCustomFieldMap[matchingField.FIELD_NAME] == "started") {
            this._processCustomFieldMap[matchingField.FIELD_NAME] = "completed";
            this._customFieldsInOrder.push(matchingField);
        }
    }

    private processFinancialFieldForSorting(financialField: FinancialFieldModel) {
        if (!this._processCustomFieldMap[financialField.FIELD_NAME]) {
            this._processCustomFieldMap[financialField.FIELD_NAME] = "started";
        }
        financialField && financialField.FINANCIAL_FIELD_LIST && financialField.FINANCIAL_FIELD_LIST.forEach((rule) => {
            this.checkAndProcessCondition(rule);
        });

        if (this._processCustomFieldMap[financialField.FIELD_NAME] == "started") {
            this._processCustomFieldMap[financialField.FIELD_NAME] = "completed";
            this._customFieldsInOrder.push(financialField);
        }
    }

    private static createExp(leftOperand: string, type: string, rightOperand: any, rightOperandDataType: string) {
        const stmt = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);
        const expression = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const leftOperandMaker = new OperandMaker(`${CONSTANTS.loanOutput}.${leftOperand}`, CONSTANTS.FIELD, type);
        const rightOperandMaker = new OperandMaker(rightOperand, rightOperandDataType, type);
        expression.operands.push(leftOperandMaker);
        expression.operands.push(rightOperandMaker);
        stmt.expressions.push(expression);
        return stmt;
    }

    private customFieldAttributes() {
        const expressions = [];
        const derivedFieldsStmt = PolicyModel.createExp("DERIVED_FIELDS", CONSTANTS.types.OBJECT, {}, CONSTANTS.VALUE);
        expressions.push(derivedFieldsStmt);

        // Set policy name in the output
        const policyNameStmt = PolicyModel.createExp("DERIVED_FIELDS.POLICY_NAME", CONSTANTS.types.STRING, this.creditPolicy.name, CONSTANTS.VALUE);
        expressions.push(policyNameStmt);

        // Set policy id in the output
        const policyIdStmt = PolicyModel.createExp("DERIVED_FIELDS.POLICY_ID", CONSTANTS.types.INTEGER, this.creditPolicy.PolicyID, CONSTANTS.VALUE);
        expressions.push(policyIdStmt);

        return expressions;
    }
}

export class DerivedField {
    public fieldName: string;
    public fieldType: string;
    public fieldId: number;

    constructor(field?: DerivedField) {
        this.fieldId = field.fieldId;
        this.fieldName = field.fieldName;
        this.fieldType = field.fieldType;
    }
}

export class DerivedFields extends PolicyBase {
    public createdUpdatedDate: string;
    public derivedFields: DerivedField[];
    public institutionId: number;
    public makerChecker: string;
    public activeStatus: number;
    public derivedTableId: number;
    public createdUpdatedBy: string;
    public derivedTableName: string;

    constructor(fields?: DerivedFields, iffData?: any) {
        super(iffData);
        if (!fields) {
            return;
        }
        this.createdUpdatedDate = fields.createdUpdatedDate;
        this.institutionId = fields.institutionId;
        this.makerChecker = fields.makerChecker;
        this.activeStatus = fields.activeStatus;
        this.derivedTableId = fields.derivedTableId;
        this.createdUpdatedBy = fields.createdUpdatedBy;
        this.derivedTableName = fields.derivedTableName;
        const { derivedFields = [] } = fields;
        this.derivedFields = derivedFields.map((x) => new DerivedField(x));
    }
}

export class Ref {
    public val1: string;
    public exp1: string;
    public fieldname: string;
    public displayname: string;
    public exp2: string;
    public val2: string;
    public operator: string;
    public DType: string;
    public AFSpec: string;
    public FType: string;
    public ExpType: string;

    constructor(props?: Ref) {
        if (!props) {
            return;
        }
        this.val1 = props.val1;
        this.exp1 = props.exp1;
        this.fieldname = props.fieldname;
        this.displayname = props.displayname;
        this.exp2 = props.exp2;
        this.val2 = props.val2;
        this.operator = props.operator;
        this.DType = props.DType;
        this.AFSpec = props.AFSpec;
        this.FType = props.FType;
        this.ExpType = props.ExpType;
    }
}

export class Condition {
    public val1: string;
    public exp1: string;
    public fieldname: string;
    public displayname: string;
    public exp2: string;
    public val2: string;
    public operator: string;
    public outOperator: string;
    public DType: string;
    public AFSpec: string;
    public FType: string;
    public ExpType: string;
    public ref: Ref[];

    constructor(props?: Condition) {
        if (!props) {
            return;
        }
        this.val1 = props.val1;
        this.exp1 = props.exp1;
        this.fieldname = props.fieldname;
        this.displayname = props.displayname;
        this.exp2 = props.exp2;
        this.val2 = props.val2;
        this.operator = props.operator;
        this.outOperator = props.outOperator;
        this.DType = props.DType;
        this.AFSpec = props.AFSpec;
        this.FType = props.FType;
        this.ExpType = props.ExpType;
        const { ref = [] } = props;
        this.ref = ref.map((x) => new Ref(x));
    }
}

export class Outcome {
    public TYPE: string;
    public OUTCM_VALUE: string;
    public BASE_FIELD: string;
    public BASE_FNAME: string;
    public BASE_DTYPE: string;
    public BASE_FTYPE: string;
    public AGGR_OPRTR: string;
    public COMPR_FIELD: string;
    public COMPR_FNAME: string;
    public COMPR_FTYPE: string;
    public COMPR_VALUE: string;
    public EMI_FIELD: string;
    public EMI_FNAME: string;
    public EMI_DTYPE: string;
    public EMI_FTYPE: string;
    public ROI_FIELD: string;
    public ROI_FNAME: string;
    public ROI_DTYPE: string;
    public ROI_FTYPE: string;
    public TENURE_FIELD: string;
    public TENURE_FNAME: string;
    public TENURE_FTYPE: string;
    public AGGR_TYPE: string;

    constructor(props?: Outcome) {
        if (!props) {
            return;
        }
        this.TYPE = props.TYPE;
        this.OUTCM_VALUE = props.OUTCM_VALUE;
        this.BASE_FIELD = props.BASE_FIELD;
        this.BASE_FNAME = props.BASE_FNAME;
        this.BASE_DTYPE = props.BASE_DTYPE;
        this.BASE_FTYPE = props.BASE_FTYPE;
        this.AGGR_OPRTR = props.AGGR_OPRTR;
        this.COMPR_FIELD = props.COMPR_FIELD;
        this.COMPR_FNAME = props.COMPR_FNAME;
        this.COMPR_FTYPE = props.COMPR_FTYPE;
        this.COMPR_VALUE = props.COMPR_VALUE;
        this.EMI_FIELD = props.EMI_FIELD;
        this.EMI_FNAME = props.EMI_FNAME;
        this.EMI_DTYPE = props.EMI_DTYPE;
        this.EMI_FTYPE = props.EMI_FTYPE;
        this.ROI_FIELD = props.ROI_FIELD;
        this.ROI_FNAME = props.ROI_FNAME;
        this.ROI_DTYPE = props.ROI_DTYPE;
        this.ROI_FTYPE = props.ROI_FTYPE;
        this.TENURE_FIELD = props.TENURE_FIELD;
        this.TENURE_FNAME = props.TENURE_FNAME;
        this.TENURE_FTYPE = props.TENURE_FTYPE;
        this.AGGR_TYPE = props.AGGR_TYPE;
    }
}

export class DEFAULTVALUE {
    public TYPE: string;
    public OUTCM_VALUE: any;
    public BASE_FIELD: string;
    public BASE_FNAME: string;
    public BASE_FTYPE: string;
    public BASE_DTYPE: string;
    public AGGR_OPRTR: string;
    public AGGR_TYPE: string;
    public COMPR_FIELD: string;
    public COMPR_FNAME: string;
    public COMPR_FTYPE: string;
    public COMPR_VALUE: string;

    constructor(props?: DEFAULTVALUE) {
        if (!props) {
            return;
        }
        this.TYPE = props.TYPE;
        this.OUTCM_VALUE = props.OUTCM_VALUE;
        this.BASE_FIELD = props.BASE_FIELD;
        this.BASE_FNAME = props.BASE_FNAME;
        this.BASE_FTYPE = props.BASE_FTYPE;
        this.BASE_DTYPE = props.BASE_DTYPE;
        this.AGGR_OPRTR = props.AGGR_OPRTR;
        this.AGGR_TYPE = props.AGGR_TYPE;
        this.COMPR_FIELD = props.COMPR_FIELD;
        this.COMPR_FNAME = props.COMPR_FNAME;
        this.COMPR_FTYPE = props.COMPR_FTYPE;
        this.COMPR_VALUE = props.COMPR_VALUE;
    }
}

export class History {
    public Date: string;
    public ActionBy: string;

    constructor(props?: History) {
        if (!props) {
            return;
        }
        this.Date = props.Date;
        this.ActionBy = props.ActionBy;
    }
}

export class PUSH {
    public History: History;

    constructor(props?: PUSH) {
        if (!props) {
            return;
        }
        this.History = new History(props.History);
    }
}

export class AGRTDVALUE {
    public FIELD_NAME: string;
    public DISP_NAME: string;
    public MAX: string;
    public MIN: string;
}

export class Condition2 {
    public val1: string;
    public exp1: string;
    public fieldname: string;
    public displayname: string;
    public exp2: string;
    public val2: string;
    public operator: string;
    public DType: string;
    public AFSpec: string;
    public FType: string;
    public ExpType: string;
    public Difference: string;
    public DiffOpr: string;
    public outOperator: string;
    public ref: any[];
}

export class Outcome2 {
    public DECISION: string;
    public COMPUTE_DISP: string;
    public COMPUTE_LOGIC: string;
    public REMARK: string;
    public ADDITIONAL_FIELDS: any[];
}

export class RULE2 {
    public ElgbltyID: number;
    public Condition: Condition2[];
    public Outcome: Outcome2;
    public GridID: number;
    public INSTITUTION_ID: number;
    public createdby: string;
    public createDate: string;
    public ACTIVE: boolean;
    public updateDate: string;
    public updatedby: string;
}

export class Eligibility {
    public INSTITUTION_ID: number;
    public ElgbltyID: number;
    public name: string;
    public status: string;
    public createdby: string;
    public updatedby: string;
    public createDate: string;
    public AGRTD_VALUES: AGRTDVALUE[];
    public DEC_PRRTY: string[];
    public updateDate: string;
    public RULES: RULE2[];
}

export class ProdList {
    public name: string;
    public value: string;
}

export class TableID {
    public index: number;
    public value: string;
    public name: string;
}

export class ProdList2 {
    public name: string;
    public value: string;
}

export class RuleID {
    public index: number;
    public value: string;
    public name: string;
}

export class Valid {
    public val1: string;
    public val2: string;
}

export class ElgbltyID {
    public index: number;
    public value: string;
    public name: string;
}

export class AppList {
    public name: string;
    public value: string;
}

export class DraftData {
    public TableID: TableID[];
    public updateDate: string;
    public ProdList: ProdList2[];
    public RuleID: RuleID[];
    public priority: number;
    public CritList: any[];
    public valid: Valid;
    public createdDate: string;
    public createdby: string;
    public DeviationID: string;
    public derivedTableId: string;
    public ElgbltyID: ElgbltyID[];
    public AppList: AppList[];
    public status: string;
}

export class History2 {
    public Action: string;
    public ActionBy: string;
    public Date: string;
    public draftData: DraftData;
}

export class AppList2 {
    public name: string;
    public value: string;
}

export class ElgbltyID2 {
    public index: number;
    public value: string;
    public name: string;
}

export class RuleID2 {
    public index: number;
    public value: string;
    public name: string;
}

export class TableID2 {
    public index: number;
    public value: string;
    public name: string;
    public TableID: string;
    public INSTITUTION_ID: number;
}

export class Valid2 {
    public val1: string;
    public val2: string;
}

export class CreditPolicy {
    public INSTITUTION_ID: number;
    public CritList: Rule[];
    public createdDate: string;
    public createdby: string;
    public ProdList: ProdList[];
    public name: string;
    public priority: number;
    public History: History2[];
    public AppList: AppList2[];
    public PolicyID: number;
    public status: string;
    public DeviationID: string;
    public ElgbltyID: ElgbltyID2[];
    public RuleID: RuleID2[];
    public TableID: TableID2[];
    public derivedTableId: string;
    public updateDate: string;
    public valid: Valid2;
    public customFields: CustomField[];

    constructor(props?: CreditPolicy, customFields?: CustomField[], iffData?: any) {
        if (!props) {
            return;
        }
        this.INSTITUTION_ID = props.INSTITUTION_ID;
        const ruleList = props.CritList ? props.CritList : [];
        this.CritList = ruleList.map((x) => new Rule(x, iffData, customFields));
        this.createdDate = props.createdDate;
        this.createdby = props.createdby;
        this.ProdList = props.ProdList;
        this.name = props.name;
        this.priority = props.priority;
        this.History = props.History;
        this.AppList = props.AppList;
        this.PolicyID = props.PolicyID;
        this.status = props.status;
        this.DeviationID = props.DeviationID;
        this.ElgbltyID = props.ElgbltyID;
        this.RuleID = props.RuleID;
        this.TableID = props.TableID;
        this.derivedTableId = props.derivedTableId;
        this.updateDate = props.updateDate;
        this.valid = props.valid;
        this.customFields = customFields;
    }

    public customFieldForCriteria() {
        const criteriaCustomFields = [];
        const policyCustomFields = this.customFields;
        this.CritList.forEach((rule: Rule) => {
            if (isCustomType(rule.FType)) {
                getAllDependentCustomFields(policyCustomFields, rule.displayname, criteriaCustomFields);
            }
            rule.ref.forEach((ref: Ref2) => {
                if (isCustomType(ref.FType)) {
                    getAllDependentCustomFields(policyCustomFields, ref.displayname, criteriaCustomFields);
                }
            });
        });
        return criteriaCustomFields;
    }
}
