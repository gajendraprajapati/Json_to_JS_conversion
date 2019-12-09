import { ExpressionsMaker } from "./breClass";

export interface Operand {
    operand: any;
    operandType: string;
    operandDataType: string;
}

export interface OutputAlias {
    trueCase: Number | String | Expression | Operand|boolean |ExpressionsMaker | IFConditionExpression;
    falseCase: Number | String | Expression | Operand|boolean;
}

export interface IFConditionExpression {
    template: string;
    outputAlias: OutputAlias;
    expression: Expression;
}

export interface Expression {
    template: string;
    operator: string;
    operands: Array<Operand | IFConditionExpression | Expression | Expressions>;
}

export interface Expressions {
    template: string;
    expressions: Array<Expression | Expressions | IFConditionExpression>;
}
