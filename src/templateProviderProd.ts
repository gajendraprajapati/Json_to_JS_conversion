// TODO: Robustness
// 1.  create new helper checkAssignement and use like this{{operands.0.operand}}= {{operands.1.operand}};  =>  {{operands.0.operand}}= {{checkAssignement operands.1.operand}};
// It should generate code like p1 && p1.p2 && p1.p2.p3
// 2.   put try catch in each iffe fucntion(  return undefined in catch
// 3.   convert array operations to iffe function() and apply try catch

export class TemplateLibraryProd {

    private preSetup: string = `
        let outputObjIterator={};
        let expressionOutput={};
        let global={};
        match =[];
        global.variables={};
        let checks=[];
        let masterFields={};
        let curExecuteFunctionInstance;
        let _executeFuncCache={};
        analyticalField = {};

        let _paymentHistoryParseCache={};
        

        let parentExecuteFunctionInstance;
        const getInstitution = () => {
           return institutionId ? institutionId + ""  : "";
        };

        let idCount = 0;    
        const executeFunc=(func,id,obj)=>{
            if(obj){
                if(!obj.__brexId){
                    obj.__brexId=idCount++;
                }        
                if(_executeFuncCache[id] && _executeFuncCache[id][obj.__brexId]){
                    return _executeFuncCache[id][obj.__brexId];
                }
                if(!_executeFuncCache[id]){
                    _executeFuncCache[id]={};
                }
        
        
            }

            if(loanCoverageObj){
                if(!loanCoverageObj[id]){
                    loanCoverageObj[id]={}
                    loanCoverageObj[id].count=0;
                    //loanCoverageObj[id].funtion=func.toString();
                }
                loanCoverageObj[id].count+=1;
                curExecuteFunctionInstance=loanCoverageObj[id];
                const startTime = _.performance.now();
                let retVal= func();
                const endTime = _.performance.now();
                loanCoverageObj[id].executionTime=endTime-startTime;
                //curExecuteFunctionInstance=undefined;
                return retVal;
            }
        
            if(id.indexOf("___globalFunc__CUSTOM_FIELD")>-1){
        
                if(loanReqObj.__customFieldsCacheInContext && loanReqObj.__customFieldsCacheInContext[id] )
                {
                    return loanReqObj.__customFieldsCacheInContext[id];
                }
                let retVal= func();
                if(!loanReqObj.__customFieldsCacheInContext){
                    loanReqObj.__customFieldsCacheInContext={};
                }
                loanReqObj.__customFieldsCacheInContext[id]=retVal;
                return retVal;
            }
        
            if(id.indexOf("___globalFunc__")>-1){
                //const startTime = _.performance.now();
                let retVal= func();
                //const endTime = _.performance.now();
                //console.log("executeFunc performance ",id,endTime-startTime);
                if(obj){
                    if(!_executeFuncCache[id]){
                        _executeFuncCache[id]={};
                    }
                    _executeFuncCache[id][obj.__brexId]=retVal;
                }
                return retVal;
            }
        
        
        
        
            let retVal= func();
            if(obj){
                _executeFuncCache[id][obj.__brexId]=retVal;
            }
            return retVal;
        }

        const executeCond=(func,id)=>{

            if(curExecuteFunctionInstance){
                if(!curExecuteFunctionInstance.conditions){
                    curExecuteFunctionInstance.conditions={};
                }
                if(!curExecuteFunctionInstance.conditions[id]){
                    curExecuteFunctionInstance.conditions[id]={}
                    curExecuteFunctionInstance.conditions[id].count=0;
                    //loanCoverageObj[id].funtion=func.toString();
                }
                curExecuteFunctionInstance.conditions[id].count+=1
            }
            let retVal= func();
            return retVal;
        }

        const deepCopy = (obj) => {
            var clone = {};
            if(Array.isArray(obj)) {
                let retArr=[];
                for(var i = 0; i< obj.length; i++) {
                    retArr.push(deepCopy(obj[i]));
                }
                return retArr;
            } else if(obj instanceof Object) {
                for(var i in obj) {
                    if(obj[i] && obj[i] !== null && typeof(obj[i])=="object")
                        clone[i] = deepCopy(obj[i]);
                    else
                        clone[i] = obj[i];
                }
                return clone;
            }
            else
                return obj;
        };

        const dpdPaymentHistory = (obj, defaultPaymentHistory) => {
            if(defaultPaymentHistory == "paymentHistory" || defaultPaymentHistory == "paymentHistory1" || defaultPaymentHistory == "paymentHistory2") {
                let hist = obj.paymentHistory;
                let hist1 = obj.paymentHistory1;
                let hist2 = obj.paymentHistory2;
                if(hist1 && hist2 && hist1.length > 0 && hist2.length > 0)
                    return hist1 + "" + hist2;
                else if(hist1 && hist1.length > 0 && (!hist2 || hist2.length == 0))
                    return hist1;
                else if(hist2 && hist2.length > 0 && (!hist1 || hist1.length == 0))
                    return hist2;
            }
            return obj[defaultPaymentHistory];
        };

        const dpdValue = (dpdVal, isNotConvert) => {
            dpdVal = dpdVal ? dpdVal.toUpperCase() : "";
            let institutionId = getInstitution().substring(0, 4);
            if(isNotConvert) 
                return dpdVal;
            if(dpdVal == "SUB" && ("4046" == institutionId || "4013" == institutionId || "1111" == institutionId ) )
                return 210;
            if(dpdVal == "SUB")
                return 91;
            if(dpdVal == "DBT")
                return 181;
            if(dpdVal == "SMA")
                return 31;
            if(dpdVal == "LSS")
                return 181;
            if(dpdVal == "0-1" || dpdVal == "O-1")
               return -1;
            if (!isNaN(parseInt(dpdVal)))
                return Number(dpdVal);          
            return NaN;                                                   
        };

        const convertThreeDigitNumericStringToNumbers = (str, isNotConvert) => {
            if(Array.isArray(str))
                return str;
            else {
                let arrChar=str.split('');
                let grpChar=[];
                let tmpStr="";
                for(let i=0;i<arrChar.length;i++){
                    tmpStr=tmpStr+arrChar[i];
                    if(tmpStr.length==3) {
                        grpChar.push( dpdValue(tmpStr, isNotConvert) );
                        tmpStr="";
                    }
                }
                let retVal=grpChar;
               return retVal;
            }
        };

        const getDFSObject = (obj, path) => {
            let paths = path.split(".");
            let curlink = obj;

            paths.forEach((path,index) => {

                if (!curlink[path]) {
                    curlink[path] = {};
                }
                curlink = curlink[path];
            });
            return curlink;
        };

        const getValueFromPath = (obj, path) => {
            let paths = path.split(".").map(x => x.trim());
            if(paths.length == 1){
                return obj
            }
            let splittedPath = paths.slice(1, paths.length);
            return _.get(obj, splittedPath.join("."), " ");
        };

        const getNumberFromPath = (obj, path) => {
            let paths = path.split(".").map(x => x.trim());
            if(paths.length == 1){
                return obj
            }
            let splittedPath = paths.slice(1, paths.length);
            let value = _.get(obj, splittedPath.join("."), " ");

            if(!isNaN(parseInt(value)))
                return value;

            return value.trim().length == 0 ? NaN : value;
        };
    `
    ;

    private main: string = `
    {{#each breJsonArray}}
        {{> expressions}}
    {{/each}}
    `;
    private funcPartialIfExpressionMutualExculsive: string = `    
    function()
    {  
        try {
            let expValue;
            {{#each this.expressions}}      
                {{#if_eq this.template "STATEMENT"}}
                    {{>operandsExp this}};
                {{/if_eq}}              
                               
                {{#if_not_eq this.template "STATEMENT"}}
                    expValue={{>operandsExp this.expression}};
                    if(expValue)
                    {                
                        {{#if_eq this.outputAlias.trueCase.operandType "field" }}
                            return {{this.outputAlias.trueCase.operand}};
                        {{/if_eq}}
                        
                        {{#if_not_eq this.outputAlias.trueCase.operandType "field" }}
                            {{#if this.outputAlias.trueCase.template }}
                                return ({{>operandsExp this.outputAlias.trueCase}});
                            {{else}}
                                {{#if outputAlias.trueCase.operandDataType}}
                                    {{#if_eq outputAlias.trueCase.operandDataType "number" }}
                                         return (_.Number("{{outputAlias.trueCase.operand}}"));
                                    {{/if_eq}}
                                    {{#if_not_eq outputAlias.trueCase.operandDataType "number" }}
                                        {{#if_eq outputAlias.trueCase.operandDataType "object" }}
                                             return {{outputAlias.trueCase.operand}};
                                        {{/if_eq}}
                                        {{#if_not_eq outputAlias.trueCase.operandDataType "object" }}
                                             return ("{{outputAlias.trueCase.operand}}");
                                        {{/if_not_eq}}
                                    {{/if_not_eq}}
                                {{else}}
                                    return "{{outputAlias.trueCase}}";
                                {{/if}}
                            {{/if}}
                        {{/if_not_eq}}
                     }
                {{/if_not_eq}}                 
            {{/each}}
        }
        catch(err){
            console.log("Error in function execution:" + " {{UUID}} " + err);
        }
    }`;


    private ifExpressionsMutualExlusive: string = `    
    executeFunc({{include 'funcPartialIfExpressionMutualExculsive'}})`;

    private mutualExpForFunctionTemplate: string = `    
    executeFunc( function()
    {
        try {
            let expValue;
            {{#each this.expressions}}
                {{#if_eq this.template "STATEMENT"}}
                    {{>operandsExp this}};
                {{/if_eq}}

                {{#if_not_eq this.template "STATEMENT"}}
                    expValue={{>operandsExp this.expression}};
                    if(expValue)
                    {
                        {{#if_eq this.outputAlias.trueCase.operandType "field" }}
                            return {{this.outputAlias.trueCase.operand}};
                        {{/if_eq}}

                        {{#if_not_eq this.outputAlias.trueCase.operandType "field" }}
                            {{#if this.outputAlias.trueCase.template }}
                                return ({{>operandsExp this.outputAlias.trueCase}});
                            {{else}}
                                {{#if outputAlias.trueCase.operandDataType}}
                                    {{#if_eq outputAlias.trueCase.operandDataType "number" }}
                                         return (_.Number("{{outputAlias.trueCase.operand}}"));
                                    {{/if_eq}}
                                    {{#if_not_eq outputAlias.trueCase.operandDataType "number" }}
                                         return ("{{outputAlias.trueCase.operand}}");
                                    {{/if_not_eq}}
                                {{else}}
                                    return "{{outputAlias.trueCase}}";
                                {{/if}}
                            {{/if}}
                        {{/if_not_eq}}
                     }
                {{/if_not_eq}}
            {{/each}}
        }
        catch(err){
            console.log("Error in function execution:" + " {{UUID}} " + err);
        }
    },"{{HYPERUUID}}",obj)`;
    private assignAndReturnExpressions: string = `    
    executeFunc({{include 'funcPartialAssignAndReturnExpressions'}})`;


    private funcPartialAssignAndReturnExpressions: string = `
    function()
            {  
                try {
                    let expValue={{>operandsExp this.operands.[1]}};
                    {{operands.0.operand}} {{operator}} expValue;

                     {{#each operands}}
                         {{#if_not_eq @index 0}}
                            {{#if_not_eq @index 1}}
                                {{> statement}}
                            {{/if_not_eq}}
                         {{/if_not_eq}}
                     {{/each}}

                    return expValue;
                }
                catch(err){
                    console.log("Error in function execution:" + " {{UUID}} " + err);
                    return undefined;
                }
            }`;
    
    private ifExpressions: string = `    
    executeFunc({{include 'funcPartialIfExpressions'}})`;

    private ifExpForFunctionTemplate: string = `
    
    executeFunc( function()
        {
            try {
                let functionid="{{UUID}}";
                let expValue={{>operandsExp this.expression}};
                if(expValue)
                {
                    {{#if_eq this.outputAlias.trueCase.operandType "field" }}
                        return {{this.outputAlias.trueCase.operand}};
                    {{/if_eq}}

                    {{#if_not_eq this.outputAlias.trueCase.operandType "field" }}
                        {{#if this.outputAlias.trueCase.template }}
                            return ({{>operandsExp this.outputAlias.trueCase}})
                        {{else}}
                            {{#if_eq this.outputAlias.trueCase.operandDataType "number" }}
                                return {{outputAlias.trueCase.operand}};
                            {{/if_eq}}
                            {{#if_not_eq this.outputAlias.trueCase.operandDataType "number" }}
                                return "{{outputAlias.trueCase}}";
                            {{/if_not_eq}}
                        {{/if}}
                    {{/if_not_eq}}
                }
                else
                {
                    {{#if_eq this.outputAlias.falseCase.operandType "field" }}
                        return {{this.outputAlias.falseCase.operand}};
                    {{/if_eq}}

                    {{#if_not_eq this.outputAlias.falseCase.operandType "field" }}
                        {{#if this.outputAlias.falseCase.template }}
                            return {{>operandsExp this.outputAlias.falseCase}}
                        {{else}}
                            return "{{outputAlias.falseCase}}";
                        {{/if}}
                    {{/if_not_eq}}
                }
            }
            catch(err){
                console.log("Error in function execution:" + " {{UUID}} :" + err);
                return undefined;
            }
        },"{{HYPERUUID}}",obj)`;

    private funcPartialIfExpressions: string = `
    
    function()
        {  
            try {
                let functionid="{{UUID}}";
                let expValue={{>operandsExp this.expression}};
                if(expValue)
                {    
                    {{#if_eq this.outputAlias.trueCase.operandType "field" }}
                        return {{fullProofObject this.outputAlias.trueCase.operand}};
                    {{/if_eq}}
                
                    {{#if_not_eq this.outputAlias.trueCase.operandType "field" }}
                        {{#if this.outputAlias.trueCase.template }}
                            return ({{>operandsExp this.outputAlias.trueCase}})
                        {{else}}
                            {{#if_eq this.outputAlias.trueCase.operandDataType "number" }}
                                return {{outputAlias.trueCase.operand}};
                            {{/if_eq}}
                            {{#if_not_eq this.outputAlias.trueCase.operandDataType "number" }}
                                return "{{outputAlias.trueCase}}";
                            {{/if_not_eq}}       
                        {{/if}}
                    {{/if_not_eq}}             
                }
                else 
                {    
                    {{#if_eq this.outputAlias.falseCase.operandType "field" }}
                        return {{fullProofObject this.outputAlias.falseCase.operand}};
                    {{/if_eq}}
                
                    {{#if_not_eq this.outputAlias.falseCase.operandType "field" }}
                        {{#if this.outputAlias.falseCase.template }}
                            return {{>operandsExp this.outputAlias.falseCase}}
                        {{else}}
                            {{#if_eq outputAlias.falseCase.operandDataType "number" }}
                                return {{outputAlias.falseCase.operand}};
                            {{/if_eq}}
                            {{#if_not_eq outputAlias.falseCase.operandDataType "number" }}
                                return "{{safeString outputAlias.falseCase}}";
                            {{/if_not_eq}}
                        {{/if}}
                    {{/if_not_eq}}             
                }   
            }
            catch(err){
                console.log("Error in function execution:" + " {{UUID}} " + err);
                return undefined;
            }
        }`;

    private operandsExp: string = `
    {{>operandsExpInner}}
    `;

    private operandsExpInner: string = `
    {{#if_eq this.template "SIMPLE_OPERATION" }}
        {{> simpleoperation}}
    {{/if_eq}}
    
    {{#if_eq this.template "ARRAY_OPERATION"}}
        ({{> arrayoperation}})
    {{/if_eq}}

    {{#if_eq this.template "MULTI_ARRAY_OPERATION"}}
        ({{> mutliArrayOperation}})
    {{/if_eq}}

    {{#if_eq this.template "INTERSECTION_OPERATION" }}
        ({{> arrayintersectionoperation2}})
    {{/if_eq}}
    
    {{#if_eq this.template "INTERSECTION_OPERATION_MULTI_ARRAY" }}
        {{> arrayintersectionoperationmultiarray}}
    {{/if_eq}}        

    {{#if_eq this.template "ARRAY_THREE_DIGIT_NUMERIC_STRING_TO_NUMBERS_OPERATION" }}
        ({{> arrayThreeDigitNumericStringToNumbersOperation}})
    {{/if_eq}}

    {{#if_eq this.template "ARRAY_THREE_DIGIT_DATE_TO_DATE_OPERATION" }}
        ({{> arrayThreeDigitDateToDateOperation}})
    {{/if_eq}}

    {{#if_eq this.template "STRING_OPERATION"}}
        {{#if_eq this.operands.length 2}}
            {{#if_eq this.operands.1.operandType "field" }}
                (_.{{operator}}( {{fullProofObject operands.0.operand}},{{fullProofObject operands.1.operand}}))
            {{/if_eq}}

            {{#if_eq this.operands.1.operandType "value" }}
                (_.{{operator}}(new String( {{fullProofObject operands.0.operand}}), "{{operands.1.operand}}"))
            {{/if_eq}}
        {{/if_eq}}
    {{/if_eq}}

   {{#if_eq this.template "NUMBER_OPERATION"}}
        {{#if_eq this.operands.length 2}}
            {{#if operands.0.template}}
                {{#if_eq this.operands.1.operandType "field" }}
                    ({{>operandsExp operands.[0]}} {{operator}} _.Number( {{fullProofObject operands.1.operand}}))
                {{/if_eq}}

                {{#if_not_eq this.operands.1.operandType "field" }}
                    ({{>operandsExp operands.[0]}} {{operator}} _.Number("{{operands.1.operand}}"))
                {{/if_not_eq}}
            {{/if}}

            {{#unless operands.0.template}}
                {{#unless operands.1.template}}
                    {{#if_eq this.operands.0.operandType "field" }}
                        {{#if_eq this.operands.1.operandType "field" }}
                            (_.Number( {{fullProofObject operands.0.operand}}) {{operator}} ({{fullProofObject operands.1.operand}}))
                        {{/if_eq}}                        
                        {{#if_not_eq this.operands.1.operandType "field" }}
                            (_.Number( {{fullProofObject operands.0.operand}}) {{operator}} _.Number("{{operands.1.operand}}"))
                        {{/if_not_eq}}
                    {{/if_eq}}

                    {{#if_not_eq this.operands.0.operandType "field" }}
                        {{#if_eq this.operands.1.operandType "field" }}
                            (_.Number({{operands.0.operand}}) {{operator}} ({{fullProofObject operands.1.operand}}))
                        {{/if_eq}}                        
                        {{#if_not_eq this.operands.1.operandType "field" }}
                            (_.Number({{operands.0.operand}}) {{operator}} _.Number("{{operands.1.operand}}"))
                        {{/if_not_eq}}
                    {{/if_not_eq}}
                {{/unless}}

                {{#if operands.1.template}}
                    {{#if_eq this.operands.0.operandType "field" }}
                        (_.Number({{fullProofObject operands.0.operand}}) {{operator}} {{>operandsExp operands.[1]}})
                    {{/if_eq}}

                    {{#if_not_eq this.operands.0.operandType "field" }}
                        (_.Number("{{operands.0.operand}}") {{operator}} {{>operandsExp operands.[1]}})
                    {{/if_not_eq}}
                {{/if}}
            {{/unless}}
        {{/if_eq}}

        {{#if_eq this.operands.length 3}}
            (_.{{operator}}({{fullProofObject operands.1.operand}}, {{operands.0.operand}}, {{operands.2.operand}}))
        {{/if_eq}}
    {{/if_eq}}

   {{#if_eq this.template "DATE_OPERATION"}}
        {{#if_eq this.operands.length 2}}
            {{#if_eq this.operands.1.operandType "field" }}
                (_.{{operator}}(_.stringToDate({{fullProofObject operands.0.operand}}, "{{operands.0.dateType}}"), _.stringToDate({{fullProofObject operands.1.operand}}, "{{operands.1.dateType}}")))
            {{/if_eq}}
            {{#if_eq this.operands.1.operandType "value" }}
                (_.{{operator}}(_.stringToDate({{fullProofObject operands.0.operand}}, "{{operands.0.dateType}}"), _.stringToDate("{{operands.1.operand}}", "{{operands.1.dateType}}")))
            {{/if_eq}}
        {{/if_eq}}

        {{#if_eq this.operands.length 3}}
            (_.{{operator}}(_.stringToDate({{fullProofObject operands.1.operand}}, "{{operands.1.dateType}}"), _.stringToDate("{{operands.0.operand}}", "{{operands.0.dateType}}"), _.stringToDate("{{operands.2.operand}}", "{{operands.2.dateType}}")))
        {{/if_eq}}
    {{/if_eq}}

    {{#if_eq this.template "IF_COND"}}
        ({{> ifExpressions }})
    {{/if_eq}}

    {{#if_eq this.template "ASSIGN_AND_RETURN"}}
        ({{> assignAndReturnExpressions }})
    {{/if_eq}}

    {{#if_eq this.template "MUTUAL_EXCLUSIVE_EXPRESSIONS"}}
        ({{> ifExpressionsMutualExlusive }})
    {{/if_eq}}

    {{#if_eq this.template "STATEMENT"}}
        {{#each this.operands}}

            {{#if @first}}
            (
            {{/if}}

            {{#unless this.operands}}
                {{#if @last}}
                    {{#if_eq this.operandDataType "string"  }}
                        "{{operand}}"
                    {{/if_eq}}
                   {{#if_eq this.operandDataType "number"  }}
                        {{#if_eq this.operandType "value"  }}
                            _.Number("{{operand}}")
                        {{/if_eq}}    
                        {{#if_not_eq this.operandType "value"  }}
                            _.Number({{operand}})
                        {{/if_not_eq}}                            
                    {{/if_eq}}
                    {{#if_not_eq this.operandDataType "string"  }}
                        {{#if_not_eq this.operandDataType "number"  }}
                            {{operand}}
                        {{/if_not_eq}}    
                    {{/if_not_eq}}
                    {{#if this.template }}
                        {{>operandsExp}}
                    {{/if}}
                {{/if}}

                {{#unless  @last}}
                    {{#if_eq ../operator "=" }}
                        {{operand}} 
                    {{/if_eq}}
                    {{#if_not_eq ../operator "=" }}
                        {{#if_eq this.operandType "field"}}
                            {{fullProofObject operand}}
                        {{/if_eq}}
                        {{#if_not_eq this.operandType "field"  }}
                            {{operand}} 
                        {{/if_not_eq}}
                    {{/if_not_eq}}    
                    {{../operator}}
                {{/unless }}

            {{/unless}}

            {{#if this.operands }}

                    {{>operandsExp}}
                    {{#unless  @last}}
                        {{../operator}}
                    {{/unless }}

            {{/if}}

            {{#if @last}}
            )
            {{/if}}
        {{/each}}
        {{#if_eq this.operator "=" }}
            ;
        {{/if_eq}}
    {{/if_eq}}
    `;

    private function: string = `
        {{#if_eq this.operator "=" }}
            {{this.operands.0.operand}} = (obj) => {
               return ({{#if_eq this.operands.1.template "IF_COND"}}
                    {{> ifExpForFunctionTemplate this.operands.[1]}}
                {{/if_eq}}
                {{#if_eq this.operands.1.template "MUTUAL_EXCLUSIVE_EXPRESSIONS"}}
                    {{> mutualExpForFunctionTemplate this.operands.[1]}}
                {{/if_eq}})            
            }
        {{/if_eq}}
    `;

    private tradeExecution : string = `
        {{#if_eq this.operator "=" }}
            {{this.operands.0.operand}} = (obj) => {
                return ({{#if_eq this.operands.1.template "IF_COND"}}
                {{> ifExpressionForTradeExecution this.operands.[1]}}
            {{/if_eq}}
                {{#if_eq this.operands.1.template "MUTUAL_EXCLUSIVE_EXPRESSIONS"}}
                    {{> mutualExpForFunctionTemplate this.operands.[1]}}
                {{/if_eq}})            
            }
        {{/if_eq}}
            `;

    private ifExpressionForTradeExecution: string = `
    
        executeFunc( function()
            {
                try {
                    let functionid="{{UUID}}";
                    let expValue={{>operandsExp this.expression}};
                    if(expValue)
                    {
                        {{#if this.outputAlias.trueCase.template }}
                            ({{>expressions this.outputAlias.trueCase}})
                        {{/if}}
                    }
                    else
                    {
                        {{#if_eq this.outputAlias.falseCase.operandType "field" }}
                            return {{this.outputAlias.falseCase.operand}};
                        {{/if_eq}}
    
                        {{#if_not_eq this.outputAlias.falseCase.operandType "field" }}
                            {{#if this.outputAlias.falseCase.template }}
                                return {{>operandsExp this.outputAlias.falseCase}}
                            {{else}}
                                return "{{outputAlias.falseCase}}";
                            {{/if}}
                        {{/if_not_eq}}
                    }
                }
                catch(err){return undefined;}
            },"{{UUID}}")`;

    private statement: string = `
    {{#if_eq this.operator "=" }}
        {{#if_eq this.operands.0.operandType "field" }}
            {{#unless this.operands.1.template }}
                {{#if_eq this.operands.1.operandType "value" }}
                    {{#if_eq this.operands.1.operandDataType "number" }}
                        {{operands.0.operand}}= _.Number("{{operands.1.operand}}");
                    {{/if_eq}}
                    {{#if_eq this.operands.1.operandDataType "object" }}
                        {{operands.0.operand}}= {{JSONstringify operands.1.operand}};
                    {{/if_eq}}
                    {{#if_eq this.operands.1.operandDataType "array" }}
                        {{operands.0.operand}}= {{JSONstringify operands.1.operand}};
                    {{/if_eq}}
                    {{#if_eq this.operands.1.operandDataType "string" }}
                        {{operands.0.operand}}= "{{operands.1.operand}}";
                    {{/if_eq}}
                {{/if_eq}}
                {{#if_eq this.operands.1.operandType "field" }}
                        {{#if_eq this.operands.1.operandDataType "custom" }}
                            {{operands.0.operand}}=function(){try { return {{operands.1.operand}} }  catch (err) {  }}();
                        {{/if_eq}}
                        {{#if_not_eq this.operands.1.operandDataType "custom"}}
                            {{#if_eq this.operands.1.operandDataType "number" }}
                                {{operands.0.operand}}= _.Number({{fullProofObject operands.1.operand}});
                            {{/if_eq}}
                            {{#if_not_eq this.operands.1.operandDataType "number" }}
                                {{operands.0.operand}}= {{fullProofObject operands.1.operand}};
                            {{/if_not_eq}}
                        {{/if_not_eq}}                                                
                {{/if_eq}}
            {{/unless}}

            {{#if_eq this.operands.1.template "IF_COND"}}
                {{operands.0.operand}}= {{> ifExpressions this.operands.[1]}};
            {{/if_eq}}
            {{#if_eq this.operands.1.template "MUTUAL_EXCLUSIVE_EXPRESSIONS"}}
                {{operands.0.operand}}= {{> ifExpressionsMutualExlusive this.operands.[1]}};
            {{/if_eq}}

            {{#if this.operands.1.operands}}
                {{>operandsExp }}
            {{/if}}
        {{/if_eq}}
    {{/if_eq}}

    {{#if_not_eq this.operator "=" }}
           {{#each this.operands.1.operand.expressions}}
                {{> expressions}}
            {{/each}}
    {{/if_not_eq}}
    `;

    private arrayintersectionoperation: string = `
      ( _.{{operator}}
       (
       {{#each operands}}
            {{#if this.template}}
                {{>operandsExp}}
            {{/if}}

            {{#unless this.template}}
                {{#if_eq this.operandType "field" }}
                     {{fullProofObject this.operand}}
                {{/if_eq}}            
                {{#if_not_eq this.operandType "field" }}
                     {{this.operand}}
                {{/if_not_eq}}
            {{/unless}}
            {{#unless @last}}
            ,
            {{/unless}}
        {{/each}}
       ))
    `;

    private processInnerInterSection: string = `
    {{#if_eq template "INTERSECTION_OPERATION"}}
        ({{#each operands}}
            {{#if @first}}
                {{>operandsExp operands.[1]}}
            {{/if}}
            {{#unless @first}}
                {{#if_eq ../operator "intersection"}}
                    &&
                {{/if_eq}}
                {{#if_eq ../operator "union"}}
                    ||
                {{/if_eq}}
                {{>operandsExp operands.[1]}}
            {{/unless}}
        {{/each}})
    {{/if_eq}}
    {{#if_not_eq template "INTERSECTION_OPERATION"}}
        {{#if_eq template "ARRAY_OPERATION"}}
            {{>operandsExp operands.[1]}}
        {{/if_eq}}
        {{#if_not_eq template "ARRAY_OPERATION"}}
            {{>operandsExp}}
        {{/if_not_eq}}                    
    {{/if_not_eq}}
    `;

    private arrayintersectionoperation2: string = `(
        {{#if_eq operator "concat"}}
            {{>arrayintersectionoperation }}
        {{/if_eq}}

        {{#if_eq operator "zip"}}
            {{>arrayintersectionoperation }}
        {{/if_eq}}

        {{#if_not_eq operator "concat"}}
            {{#if_not_eq operator "zip"}}
                {{#each operands}}
                    {{#if @first}}
                        _.filter(
                            {{#if_eq template "INTERSECTION_OPERATION"}}
                                {{fullProofObject operands.0.operands.0.operand }}  
                            {{/if_eq}}
                            {{#if_not_eq template "INTERSECTION_OPERATION"}}
                                {{fullProofObject operands.0.operand}}  
                            {{/if_not_eq}}
                            , function(obj){
                            return (
                                    {{>processInnerInterSection}}
                    {{/if}}

                    {{#unless @first}}
                        {{#if_eq ../operator "intersection"}}
                            &&
                        {{/if_eq}}
                        {{#if_eq ../operator "union"}}
                            ||
                        {{/if_eq}}
                        {{>processInnerInterSection}}
                    {{/unless}}

                    {{#if @last}}
                        )})
                    {{/if}}
                 {{/each}}
             {{/if_not_eq}}
         {{/if_not_eq}}
        )`;

    private arrayintersectionoperationmultiarray: string = `(
        {{#each operands}}
            {{#if @first}}
                _.some(
                    {{#if_eq template "INTERSECTION_OPERATION"}}
                        {{fullProofObject operands.0.operands.0.operand }}  
                    {{/if_eq}}
                    {{#if_not_eq template "INTERSECTION_OPERATION"}}
                        {{fullProofObject operands.0.operand}}  
                    {{/if_not_eq}}
                    , function(obj){
                    return (
                            {{>processInnerInterSection}}
            {{/if}}

            {{#unless @first}}
                {{#if_eq ../operator "intersection"}}
                    &&
                {{/if_eq}}
                {{#if_eq ../operator "union"}}
                    ||
                {{/if_eq}}
                {{>processInnerInterSection}}
            {{/unless}}

            {{#if @last}}
                )})
            {{/if}}
         {{/each}}
        )`;

    private arrayThreeDigitDateToDateOperation: string = `
    executeFunc( function(){
            try {
                let modifiedArr;
                {{#if_not_eq operands.2.operand 'true'}}
                    modifiedArr = ({{fullProofObject operands.3.operand}}) || [];
                    modifiedArr.forEach(elem => {
                        let paymentHistory = dpdPaymentHistory(elem, "{{operands.1.operand}}");
                        elem.{{operands.0.operand}} = convertThreeDigitNumericStringToNumbers(paymentHistory, false);
                        let count = elem.{{operands.0.operand}}.length;
                        elem.paymentHistoryDateRanges = (_.dateRangeByEndDate(count, _.stringToDate(elem.{{operands.4.operand}}, "{{operands.4.dateType}}"))).reverse();
                    });
                {{/if_not_eq}}
                {{#if_eq operands.2.operand 'true'}}
                    modifiedArr = obj;
                    let paymentHistory = dpdPaymentHistory(modifiedArr, "{{operands.1.operand}}");
                    modifiedArr.{{operands.0.operand}} = convertThreeDigitNumericStringToNumbers(paymentHistory, false);
                    let count = modifiedArr.{{operands.0.operand}}.length;
                    modifiedArr.paymentHistoryDateRanges = _.dateRangeByEndDate(count, _.stringToDate(modifiedArr.{{operands.4.operand}}, "{{operands.4.dateType}}")).reverse();
                {{/if_eq}}
                return modifiedArr
            }
            catch(err){
                console.log("Error in function execution:" + " {{UUID}} " + err);
                return undefined;
            }
        },"{{UUID}}"
        )`;

    // private arrayThreeDigitNumericStringToNumbersOperation: string = `    
    // executeFunc({{include 'funcPartialArrayThreeDigitNumericStringToNumbersOperation'}})`;

    private arrayThreeDigitNumericStringToNumbersOperation: string = `
    executeFunc( function(){
            try {
                let modifiedArr;
                {{#if_eq operands.length 9}}
                    modifiedArr = ({{fullProofObject operands.0.operand}}) || [];
                    modifiedArr.forEach(elem => {
                        let paymentStartDate;
                        {{#if_eq operands.5.operand "DIFF-MONTH-RECENT"}}
                            let date = _.stringToDate(elem.{{operands.7.operand}}, "{{operands.7.dateType}}").getDate();
                            let currentDate = new Date();
                            currentDate.setDate(date);
                            paymentStartDate = _.getDateMonthsBefore(currentDate, 1);
                        {{/if_eq}}
                        {{#if_not_eq operands.5.operand "DIFF-MONTH-RECENT"}}
                            paymentStartDate = _.stringToDate(elem.{{operands.7.operand}}, "{{operands.7.dateType}}");
                        {{/if_not_eq}}
                        let paymentHistory = dpdPaymentHistory(elem, "{{operands.6.operand}}");
                        let isNotConvertDPD = {{operands.8.operand}};
                        let dpdValueKey = "DPDValue" + "{{operands.6.operand}}" + paymentHistory + paymentStartDate.valueOf() + isNotConvertDPD;
                        let dpdDateKey = "DPDDate" + "{{operands.6.operand}}" + paymentHistory + paymentStartDate.valueOf() + isNotConvertDPD;
                        elem.paymentHistoryDateRanges = [];
                        let paymentHistoryDateRanges = [];  
                        
                        let isDPDProcessed = "isDPDProcessed" + "{{operands.6.operand}}" + paymentStartDate.valueOf() + isNotConvertDPD;
                        if(elem[isDPDProcessed]) {
                            paymentHistoryDateRanges = elem[dpdDateKey];
                            elem.{{operands.1.operand}} = elem[dpdValueKey];                        
                        } else {
                            elem[isDPDProcessed] = true;
                            let diff = _.dateDiffMonth(paymentStartDate, _.stringToDate(elem.{{operands.7.operand}}, "{{operands.7.dateType}}"));
                            let dpdValue = convertThreeDigitNumericStringToNumbers(paymentHistory, isNotConvertDPD);
                            for (let i = 0; i < diff; i++)
                                dpdValue.unshift(NaN);
                            elem[dpdValueKey] = dpdValue;    
                            elem.{{operands.1.operand}} = dpdValue;
                            let count = dpdValue.length;
                            let dpdDate = (_.dateRangeByEndDate(count, paymentStartDate)).reverse();
                            elem[dpdDateKey] = dpdDate;
                            paymentHistoryDateRanges = dpdDate;
                        }
                        paymentHistoryDateRanges = paymentHistoryDateRanges.slice({{operands.2.operand}}, {{operands.3.operand}});
                        elem.{{operands.1.operand}} = elem.{{operands.1.operand}}.slice({{operands.2.operand}}, {{operands.3.operand}});
                        elem.{{operands.1.operand}} = elem.{{operands.1.operand}}.filter( function(c, index) {
                            result = (
                                {{#if_not_eq operands.4.operands.length 0}}
                                    {{#each operands.4.operands}}
                                        {{#each operands}} c {{../operator}} dpdValue("{{operand}}", isNotConvertDPD) {{/each}}
                                        {{#unless @last}} {{../operands.4.operator}} {{/unless}}
                                    {{/each}}                            
                                {{/if_not_eq}}
                                {{#if_eq operands.4.operands.length 0}}
                                    true
                                {{/if_eq}}
                            );
                        
                            if(result)
                                elem.paymentHistoryDateRanges.push(paymentHistoryDateRanges[index]);
                            return result
                        } );
                    });
                {{/if_eq}}
                {{#if_eq operands.length 8}}
                    modifiedArr = obj;
                    let paymentStartDate;
                    {{#if_eq operands.4.operand "DIFF-MONTH-RECENT"}}
                        let date = _.stringToDate(modifiedArr.{{operands.6.operand}}, "{{operands.6.dateType}}").getDate();
                        let currentDate = new Date();
                        currentDate.setDate(date);
                        paymentStartDate = _.getDateMonthsBefore(currentDate, 1);
                    {{/if_eq}}
                    {{#if_not_eq operands.4.operand "DIFF-MONTH-RECENT"}}
                        paymentStartDate = _.stringToDate(modifiedArr.{{operands.6.operand}}, "{{operands.6.dateType}}");
                    {{/if_not_eq}}
                    let paymentHistory = dpdPaymentHistory(modifiedArr, "{{operands.5.operand}}");
                    let isNotConvertDPD = {{operands.7.operand}};
                    let dpdValueKey = "DPDValue" + "{{operands.5.operand}}" + paymentHistory + paymentStartDate.valueOf() + isNotConvertDPD;
                    let dpdDateKey = "DPDDate" + "{{operands.5.operand}}" + paymentHistory + paymentStartDate.valueOf() + isNotConvertDPD;
                    modifiedArr.paymentHistoryDateRanges = [];
                    let paymentHistoryDateRanges = [];

                    let isDPDProcessed = "isDPDProcessed" + "{{operands.5.operand}}" + paymentStartDate.valueOf() + isNotConvertDPD;
                    if(modifiedArr[isDPDProcessed]) {
                        paymentHistoryDateRanges = modifiedArr[dpdDateKey];
                        modifiedArr.{{operands.0.operand}} = modifiedArr[dpdValueKey];
                    } else {
                        modifiedArr[isDPDProcessed] = true;
                        let diff = _.dateDiffMonth(paymentStartDate, _.stringToDate(modifiedArr.{{operands.6.operand}}, "{{operands.6.dateType}}"));
                        let dpdValue = convertThreeDigitNumericStringToNumbers(paymentHistory, isNotConvertDPD);
                        for(let i = 0; i< diff; i++)
                            dpdValue.unshift(NaN);
                        modifiedArr[dpdValueKey] = dpdValue;
                        modifiedArr.{{operands.0.operand}} = dpdValue;
                        let count = dpdValue.length;
                        let dpdDate = _.dateRangeByEndDate(count, paymentStartDate).reverse();
                        modifiedArr[dpdDateKey] = dpdDate;
                        paymentHistoryDateRanges = dpdDate;
                    }
                    paymentHistoryDateRanges = paymentHistoryDateRanges.slice({{operands.1.operand}}, {{operands.2.operand}});
                    modifiedArr.{{operands.0.operand}} = modifiedArr.{{operands.0.operand}}.slice({{operands.1.operand}}, {{operands.2.operand}});
                    modifiedArr.{{operands.0.operand}} = modifiedArr.{{operands.0.operand}}.filter(function(c, index) {
                        result = (
                            {{#if_not_eq operands.3.operands.length 0}}
                                {{#each operands.3.operands}}
                                    {{#each operands}} c {{../operator}} dpdValue("{{operand}}", isNotConvertDPD) {{/each}}
                                    {{#unless @last}} {{../operands.3.operator}} {{/unless}}
                                {{/each}}                            
                            {{/if_not_eq}}
                            {{#if_eq operands.3.operands.length 0}}
                                true                          
                            {{/if_eq}}
                        );
                        if (result)
                            modifiedArr.paymentHistoryDateRanges.push(paymentHistoryDateRanges[index]);
                        return result
                    });
                {{/if_eq}}
                return modifiedArr
            }
            catch(err){
                console.log("Error in function execution:" + " {{UUID}} " + err);
                return undefined;
            }
        },"{{UUID}}"
        )`;

    private arrayoperationOnlyCondition: string = `
        {{#if_eq this.operands.length 3}}
            {{operands.1.operand}}=="{{operands.2.operand}}"
        {{/if_eq}}

        {{#if_eq this.operands.length 2}}
            {{#if this.operands.0.template}}
                ({{>operandsExp operands.[1]}})
            {{/if}}

            {{#unless this.operands.0.template}}
                {{#if this.operands.1.template}}
                     ({{>operandsExp operands.[1]}})
                {{/if}}
            {{/unless}}
        {{/if_eq}}
        `;

    private mutliArrayOperation : string =`
    (_.matchTwoArray({{>operandsExp this.operands.[0]}},{{>operandsExp this.operands.[1]}}, "{{operator}}"))
    `;

    private simpleoperation: string = `
        _.{{operator}}( {{fullProofObject operands.0.operand}} )
    `;

    private arrayoperation: string = `
    {{#if_eq operator "push"}}
        {{#unless operands.1.template }}
            {{operands.0.operand}}.{{operator}}(deepCopy({{operands.1.operand}}))
        {{/unless}}
        {{#if operands.1.template }}
            {{operands.0.operand}}.{{operator}}(deepCopy({{>expressionsWithIIFE this.operands.[1]}}))
        {{/if}}
    {{/if_eq}}

    {{#if_eq this.operands.length 3}}
        _.{{operator}}( {{fullProofObject operands.0.operand}}, function(obj){ 
            return {{operands.1.operand}}=="{{operands.2.operand}}"
        })
    {{/if_eq}}

    {{#if_not_eq operator "push"}}
        {{#if_eq this.operands.length 2}}
            {{#if this.operands.0.template}}
                _.{{operator}}({{>operandsExp operands.[0]}} , function(obj){
                    return ({{>operandsExp operands.[1]}})
                })
            {{/if}}

            {{#unless this.operands.0.template}}
                {{#if_eq this.operands.1.template "FOR_EACH"}}   
                    {{#if this.operands.1.template}}          
                    _.{{operator}}({{fullProofObject operands.0.operand}}, function(obj){ 
                        outputObjIterator={};
                        {{#each this.operands.1.expressions}}        
                            {{> expressions}}
                        {{/each}}
                        return (outputObjIterator);
                    })
                    {{/if}}
                {{/if_eq}}

                {{#if_not_eq this.operands.1.template "FOR_EACH"}}                    
                    {{#if this.operands.1.template}}
                          {{#if_eq operands.0.operandDataType "dpd" }}  
                               _.{{operator}}( convertThreeDigitNumericStringToNumbers( {{fullProofObject operands.0.operand}}, false), function(obj){ 
                                    return ({{>operandsExp operands.[1]}})
                               })                          
                          {{/if_eq}}
                          {{#if_not_eq operands.0.operandDataType "dpd" }}  
                               _.{{operator}}({{fullProofObject operands.0.operand}}, function(obj){ 
                                    return ({{>operandsExp operands.[1]}})
                               })
                          {{/if_not_eq}}
                    {{/if}}
                {{/if_not_eq}}
                {{#unless this.operands.1.template}}
                    {{#if_eq this.operands.1.operandDataType "number" }}
                        _.{{operator}}({{fullProofObject operands.0.operand}}, function(obj){ 
                            return _.Number({{operands.1.operand}})
                        })
                    {{/if_eq}}
                    {{#if_not_eq this.operands.1.operandDataType "number" }}
                          {{#if_eq this.operands.1.operandDataType "date" }}
                              _.{{operator}}({{fullProofObject operands.0.operand}}, function(obj){ 
                                        return _.stringToDate({{operands.1.operand}}, "{{operands.1.dateType}}")
                                    })
                          {{/if_eq}}
                          {{#if_not_eq this.operands.1.operandDataType "date" }}
                              _.{{operator}}( {{fullProofObject operands.0.operand}}  , function(obj){ 
                                        return {{operands.1.operand}}
                              })
                          {{/if_not_eq}}
                    {{/if_not_eq}}
                {{/unless}}
            {{/unless}}
        {{/if_eq}}
        {{#if_eq this.operands.length 1}}
            {{#if operands.0.template}}
                _.{{operator}}({{>operandsExp operands.[0]}})
            {{/if}}

            {{#unless operands.0.template}}
                _.{{operator}}({{operands.0.operand}})
            {{/unless}}
        {{/if_eq}}
    {{/if_not_eq}}
    `;

    private expressionIfCondFunc: string = `    
    executeFunc({{include 'funcPartialexpressionIfCondFunc'}})`;
    
    private funcPartialexpressionIfCondFunc: string =`  
    function()
    {
        let expValue={{>operandsExp this.expression}};
        if(expValue)
        {
            {{#if_eq this.outputAlias.trueCase.operandType "field" }}
                return {{this.outputAlias.trueCase.operand}};
            {{/if_eq}}

            {{#if_not_eq this.outputAlias.trueCase.operandType "field" }}
                {{#if this.outputAlias.trueCase.template }}
                    return {{>operandsExp this.outputAlias.trueCase}}
                {{else}}
                    return "{{outputAlias.trueCase}}";
                {{/if}}
            {{/if_not_eq}}
        }
        else {
            return "{{outputAlias.falseCase}}";
        }
    }`

    private expressions: string = `    
    {{#if_eq this.template "FOR_EACH" }}
        outputObjIterator={};
        {{#each expressions}}        
            {{> expressions}}
        {{/each}}
    {{/if_eq}} 

    {{#if_eq this.template "STATEMENT" }}
        {{> statement}}   
    {{/if_eq}}

    {{#if_eq this.template "MUTUAL_EXCLUSIVE_EXPRESSIONS" }}
        {{> ifExpressionsMutualExlusive}}   
    {{/if_eq}}
    
    {{#if_eq this.template "ARRAY_OPERATION" }}
        {{> arrayoperation}}   
    {{/if_eq}} 
    
    {{#if_eq this.template "IF_COND" }}
    {{> expressionIfCondFunc }}
    {{/if_eq}}

    {{#if_eq this.template "INTERSECTION_OPERATION_MULTI_ARRAY" }}
        {{> arrayintersectionoperationmultiarray}}
    {{/if_eq}}    

    {{#if_eq this.template "INTERSECTION_OPERATION" }}
        {{> arrayintersectionoperation2}}
    {{/if_eq}}

   {{#if_eq this.template "FUNCTION" }}
        {{> function}}
    {{/if_eq}}

    {{#if_eq this.template "EXP" }}
            {{>operandsExp this.expressions.[0] }}
    {{/if_eq}}

    `;
    private expressionsWithIIFEforEach: string = `    
    executeFunc({{include 'funcPartialexpressionsWithIIFEforEach'}})`;

    private funcPartialexpressionsWithIIFEforEach: string = `
    function(){
        try{
            let outputObjIterator={}
            {{#each expressions}}
                {{> expressions}}
            {{/each}}
            return outputObjIterator
        }
        catch(err){
            console.log("Error in function execution:" + " {{UUID}} " + err);
            return undefined;
        }
    }`;
    
    private expressionsWithIIFE: string = `    
    {{#if_eq this.template "FOR_EACH" }}
        {{> expressionsWithIIFEforEach}}
    {{/if_eq}} 

    {{#if_eq this.template "STATEMENT" }}
        {{> statement}}
    {{/if_eq}}

    {{#if_eq this.template "ARRAY_OPERATION" }}
        {{> arrayoperation}}
    {{/if_eq}}
    
    {{#if_eq this.template "INTERSECTION_OPERATION_MULTI_ARRAY" }}
        {{> arrayintersectionoperationmultiarray}}
    {{/if_eq}}    

    {{#if_eq this.template "INTERSECTION_OPERATION" }}
        {{> arrayintersectionoperation2}}
    {{/if_eq}}
    `;

    public getMain(isCoverage: boolean= false) {
        const retVal = {
            preSetup: this.preSetup,
            main: this.main,
            expressions: this.expressions,
            expressionsWithIIFE: this.expressionsWithIIFE,
            statement: this.statement,
            operandsExp: this.operandsExp,
            simpleoperation: this.simpleoperation,
            operandsExpInner: this.operandsExpInner,
            ifExpressions: this.ifExpressions,
            arrayoperation: this.arrayoperation,
            arrayintersectionoperation: this.arrayintersectionoperation,
            arrayintersectionoperation2: this.arrayintersectionoperation2,
            arrayintersectionoperationmultiarray: this.arrayintersectionoperationmultiarray,
            processInnerInterSection: this.processInnerInterSection,
            arrayThreeDigitNumericStringToNumbersOperation: this.arrayThreeDigitNumericStringToNumbersOperation,
            arrayThreeDigitDateToDateOperation: this.arrayThreeDigitDateToDateOperation,
            ifExpressionsMutualExlusive: this.ifExpressionsMutualExlusive,
            function: this.function,
            assignAndReturnExpressions:this.assignAndReturnExpressions,
            arrayoperationOnlyCondition:this.assignAndReturnExpressions,
            funcPartialIfExpressionMutualExculsive:this.funcPartialIfExpressionMutualExculsive,
            funcPartialAssignAndReturnExpressions:this.funcPartialAssignAndReturnExpressions,
            funcPartialIfExpressions:this.funcPartialIfExpressions,
            // funcPartialArrayThreeDigitDateToDateOperation:this.funcPartialArrayThreeDigitDateToDateOperation,
            // funcPartialArrayThreeDigitNumericStringToNumbersOperation:this.funcPartialArrayThreeDigitNumericStringToNumbersOperation,
            expressionIfCondFunc:this.expressionIfCondFunc,
            funcPartialexpressionIfCondFunc:this.funcPartialexpressionIfCondFunc,
            expressionsWithIIFEforEach:this.expressionsWithIIFEforEach,
            funcPartialexpressionsWithIIFEforEach:this.funcPartialexpressionsWithIIFEforEach,
            ifExpForFunctionTemplate:this.ifExpForFunctionTemplate,
            mutualExpForFunctionTemplate:this.mutualExpForFunctionTemplate,
            tradeExecution:this.tradeExecution,
            ifExpressionForTradeExecution:this.ifExpressionForTradeExecution,
            mutliArrayOperation : this.mutliArrayOperation




        };
        if (isCoverage) {
            retVal.operandsExp = `
            executeCond(function(){
                try {
                  return  {{>operandsExpInner}}
                }
                catch(err){
                    console.log("Error in function execution:" + " {{UUID}} " + err);
                    return undefined;
                }
            },"{{CHUUID}}")
            `;
        }
        return retVal;
    }

}
