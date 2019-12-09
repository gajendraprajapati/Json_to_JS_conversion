import { PolicyBase } from "../policyBase";
import { IBasePolicy } from "../policyModel";
import { DeviationRuleModel } from "./deviationRuleModel";
import { CONSTANTS } from "../../constants/constants";
import { ExpressionMaker, OperandMaker, ExpressionsMaker, IFConditionExpressionMaker, OutputAliasMaker } from "../breClass";
import * as IFFhelper from "../../helper/IFFHelper";
import * as OperationsUtil from "../../util/OperationsUtil";
import { CustomField } from "../customFieldModel";

export class DeviationRuleListModel  extends PolicyBase implements IBasePolicy{
    public rules : DeviationRuleModel[];
    public cname : string;
    public CriteriaID : number;
    public status : string;
    public deviation : any;
    public outerOperands: ExpressionMaker[];
    public valueExp: ExpressionMaker;
    public expressionTree: ExpressionMaker;

    constructor(props: DeviationRuleListModel, iffData: any, customFields: CustomField[]) {
        super(iffData);
        if (!props) {
            return;
        }
        const {rules =  []} = props; 
        this.cname = props.cname;
        this.CriteriaID = props.CriteriaID;
        this.status = props.status;
        this.rules = rules.map((x)=>{return new DeviationRuleModel(x,iffData, customFields)});
        this.deviation = props.deviation;
        this.expressionTree = {} as ExpressionMaker;
    }

    public generate(){
        this.outerOperands = [];
        const expression = this.constructObjectDormationExp();
        expression.sobreId = this.CriteriaID + "";
        expression.name = this.cname;
        expression.type = CONSTANTS.CREDIT_RULE;
        this.rules.forEach((rule: DeviationRuleModel, index: number) => {
            if (index == 0) {
                this.expressionTree.operator = rule.outOperator;
            }
            const exp = this.getExp();
            const outerOperand = rule.generate();
            const refValue = rule.generateValue();
            const iffObj = IFFhelper.iffStructure(rule.FType, rule.fieldname, this.iffData);
            const iffStrFlag = OperationsUtil.isArrayInIFFOccurance(iffObj);
            const fieldname = OperationsUtil.getFieldBasedOnStructure(rule.FType, rule.fieldname, "", rule.AFSpec);
            expression.expressions.push(DeviationRuleListModel.createValExp(`outputObjIterator.Values["${rule.displayname}"]`, fieldname, "string", iffStrFlag));
            expression.expressions.push(...refValue);
            expression.expressions.push(exp);
            if (iffStrFlag) {
                const ValExpressionFormat = DeviationRuleListModel.getValueFormat(`outputObjIterator.Values["${rule.displayname}"]`);
                expression.expressions.push(ValExpressionFormat);
            }
            this.outerOperands.push(outerOperand);
        });

        if (this.rules.length == 1) {
            const { operator, template, operands } = this.outerOperands[0] || {} as ExpressionMaker;
            this.expressionTree.operator = operator;
            this.expressionTree.template = template;
            this.expressionTree.operands = operands;
        }
        const arrayPushDetailsStmt = this.constructDetailStmnt();
        expression.expressions.push(arrayPushDetailsStmt);
        return expression;
      


    }
    private constructObjectDormationExp() {
        const expression = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);

        // Criteria Id Object formation. Push this to the expression `statements` array object
        const criteriaIdStmt = DeviationRuleListModel.createExp("outputObjIterator.CriteriaID", this.CriteriaID, CONSTANTS.types.INTEGER);
        expression.expressions.push(criteriaIdStmt);

        // Rule name Object formation. Push this to the expression `statements` array object
        const ruleNameStmt = DeviationRuleListModel.createExp("outputObjIterator.DeviationCriteriaName", this.cname, "string");
        expression.expressions.push(ruleNameStmt);

        const valueStmt = DeviationRuleListModel.createExp("outputObjIterator.Values", {}, "object");
        expression.expressions.push(valueStmt);

        let devLevel;
        let devRemark;
        let devResult;
        let devReason;
        let devCategory;
        
        if(this.deviation){
            const deviation = this.deviation;
            devLevel = deviation && deviation.level || [];
            devRemark = deviation && deviation.deviationRemarks && deviation.deviationRemarks.length &&
                         deviation.deviationRemarks[0].devRemark || "";
            devReason = deviation && deviation.deviationRemarks && deviation.deviationRemarks.length &&
                          deviation.deviationRemarks[0].remarkText || "";
            devCategory = deviation && deviation.category || "";
            devResult = deviation && deviation.deviationRemarks.map((x)=>{
                let temp = {};
                if(x.devRemark){
                    temp["deviationRemark"] = x.devRemark
                }
                if(x.remarkText){
                    temp["deviationReason"] = x.remarkText; 
                }
                return temp;
            });
        }


        const deviationRemarksStmt = DeviationRuleListModel.createExp("outputObjIterator.deviationRemarks", devRemark, CONSTANTS.types.STRING);
        expression.expressions.push(deviationRemarksStmt);

        const deviationReasontStmt = DeviationRuleListModel.createExp("outputObjIterator.deviationReason", devReason, CONSTANTS.types.STRING);
        expression.expressions.push(deviationReasontStmt);

        const deviationResultStmt = DeviationRuleListModel.createExp("outputObjIterator.deviationResult", devResult, "array");
        expression.expressions.push(deviationResultStmt);

        const deviationCategoryStmt = DeviationRuleListModel.createExp("outputObjIterator.category", devCategory, CONSTANTS.types.STRING);
        expression.expressions.push(deviationCategoryStmt);

        const levelStmt = DeviationRuleListModel.createExp("outputObjIterator.Level", devLevel, "array");
        expression.expressions.push(levelStmt);

      
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
            const valMapOperation = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, "map", []);
            const valMapLeftOperand = new OperandMaker(rightStr, CONSTANTS.FIELD, "string");
            const valMapRightOperand = new OperandMaker("obj." + leftOperandStr, CONSTANTS.VALUE, "string");
            valMapOperation.operands.push(valMapLeftOperand);
            valMapOperation.operands.push(valMapRightOperand);

            // const responseStmtRightOperand = new OperandMaker(rightOperand, CONSTANTS.FIELD, operandType);
            stmt.operands.push(responseStmtLeftOperand);
            stmt.operands.push(valMapOperation);
            return stmt;
        } else {
            const responseStmtLeftOperand = new OperandMaker(leftOperand, CONSTANTS.FIELD, operandType);
            const responseStmtRightOperand = new OperandMaker(rightOperand, CONSTANTS.FIELD, operandType);
            const responseStmtRightExpression = new ExpressionMaker(CONSTANTS.SIMPLE_OPERATION, CONSTANTS.NULL_OR_VALUE, []);
            responseStmtRightExpression.operands.push(responseStmtRightOperand);
            stmt.operands.push(responseStmtLeftOperand);
            stmt.operands.push(responseStmtRightExpression);
            return stmt;
        }
    }

    private static getValueFormat(val) {
        const valFormatStmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const responseStmtLeftOperand = new OperandMaker(val, CONSTANTS.FIELD, CONSTANTS.types.STRING);
        const valStrOperation = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, "arrayToStringFormat", []);
        const valStrLeftOperand = new OperandMaker(val, CONSTANTS.VALUE, CONSTANTS.types.STRING);
        valStrOperation.operands.push(valStrLeftOperand);
        valFormatStmt.operands.push(responseStmtLeftOperand);
        valFormatStmt.operands.push(valStrOperation);
        return valFormatStmt;
    }

    private getExp() {
        const tempRefExp = [];
        this.rules.forEach((rule: DeviationRuleModel) => {
            const tempExp = "";
            const temArr = [];
            if (rule.val1 == "" && rule.exp1 == "") {
                temArr.push(`( ${rule.fieldname} ${rule.exp2} ${rule.val2} )`);
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
                temArr.push(`( ( ${rule.val1} ${rule.exp1} ${rule.fieldname} )`);
                temArr.push("&&");
                temArr.push(`( ${rule.fieldname} ${rule.exp2} ${rule.val2} ) )`);
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
    public constructDetailStmnt() {

        const operand = this.rules[0].outOperator ? this.rules[0].outOperator : "";

        
        this.expressionTree = new ExpressionMaker(CONSTANTS.STATEMENT, operand, this.outerOperands);
        const stmt = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.PUSH, []);
        const arrayPushDetailsStmtLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}.${CONSTANTS.DEVIATION_RESPONSE}.Details`, CONSTANTS.FIELD, "string");
        const arrayPushDetailsStmtRightOperand = new OperandMaker("outputObjIterator", CONSTANTS.FIELD, "object");
        stmt.operands.push(arrayPushDetailsStmtLeftOperand);
        stmt.operands.push(arrayPushDetailsStmtRightOperand);
        const ifCond = new IFConditionExpressionMaker(CONSTANTS.IF_COND,new OutputAliasMaker(stmt,""),this.expressionTree);

        return ifCond;
    }





} 