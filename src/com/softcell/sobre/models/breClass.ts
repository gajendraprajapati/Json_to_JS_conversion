import { Expression, Expressions, IFConditionExpression, Operand, OutputAlias } from "./breModel";
import { Counter } from "./counter";

export class OperandMaker implements Operand {
    public operand: any;
    public operandType: string;
    public operandDataType: string;
    public dateType: string;

    constructor(operand: any, operandType: string, operandDataType: string, dateType?: string) {
        this.operand = operand;
        this.operandType = operandType;
        this.operandDataType = operandDataType;
        this.dateType = dateType;
    }
}

export class ExpressionMaker implements Expression {
    public UUID: any;
    public template: string;
    public operator: string;
    public operands: Array<Operand | Expressions | Expression | IFConditionExpression | any>;
    public sobreId: string | number;
    public name: string;
    public type: string;
    public parentId: string;
    public isComponent: string;

    constructor(template: string, operator: string, operands: Array<Operand | Expressions | Expression | IFConditionExpression>, sobreId: string | number = undefined, name: string = undefined, type: string = undefined, parentId: string = undefined, isComponent: string = undefined) {
        this.UUID = Counter.next;
        this.template = template;
        this.operator = operator;
        this.operands = operands;
        this.sobreId = sobreId;
        this.name = name;
        this.type = type;
        this.parentId = parentId;
        this.isComponent = isComponent;
    }
}

export class ExpressionsMaker implements Expressions {
    public UUID: any;
    public template: string;
    public expressions: Array<Expression | Expressions | IFConditionExpression>;
    public sobreId: string | number;
    public name: string;
    public type: string;
    public parentId: string;
    public isComponent: string;

    constructor(template: string, expressions: Array<Expression | Expressions | IFConditionExpression>, sobreId: string | number= undefined, name: string = undefined, type: string = undefined, parentId: string = undefined, isComponent: string = undefined) {
        this.UUID = Counter.next;
        this.template = template;
        this.expressions = expressions;
        this.sobreId = sobreId;
        this.name = name;
        this.type = type;
        this.parentId = parentId;
        this.isComponent = isComponent;
    }
}

export class OutputAliasMaker implements OutputAlias {
    public trueCase: Number | String | Expression | Operand|boolean | ExpressionsMaker | IFConditionExpressionMaker;
    public falseCase: Number | String | Expression | Operand|boolean;

    constructor(trueCase: Number | String | Expression | Operand |boolean | ExpressionsMaker | IFConditionExpressionMaker,
                 falseCase: Number | String | Expression | Operand|boolean) {
        this.trueCase = trueCase;
        this.falseCase = falseCase;
    }
}

export class IFConditionExpressionMaker implements IFConditionExpression {
    public UUID: any;
    public template: string;
    public outputAlias: OutputAlias;
    public expression: Expression;
    public sobreId: string | number;
    public name: string;
    public type: string;
    public parentId: string;
    public isComponent: string;

    constructor(template: string, outputAlias: OutputAlias, expression: Expression, sobreId: string | number = undefined, name: string = undefined, type: string = undefined, parentId: string = undefined, isComponent: string = undefined) {
        this.UUID = Counter.next;
        this.template = template;
        this.outputAlias = outputAlias;
        this.expression = expression;
        this.sobreId = sobreId;
        this.name = name;
        this.type = type;
        this.parentId = parentId;
        this.isComponent = isComponent;
    }
}
