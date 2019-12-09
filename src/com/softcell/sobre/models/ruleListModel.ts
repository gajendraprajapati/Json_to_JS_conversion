import { IBasePolicy } from "./policyModel";

import { CONSTANTS } from "../constants/constants";
import { ExpressionMaker, ExpressionsMaker, IFConditionExpressionMaker, OperandMaker, OutputAliasMaker } from "./breClass";
import { PolicyBase } from "./policyBase";
import { Rule } from "./ruleModel";
const OperationsUtil = require("../util/OperationsUtil");
import * as IFFhelper from "../helper/IFFHelper";
import * as StringUtil from "../util/StringUtil";
import { CustomField } from "./customFieldModel";

export class RuleList extends PolicyBase implements IBasePolicy {
    public ACTIVE: boolean;
    public CriteriaID: number;
    public cname: string;
    public Outcome: string;
    public remark: string;
    public rules: Rule[];
    public valueExp: ExpressionMaker;
    public outerOperands: ExpressionMaker[];
    public expressionTree: ExpressionMaker;

    constructor(props?: RuleList, iffData?: any, customFields?: CustomField[]) {
        super(iffData);
        if (!props) {
            return;
        }
        this.ACTIVE = props.ACTIVE != false;
        this.CriteriaID = !props.CriteriaID ? 0 : Number(props.CriteriaID);
        this.cname = props.cname;
        this.Outcome = props.Outcome;
        this.remark = props.remark;
        const { rules = [] } = props;
        this.rules = rules.map((x) => new Rule(x, iffData, customFields));
    }

    public generate(BREXCreditRule?: ExpressionsMaker) {
        const expression = this.constructObjectDormationExp();
        expression.sobreId = this.CriteriaID + "";
        expression.name = this.cname;
        expression.type = CONSTANTS.CREDIT_RULE;
        this.rules.forEach((rule: Rule, index: number) => {
            if (index == 0) {
                this.expressionTree.operator = rule.outOperator;
            }
            const exp = this.getExp();
            const outerOperand = rule.generate();
            const refValue = rule.generateValue();
            const iffObj = IFFhelper.iffStructure(rule.FType, rule.fieldname, this.iffData);
            let iffStructureVal2;
            let fieldnameVal2;
            if (StringUtil.toLowerCase(rule.ExpType) == CONSTANTS.FIELD) {
                iffStructureVal2 = IFFhelper.iffStructure(CONSTANTS.IFF_STRUCTURE, rule.val2, this.iffData);
                fieldnameVal2 = OperationsUtil.getFieldBasedOnStructure(rule.FType, rule.val2, "", rule.AFSpec);
            }
            const iffStrFlag = OperationsUtil.isArrayInIFFOccurance(iffObj);
            const iffStrFlagVal2 = OperationsUtil.isArrayInIFFOccurance(iffStructureVal2);
            const fieldname = OperationsUtil.getFieldBasedOnStructure(rule.FType, rule.fieldname, "", rule.AFSpec);
           
            iffStrFlagVal2 && expression.expressions.push(RuleList.createValExp(`outputObjIterator.Values["${rule.val2}"]`, fieldnameVal2, "string", iffStrFlagVal2));
            expression.expressions.push(RuleList.createValExp(`outputObjIterator.Values["${rule.displayname}"]`, fieldname, "string", iffStrFlag));
            expression.expressions.push(...refValue);
            expression.expressions.push(exp);
            if (iffStrFlag) {
                const ValExpressionFormat = RuleList.getValueFormat(`outputObjIterator.Values["${rule.displayname}"]`);
                expression.expressions.push(ValExpressionFormat);
            }
            if(iffStrFlagVal2){
                const ValExpressionFormatVal2 = RuleList.getValueFormat(`outputObjIterator.Values["${rule.val2}"]`);
                expression.expressions.push(ValExpressionFormatVal2);
            }
            this.outerOperands.push(outerOperand);
        });

        if (this.rules.length == 1) {
            const { operator, template, operands } = this.outerOperands[0] || {} as ExpressionMaker;
            this.expressionTree.operator = operator;
            this.expressionTree.template = template;
            this.expressionTree.operands = operands;
        }
        const arrayPushDetailsStmt = RuleList.constructDetailStmnt();
        expression.expressions.push(arrayPushDetailsStmt);
        if (!BREXCreditRule) {
            return expression;
        }
        BREXCreditRule.expressions.push(expression);
    }

    public static constructDetailStmnt() {
        // Array push Details Object formation. Push this to the main expression `statements` array object
        const stmt = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.PUSH, []);
        const arrayPushDetailsStmtLeftOperand = new OperandMaker(CONSTANTS.loanOutput + ".DECISION_RESPONSE.Details", CONSTANTS.FIELD, "string");
        const arrayPushDetailsStmtRightOperand = new OperandMaker("outputObjIterator", CONSTANTS.FIELD, "object");
        stmt.operands.push(arrayPushDetailsStmtLeftOperand);
        stmt.operands.push(arrayPushDetailsStmtRightOperand);
        return stmt;
    }

    private constructObjectDormationExp() {
        const expression = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);

        // Criteria Id Object formation. Push this to the expression `statements` array object
        const criteriaIdStmt = RuleList.createExp("outputObjIterator.CriteriaID", this.CriteriaID.toString(), CONSTANTS.types.INTEGER);
        expression.expressions.push(criteriaIdStmt);

        // Rule name Object formation. Push this to the expression `statements` array object
        const ruleNameStmt = RuleList.createExp("outputObjIterator.RuleName", this.cname, "string");
        expression.expressions.push(ruleNameStmt);

        const valueStmt = RuleList.createExp("outputObjIterator.Values", {}, "object");
        expression.expressions.push(valueStmt);

        // Outcome Object formation. Push this to the expression `statements` array object
        const outcomeStmt = this.createConditionalExp();
        const remark = this.conditionalRemark();
        expression.expressions.push(outcomeStmt);
        expression.expressions.push(remark);
        expression.expressions.push(this.valueExp);
        return expression;
    }

    private static createExp(leftOperand: string, rightOperand: string | any, operandType: string, template?: string) {
        const stmt = new ExpressionMaker(template || CONSTANTS.STATEMENT, "=", []);
        const responseStmtLeftOperand = new OperandMaker(leftOperand, CONSTANTS.FIELD, operandType);
        const responseStmtRightOperand = new OperandMaker(rightOperand, CONSTANTS.VALUE, operandType);
        stmt.operands.push(responseStmtLeftOperand);
        stmt.operands.push(responseStmtRightOperand);
        return stmt;
    }

    public static createValExp(leftOperand: string, rightOperand: string, operandType: string, template?: string | boolean) {
        const rightOperandArray = rightOperand.split(".");
        const leftOperandStr = rightOperandArray.pop();
        const rightStr = rightOperandArray.join(".");
        const stmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        if (template) {
            const responseStmtLeftOperand = new OperandMaker(leftOperand, CONSTANTS.FIELD, operandType);
            const valMapOperation = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.MAP, []);
            const valMapLeftOperand = new OperandMaker(rightStr, CONSTANTS.FIELD, CONSTANTS.types.STRING);
            const valMapRightOperand = new OperandMaker("obj." + leftOperandStr, CONSTANTS.VALUE, CONSTANTS.types.STRING);
            valMapOperation.operands.push(valMapLeftOperand);
            valMapOperation.operands.push(valMapRightOperand);

            // const responseStmtRightOperand = new OperandMaker(rightOperand, CONSTANTS.FIELD, operandType);
            stmt.operands.push(responseStmtLeftOperand);
            stmt.operands.push(valMapOperation);
            return stmt;
        } else {
            const responseStmtLeftOperand = new OperandMaker(leftOperand, CONSTANTS.FIELD, operandType);
            const responseStmtRightExpression = new ExpressionMaker(CONSTANTS.SIMPLE_OPERATION, CONSTANTS.NULL_OR_VALUE, []);
            const responseStmtRightOperand = new OperandMaker(rightOperand, CONSTANTS.FIELD, operandType);
            responseStmtRightExpression.operands.push(responseStmtRightOperand);
            stmt.operands.push(responseStmtLeftOperand);
            stmt.operands.push(responseStmtRightExpression);
            return stmt;
        }
    }

    private createConditionalExp() {
        this.outerOperands = [];
        const outcomeStmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const outcomeStmtLeftOperand = new OperandMaker("outputObjIterator.Outcome", CONSTANTS.FIELD, CONSTANTS.types.STRING);
        this.expressionTree = new ExpressionMaker(CONSTANTS.STATEMENT, "", this.outerOperands);
        const outcomeRightStmtOperand = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker(this.Outcome, " "), this.expressionTree);
        outcomeStmt.operands.push(outcomeStmtLeftOperand);
        outcomeStmt.operands.push(outcomeRightStmtOperand);
        return outcomeStmt;
    }

    private conditionalRemark() {
        const remarkExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const remarkExpLeftOperand = new OperandMaker("outputObjIterator.Remark", CONSTANTS.FIELD, "string");
        const remarkIfExp = new ExpressionMaker(CONSTANTS.STRING_OPERATION, CONSTANTS.stringOperators.EQUAL, []);
        const remarkIfExpLeft = new OperandMaker("outputObjIterator.Outcome", CONSTANTS.FIELD, "string");
        const remarkIfExpRight = new OperandMaker(" ", CONSTANTS.VALUE, "string");
        remarkIfExp.operands.push(remarkIfExpLeft);
        remarkIfExp.operands.push(remarkIfExpRight);
        const remarkExpRightOperand = new IFConditionExpressionMaker(CONSTANTS.IF_COND, new OutputAliasMaker("No Rule Match", this.remark), remarkIfExp);
        remarkExp.operands.push(remarkExpLeftOperand);
        remarkExp.operands.push(remarkExpRightOperand);
        // expression.expressions.push(remarkExp)
        return remarkExp;
    }

    private static getValueFormat(val) {
        const valFormatStmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const responseStmtLeftOperand = new OperandMaker(val, CONSTANTS.FIELD, "string");
        const valStrOperation = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, "arrayToStringFormat", []);
        const valStrLeftOperand = new OperandMaker(val, CONSTANTS.VALUE, "string");
        valStrOperation.operands.push(valStrLeftOperand);
        valFormatStmt.operands.push(responseStmtLeftOperand);
        valFormatStmt.operands.push(valStrOperation);
        return valFormatStmt;
    }

    private getExp() {
        const tempRefExp = [];

        this.rules.forEach((rule: Rule) => {
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
        const leftOperand = new OperandMaker("outputObjIterator.Exp", CONSTANTS.FIELD, "string");
        const rightOperand = new OperandMaker(tempRefExp.join(""), CONSTANTS.VALUE, "string");
        expression.operands.push(leftOperand);
        expression.operands.push(rightOperand);
        return expression;
    }

}
