import { PolicyBase } from "../policyBase";

import { IBasePolicy } from "../policyModel";
import { DeviationRuleListModel } from "./deviationRuleListModel";
import { ExpressionMaker, OperandMaker, ExpressionsMaker } from "../breClass";
import { CONNREFUSED } from "dns";
import { CONSTANTS } from "../../constants/constants";
import { CustomField } from "../customFieldModel";

export class DeviationModel extends PolicyBase implements IBasePolicy {
    public INSTITUTION_ID: string;
    public DeviationID: string;
    public name: string;
    public version: string;
    public createdby: string;
    public status: string;
    public RuleList: DeviationRuleListModel[];
    public criteriaDraftStatus: string;
    public active: string;

    constructor(props: DeviationModel, iffData: any, customFields: CustomField[]) {
        super(iffData);
        if (!props) {
            return;
        }
        const {RuleList = []} = props;
        this.INSTITUTION_ID = props.INSTITUTION_ID;
        this.DeviationID = props.DeviationID;
        this.name = props.name;
        this.version = props.version;
        this.createdby = props.createdby;
        this.status = props.status;
        this.criteriaDraftStatus = props.criteriaDraftStatus;
        this.active = props.active;
        this.RuleList = RuleList.length>0 ? RuleList.map((x)=>{
            return new DeviationRuleListModel(x,iffData,customFields);
        }):[];
        
    }
    public generate() {
        const expression = new ExpressionsMaker(CONSTANTS.FOR_EACH,[]);
        
        const deviationIdStmt = new ExpressionMaker(CONSTANTS.STATEMENT,"=",[]);
        const deviationIdStmtLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}.${CONSTANTS.DEVIATION_RESPONSE}.DeviationId`, CONSTANTS.FIELD,CONSTANTS.types.INTEGER);
        const deviationIdStmtRightOperand = new OperandMaker(this.DeviationID,CONSTANTS.VALUE,CONSTANTS.types.INTEGER);
        deviationIdStmt.operands.push(deviationIdStmtLeftOperand); 
        deviationIdStmt.operands.push(deviationIdStmtRightOperand); 
        expression.expressions.push(deviationIdStmt);

        const successStmt = new ExpressionMaker(CONSTANTS.STATEMENT, "=", []);
        const successStmtLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}.${CONSTANTS.DEVIATION_RESPONSE}.status`, CONSTANTS.FIELD, CONSTANTS.types.STRING);
        const successStmtRightOperand = new OperandMaker("success", CONSTANTS.VALUE, CONSTANTS.types.STRING);
        successStmt.operands.push(successStmtLeftOperand);
        successStmt.operands.push(successStmtRightOperand);
        expression.expressions.push(successStmt);

        const details = new ExpressionMaker(CONSTANTS.STATEMENT,"=",[]);
        const detailsLeftOperand = new OperandMaker(`${CONSTANTS.loanOutput}.${CONSTANTS.DEVIATION_RESPONSE}.Details`, CONSTANTS.FIELD,"array");
        const detailsRightOperand = new OperandMaker([],CONSTANTS.VALUE,"array");
        details.operands.push(detailsLeftOperand);
        details.operands.push(detailsRightOperand);
        expression.expressions.push(details);

        for(let count = 0; count<this.RuleList.length;count++){
            const currRule = this.RuleList[count];
            expression.expressions.push(currRule.generate());
            
        }
        return expression;
     }

}