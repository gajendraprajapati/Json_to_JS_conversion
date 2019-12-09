import { PolicyBase } from "../policyBase";

import { IBasePolicy } from "../policyModel";
import { CustomField } from "../customFieldModel";
import { AnalyticalFilterModel } from "./analyticalFilterModel";
import { ExpressionsMaker, ExpressionMaker, OperandMaker, IFConditionExpressionMaker, OutputAliasMaker } from "../breClass";
import { CONSTANTS } from "../../constants/constants";
import * as OperationsUtil from "../../util/OperationsUtil";
import * as IFFHelper from "../../helper/IFFHelper";
import * as OperandHelper from "../../helper/OperandHelper";
import * as StringUtil from "../../util/StringUtil";

export class AnalyticalSpecModel extends PolicyBase implements IBasePolicy {
    public FIELD_ID: number;
    public INSTITUTION_ID: number;
    public SpecID: number;
    public ACTIVE: number
    public BASE_DTYPE: string;
    public BASE_FIELD: string;
    public BASE_FNAME: string;
    public BASE_FTYPE: string;
    public COMPR_DTYPE: string
    public COMPR_FIELD: string;
    public COMPR_FNAME: string
    public COMPR_TYPE: string;
    public COMPR_VALUE: string
    public DISPLAY_NAME: string;
    public FIELD_NAME: string;
    public FILTER: AnalyticalFilterModel[];
    public OPERATOR: string;
    public RATIO: any[];
    custom_type: string;
    public COMPR_FTYPE: string;
    public TYPE: string;
    public AGGR_OPRTR: string;

    constructor(props?: AnalyticalSpecModel, iffData?: any, customFields?: CustomField[]) {
        super(iffData);
        if (!props) {
            return;
        }
        this.FIELD_ID = props.FIELD_ID;
        this.INSTITUTION_ID = props.INSTITUTION_ID;
        this.SpecID = props.SpecID;
        this.ACTIVE = props.ACTIVE;
        this.BASE_DTYPE = props.BASE_DTYPE;
        this.BASE_FIELD = props.BASE_FIELD;
        this.BASE_FNAME = props.BASE_FNAME;
        this.BASE_FTYPE = props.BASE_FTYPE;
        this.COMPR_DTYPE = props.COMPR_DTYPE;
        this.COMPR_FIELD = props.COMPR_FIELD;
        this.COMPR_FNAME = props.COMPR_FNAME;
        this.COMPR_TYPE = props.COMPR_TYPE;
        this.COMPR_VALUE = props.COMPR_VALUE;
        this.DISPLAY_NAME = props.DISPLAY_NAME;
        this.FIELD_NAME = props.FIELD_NAME;
        this.OPERATOR = props.OPERATOR;
        const { FILTER = [] } = props;
        this.FILTER = FILTER.map((x) => { return new AnalyticalFilterModel(x, iffData) });
        this.RATIO = props.RATIO;
        this.custom_type = CONSTANTS.ANALYTICAL;
    }
    public generate() {
        const outerOperands = [];
        const expressionTree = new ExpressionMaker(CONSTANTS.STATEMENT, "", []);
        const expression = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);
        const mutualExclisiveStmt = new ExpressionsMaker(CONSTANTS.MUTUAL_EXCLUSIVE_EXPRESSIONS, []);
        this.COMPR_FTYPE = this.BASE_FTYPE;
        this.TYPE = CONSTANTS.outcomeType.FIELD;
        this.AGGR_OPRTR = this.OPERATOR;

        this.FILTER.forEach((filter: AnalyticalFilterModel, index: number) => {
            if (index == 0) {
                expressionTree.operator = filter.outOperator;

            }
            outerOperands.push(filter.generate());
        });
        if (this.FILTER.length == 1) {
            const { operator, template, operands } = outerOperands[0] || {} as ExpressionMaker;
            expressionTree.operator = operator;
            expressionTree.template = template;
            expressionTree.operands = operands;
        } else {
            expressionTree.operands = outerOperands
        }
        const hasDPDCalculations = OperationsUtil.hasDPDCalculations(this.FILTER[0]) || OperationsUtil.isOutcomeHasDateDPD(this);

        const stmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const analyticalFieldsRightOperand = new ExpressionsMaker(CONSTANTS.MUTUAL_EXCLUSIVE_EXPRESSIONS, []);
        const innerExp = new ExpressionMaker(CONSTANTS.NUMBER_OPERATION, "<", []);
        const innerExpLeftOperand = new OperandMaker(0, CONSTANTS.VALUE, CONSTANTS.types.INTEGER);
        const innerExpRightOperand = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.SIZE, []);
        const assignAndReturnExp = new ExpressionMaker(CONSTANTS.ASSIGN_AND_RETURN, "=", []);
        const globalFieldName = CONSTANTS.GLOBAL_VAR + ".analyticalField" + innerExp.UUID;
        const globalDPD = "analytical" + innerExp.UUID;
        const globalDPDVar = CONSTANTS.GLOBAL_VAR + "." + globalDPD;


        const assignAndReturnLeftOperand = new OperandMaker(globalFieldName, CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        const assignAndReturnRightOperand = new ExpressionMaker(CONSTANTS.INTERSECTION_OPERATION, CONSTANTS.operators.INTERSECTION, []);
        const basefield = OperationsUtil.getFieldBasedOnStructure(this.BASE_FTYPE, this.BASE_FIELD, "", this.SpecID);
        const intersectionFilter = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, CONSTANTS.operators.FILTER, []);
        const split = IFFHelper.splitIffField(basefield, ".");
        let intersectionFilterLeftOperand;
        if (hasDPDCalculations) {
            intersectionFilterLeftOperand = new OperandMaker(globalDPDVar, CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        } else {
            intersectionFilterLeftOperand = new OperandMaker(globalFieldName, CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        }
      //  intersectionFilterLeftOperand = new OperandMaker(globalFieldName, CONSTANTS.FIELD, CONSTANTS.types.ARRAY);
        intersectionFilter.operands.push(intersectionFilterLeftOperand);
        intersectionFilter.operands.push(expressionTree);
        assignAndReturnRightOperand.operands.push(intersectionFilter);
        assignAndReturnExp.operands.push(assignAndReturnLeftOperand);
        assignAndReturnExp.operands.push(assignAndReturnRightOperand);
        innerExpRightOperand.operands.push(assignAndReturnExp);
        innerExp.operands.push(innerExpLeftOperand);
        innerExp.operands.push(innerExpRightOperand);
        const leftOperand = new OperandMaker(OperationsUtil.analyticalFieldsName(this.FIELD_NAME, this.SpecID), CONSTANTS.FIELD, CONSTANTS.types.STRING);
        stmt.operands.push(leftOperand);
        const constitionalExpression = new IFConditionExpressionMaker(CONSTANTS.IF_COND, this.outComeExpression(globalFieldName), innerExp);
        // stmt.operands.push(constitionalExpression);
        if (this.FILTER.length == 0) {
            const exp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
            exp.operands.push(leftOperand);
            const basefield = OperationsUtil.getFieldBasedOnStructure(this.BASE_FTYPE, this.BASE_FIELD, "", this.SpecID);
            exp.operands.push(this.outComeExpression(basefield))
            return exp;
        }
        if (OperationsUtil.isOutcomeHasDateDPD(this)) {
            const dpdExpressions = OperandHelper.generateOutComeOnlyDateDPDExpressions(globalDPDVar, globalDPD, this, false, this.iffData);
            // outerOperands.push(dpdExpressions)
            mutualExclisiveStmt.expressions.push(dpdExpressions);
            mutualExclisiveStmt.expressions.push(constitionalExpression);
            stmt.operands.push(mutualExclisiveStmt)
        } else {
            stmt.operands.push(constitionalExpression)
        }

        return stmt;
    }
    public generateRatio() {
        const analyticalRatioExp = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const analyticalRatioLeftOperand = new OperandMaker(OperationsUtil.analyticalFieldsName(this.FIELD_NAME, this.SpecID), "field", CONSTANTS.types.INTEGER);
        const analyticalRatioRightOperand = new ExpressionMaker(CONSTANTS.STRING_OPERATION, CONSTANTS.numberOperators.DIVISION, []);
        const baseFieldName = new OperandMaker(OperationsUtil.getFieldBasedOnStructure(this.RATIO[0].FType, this.RATIO[0].fieldname, undefined, this.SpecID), "field", CONSTANTS.types.INTEGER);
        const compareFieldName = new OperandMaker(OperationsUtil.getFieldBasedOnStructure(this.RATIO[0].ref, this.RATIO[0].ref[0].fieldname, undefined, this.SpecID), "field", CONSTANTS.types.INTEGER);
        analyticalRatioRightOperand.operands.push(baseFieldName);
        analyticalRatioRightOperand.operands.push(compareFieldName);
        analyticalRatioExp.operands.push(analyticalRatioLeftOperand);
        analyticalRatioExp.operands.push(analyticalRatioRightOperand);
        return analyticalRatioExp;
    }
    private outComeExpression(fieldName) {
        this.COMPR_FTYPE = this.BASE_FTYPE;
        this.TYPE = CONSTANTS.outcomeType.FIELD
        this.AGGR_OPRTR = this.OPERATOR;
        let hasDpdCalculations = false;
        if (StringUtil.toLowerCase(this.BASE_DTYPE) == CONSTANTS.types.DPD) {
            hasDpdCalculations = true;
        }
        if (hasDpdCalculations) {

        }

        return OperandHelper.customFieldOutputAliasForArrayCondition(CONSTANTS.types.INTEGER, this, this.INSTITUTION_ID, fieldName, "", [], this.iffData);
        //     const operator = OperationsUtil.operation(OperationsUtil.longDataType(this.BASE_DTYPE), "", this.OPERATOR);
        //     if(operator == CONSTANTS.operators.VALUE_OF) {
        //         const iffStructure = IFFHelper.iffStructure(this.BASE_FTYPE,this.BASE_FIELD,this.iffData );
        //         const split = IFFHelper.splitIffField(this.BASE_FIELD,  "$");

        //         if(iffStructure.OCCURANCE == "N" || fieldName.includes("global")){
        //             if(fieldName.includes("global")){
        //                 return new OperandMaker(fieldName+"[0]"+split[1],CONSTANTS.FIELD,CONSTANTS.types.STRING);
        //             }else{
        //                 return new OperandMaker(split[0]+"[0]"+split[1],CONSTANTS.FIELD,CONSTANTS.types.STRING);
        //             }

        //         }else{
        //             return new OperandMaker(fieldName, CONSTANTS.FIELD,CONSTANTS.types.STRING);
        //         }
        //     }else{
        //         const outComeOperation = new ExpressionMaker(CONSTANTS.ARRAY_OPERATION, operator, []);
        //         const outComeOperationOperand = new OperandMaker(fieldName, CONSTANTS.FIELD, OperationsUtil.longDataType(this.BASE_DTYPE));
        //         outComeOperation.operands.push(outComeOperationOperand);
        //         return outComeOperation;

        //     }

    }


}