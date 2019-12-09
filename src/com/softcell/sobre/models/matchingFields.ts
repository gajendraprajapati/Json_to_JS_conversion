import { CONSTANTS } from "../constants/constants";
import * as OperationsUtil from "../util/OperationsUtil";
import * as StringUtil from "../util/StringUtil";
import { ExpressionMaker, ExpressionsMaker, OperandMaker } from "./breClass";
import { Rule } from "./matchingFieldRules";
import { PolicyBase } from "./policyBase";
import { IBasePolicy } from "./policyModel";
import * as EncDecryptUtil from "../util/EncDecryptUtil";

export class MatchingField extends PolicyBase implements IBasePolicy {
    public version: number;
    public DISPLAY_NAME: string;
    public FIELD_TYPE: string;
    public INSTITUTION_ID: number;
    public FIELD_DATA_TYPE: string;
    public createdby: string;
    public FIELD_NAME: string;
    public RULES: Rule[];
    public status: string;
    public custom_type: string;

    constructor(props?: MatchingField, iffData?: any) {
        super(iffData);
        if (!props) {
            return;
        }

        this.version = props.version;
        this.DISPLAY_NAME = props.DISPLAY_NAME;
        this.FIELD_TYPE = props.FIELD_TYPE;
        this.INSTITUTION_ID = props.INSTITUTION_ID;
        this.FIELD_DATA_TYPE = props.FIELD_DATA_TYPE;
        this.createdby = props.createdby;
        this.FIELD_NAME = props.FIELD_NAME;
        this.custom_type = CONSTANTS.MATCHING;
        this.RULES = props.RULES.map((x) => {
            x.operationType = this.FIELD_DATA_TYPE == "S";
            return new Rule(x, this.iffData);
        });
        this.status = props.status;
    }

    public generate() {
        const brexMatchingField = new ExpressionsMaker(CONSTANTS.FOR_EACH, []);
        let fieldNameArr;
        let isAddress = false;
        if (StringUtil.toUpperCase(this.FIELD_DATA_TYPE) == "ADDRESS") {
            isAddress = true;
        }

        this.RULES.forEach((rule: Rule) => {
            brexMatchingField.expressions.push(rule.generate(isAddress));
        });
        this.RULES.forEach((rule: Rule) => {
            fieldNameArr = (rule.getFieldName());
        });

        const percentMatch = this.evaluateFieldMatch(fieldNameArr);
        brexMatchingField.expressions.push(percentMatch);
        return brexMatchingField;
    }

    private evaluateFieldMatch(fieldNameArr: String[]) {
        const stmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const comparisionType = OperationsUtil.matchingFieldComparisionType(this.FIELD_DATA_TYPE);
        const matchingFieldName = OperationsUtil.getFieldBasedOnStructure(CONSTANTS.MATCHING_FIELDS, this.FIELD_NAME, "");
        const responseStmtLeftOperand = new OperandMaker(matchingFieldName, CONSTANTS.FIELD, "string");

        if (StringUtil.toLowerCase(this.FIELD_DATA_TYPE) == CONSTANTS.types.DATE) {
            const dateValOperation = this.dateExp(fieldNameArr);
            stmt.operands.push(responseStmtLeftOperand);
            stmt.operands.push(dateValOperation);
        } else {
            const valMapOperation = new ExpressionMaker(CONSTANTS.STRING_OPERATION, comparisionType, [], EncDecryptUtil.encrypt(this.FIELD_NAME), CONSTANTS.MATCHING_FILED_NAME + " - " + this.FIELD_NAME, CONSTANTS.MATCHING_FIELDS);
            const valMapLeftOperand = new OperandMaker("leftMatchingField", CONSTANTS.FIELD, "string");
            const valMapRightOperand = new OperandMaker("rightMatchingField", CONSTANTS.FIELD, "string");
            valMapOperation.operands.push(valMapLeftOperand);
            valMapOperation.operands.push(valMapRightOperand);
            stmt.operands.push(responseStmtLeftOperand);
            stmt.operands.push(valMapOperation);
        }
        return stmt;
    }

    private dateExp(fieldNameArr) {
        let leftDateFormatObj = fieldNameArr[0];
        let rightDateFormatObj = fieldNameArr[1];
        if (leftDateFormatObj == "NA") {
            leftDateFormatObj = CONSTANTS.DATE_FROMAT2;
        }
        if (rightDateFormatObj == "NA") {
            rightDateFormatObj = CONSTANTS.DATE_FROMAT2;
        }

        const valMapOperation = new ExpressionMaker(CONSTANTS.DATE_OPERATION, "dateMatch", [], EncDecryptUtil.encrypt(this.FIELD_NAME), CONSTANTS.MATCHING_FILED_NAME + " - " + this.FIELD_NAME, CONSTANTS.MATCHING_FIELDS);
        const valMapLeftOperand = new OperandMaker("leftMatchingField[0]", CONSTANTS.FIELD, CONSTANTS.types.DATE, leftDateFormatObj);
        const valMapRightOperand = new OperandMaker("rightMatchingField[0]", CONSTANTS.FIELD, CONSTANTS.types.DATE, rightDateFormatObj);
        valMapOperation.operands.push(valMapLeftOperand);
        valMapOperation.operands.push(valMapRightOperand);
        return valMapOperation;
    }

}
