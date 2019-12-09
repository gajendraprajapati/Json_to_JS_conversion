
//this class holds all handle bar compile time helpers
const shortid = require('shortid');
const decode = require('unescape');

decode.chars['&#x3D;'] = '=';
decode.chars["&quot;"] = "\"";
decode.chars["&amp;"] = "&";
export class HandleBarhelpers {

    private _registerFunctions: any = {};
    private _curFunctionObj: any = undefined;
    private _functionDefinitions:any={};
    private _functionIdUniqueMap:any={}; //functionNameId:count

    public resetFunctionDefinitions(){
        this._functionDefinitions={};
        this._functionIdUniqueMap={};
    }

    public getFunctionDefinitions(){
        return this._functionDefinitions;
    }

    public resetRegisterFunctions() {
        this._registerFunctions = {};
        this._curFunctionObj = undefined;

    }
    public getAllFucntionNames() {
        return Object.keys(this._registerFunctions);
    }

    public getRegisteredFunctions() {
        return this._registerFunctions;
    }

    public addAllHelpers(handlebars: any) {

        handlebars.registerHelper("debug", function(optionalValue) {
            console.log("Current Context");
            console.log("====================");
            console.log(this);

            if (optionalValue) {
                console.log("Value");
                console.log("====================");
                console.log(optionalValue);
            }
        });

        const addFunctionInCache = (id, obj) => {
            obj = {...obj, ...this._curFunctionObj};
            this._registerFunctions[id] = obj;
            this._curFunctionObj = {};

        };
        const addConditionInFunctionCache = (id, obj) => {
            if (!this._curFunctionObj) {
                this._curFunctionObj = {};
            }
            if (!this._curFunctionObj.conditions) {
                this._curFunctionObj.conditions = {};
            }
            this._curFunctionObj.conditions[id] = obj;

        };


        const addIntoFunctionDefinitions=(id,functionDef)=>{
            this._functionDefinitions[id]=functionDef;
        }

        handlebars.registerHelper('include', function (path, options) {
            let partial = handlebars.partials[path];
            if (typeof partial !== 'function') {
              partial = handlebars.compile(partial);
            }
            const retval= decode(partial(this));
            const id=getUUID(this);
            addIntoFunctionDefinitions(id,retval);
            return id+","+"\"" + id+"\"";
          });

          const getUUID=(context,isHyperLocal=undefined)=>{
              let id;
            let prefix="___globalFunc__";
            if(!context.sobreId){
                prefix="___localFunc__";
            }
            if(isHyperLocal){
                prefix="___hyperlocalFunc__";
            }
            if(context.sobreId && context.type) {
                id = prefix +  context.type+"_"+context.sobreId;
                if(!this._functionIdUniqueMap[id]){
                    this._functionIdUniqueMap[id]=0;
                }
                this._functionIdUniqueMap[id]+=1;
                id=id+"_"+this._functionIdUniqueMap[id];
            }
            else if(!context.sobreId && context.type) {
                id = prefix +  context.type;
                if(!this._functionIdUniqueMap[id]){
                    this._functionIdUniqueMap[id]=0;
                }
                this._functionIdUniqueMap[id]+=1;
                id=id+"_"+this._functionIdUniqueMap[id];
            }
            else if (context.UUID) {
                id = prefix + context.UUID;
            }
            else {
                id = prefix + shortid.generate().toString();
            }
            const newFunctionObj={};
            ["sobreId","name","type","parentId"].forEach(field=>{
                if(context[field]){
                    newFunctionObj[field]=context[field];
                }
            })
            addFunctionInCache(id, newFunctionObj)
            return id;}

        handlebars.registerHelper('UUID', function () {
            return getUUID(this);
        });
        handlebars.registerHelper('HYPERUUID', function () {
            return getUUID(this,true);
        });

        

        const getCHUUID=(context)=>{
            let id;
            if (context.UUID) {
                id = "___conditionFunc__" + context.UUID;
            }
            else {
                id = "___conditionFunc__" + shortid.generate().toString();
            }
            const newFunctionObj={};
            ["sobreId","name","type","parentId"].forEach(field=>{
                if(context[field]){
                newFunctionObj[field]=context[field];
                }
            });
            addConditionInFunctionCache(id, newFunctionObj);
            return id;
        }

        handlebars.registerHelper('CHUUID', function () {
            return getCHUUID(this);
        });

        handlebars.registerHelper("ifvalue", function(conditional, options) {
            if (options.hash.value === conditional) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });

        handlebars.registerHelper("if_eq", function(a, b, opts) {
            if (a == b) { // Or === depending on your needs
                return opts.fn(this);
            } else {
                return opts.inverse(this);
            }
        });

        handlebars.registerHelper("if_not_eq", function(a, b, opts) {
            if (a != b) { // Or === depending on your needs
                return opts.fn(this);
            } else {
                return opts.inverse(this);
            }
        });

        handlebars.registerHelper("if_gt", function(a, b, opts) {
            if (a > b) { // Or === depending on your needs
                return opts.fn(this);
            } else {
                return opts.inverse(this);
            }
        });

        handlebars.registerHelper("namedAccess", function(obj, path) {
            return obj.hash.obj[obj.hash.path];
        });

        handlebars.registerHelper("getFirstOperand", function(obj) {
            return obj.split(".")[0];
        });

        handlebars.registerHelper('fullProofObject', function (obj) {
            if(obj.includes("&&")){
                return obj;
            }
            const strArr = obj.split(".");
            const finalArr = [];
            for(let i =0; i < strArr.length; i++) {
                if(strArr[i].includes("[")) {
                    finalArr.push(...strArr[i].split("[").join("+++[").split("+++"));
                }
                else {
                    finalArr.push(strArr[i]);
                }
            }
            let temp;
            const arr = [];
            finalArr.forEach((cur, index)=> {
                if(index == 0) {
                    temp = cur;
                    arr.push(temp);
                } else {
                    if(cur.includes("[")) {
                        temp = `${arr[index-1]}${cur}`;
                    }
                    else {
                        temp = `${arr[index-1]}.${cur}`;
                    }
                    arr.push(temp);
                }
            });
            return arr.join(" && ");
        });

        handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
            switch (operator) {
                case "==":
                    return (v1 == v2) ? options.fn(this) : options.inverse(this);
                case "===":
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                case "!=":
                    return (v1 != v2) ? options.fn(this) : options.inverse(this);
                case "!==":
                    return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                case "<":
                    return (v1 < v2) ? options.fn(this) : options.inverse(this);
                case "<=":
                    return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                case ">":
                    return (v1 > v2) ? options.fn(this) : options.inverse(this);
                case ">=":
                    return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                case "&&":
                    return (v1 && v2) ? options.fn(this) : options.inverse(this);
                case "||":
                    return (v1 || v2) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
            }
        });

        handlebars.registerHelper("join", function(joinBy, elements) {
            return elements.join(joinBy);
        });

        handlebars.registerHelper('safeString', function(text) {
            return handlebars.Utils.escapeExpression(text);
        });

        handlebars.registerHelper("arrayPush", function(arrVar, value) {
            arrVar.push(value);
        });

        handlebars.registerHelper("getIfExpression", function(field, operator, checkValue) {
            const value = ((typeof checkValue) == "number") ? checkValue : `"${checkValue}"`;

            return `(input.${field} ${operator} ${value})`;
        });

    }
}
