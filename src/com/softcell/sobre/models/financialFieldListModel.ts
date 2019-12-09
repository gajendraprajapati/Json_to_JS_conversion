import { CONSTANTS } from "../constants/constants";
import {  ExpressionMaker, ExpressionsMaker, IFConditionExpressionMaker, OperandMaker, OutputAliasMaker } from "../models/breClass";
import * as OperationsUtil from "../util/OperationsUtil";
export class FinancialFieldList {

    public variable: string;
    public FIELD_NAME: string;
    public DISPLAY_NAME: string;
    public FIELD_TYPE: string;

    constructor(props?: FinancialFieldList) {

        this.variable = props.variable;
        this.FIELD_NAME = props.FIELD_NAME;
        this.DISPLAY_NAME = props.DISPLAY_NAME;
        this.FIELD_TYPE = props.FIELD_TYPE;

    }
}
