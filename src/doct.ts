

/**
 * 文档片段
 * 可能就是一个文本，也可能是别的什么
 * @export
 * @interface IFragment
 */
export interface IFragment{
    
    /**
     * 内容类型
     * 程序用该字段确定如何呈现内容
     * @type {string}
     * @memberof IDocFragment
     */
    contentType?:string|string[];
    
    /**
     * 片段内容
     * 如果是数组,其contentType自动是 section
     * @type {string}
     * @memberof IDocFragment
     */
    content?:string|ISectionContent[];
}
export type ISectionContent = string | IFragment;


 /**
  * 特征化的文档片段
  *
  * @export
  * @interface ISpecifiedDocFragment
  * @extends {IFragment}
  */
 export interface ISpecifiedFragment extends IFragment{

    /**
     * 标题
     *
     * @type {string}
     * @memberof ISpecifiedDocFragment
     */
    title:string;

    /**
     * 关键字
     *
     * @type {string[]}
     * @memberof ISpecifiedDocFragment
     */
    keywords:string[]
 }

/**
 * 组织为一颗树的文档片段
 *
 * @export
 * @interface ITreeNodeFragment
 */
export interface ITreeNodeFragment extends IFragment{
    //节点类型
    nodeType:string;
    parent?:ITreeNodeFragment;
    children?:ITreeNodeFragment[];
}

export interface ICodeFragment extends IFragment{
    //代码类型主要说明语言
    //可以根据该字段调用不同的语言编译/执行程序
    language:string;
    
    /**
     * 代码类型，是函数？类还是别的
     * execution，表示可执行片段，根据language调用该片段
     * @type {string}
     * @memberof ICodeFragment
     */
    codeKind:string;
    
    /**
     * 执行该代码所需的上下文信息，作为参数传递给编译器/执行器
     * 
     * @type {*}
     * @memberof ICodeFragment
     */
    executeContext:any;

}

export interface IAssert{
    eq(actual,expected,message?:string):IAssert;
    neq(actual,expected,message?:string):IAssert;
    hasKey(actual,expected,message?:string):IAssert;
    hasValue(actual,expected,message?:string):IAssert;
    contains(actual,expected,message?:string):IAssert;
    True(value,message?:string):IAssert;
    False(value,message?:string):IAssert;
    Null(value,message?:string):IAssert;
    Undefined(value,message?:string):IAssert;
    isset(value,message?:string):IAssert;
    unset(value,message?:string):IAssert;
    empty(value,message?:string):IAssert;
    notEmpty(value,message?:string):IAssert;
}
/**
 * 断言结果
 *
 * @export
 * @interface IAssertResult
 */
export interface IAssertResult{
    
    /**
     * 断言类型
     *
     * @type {string}
     * @memberof IAssertResult
     */
    type:string;

    /**
     * 结果
     *
     * @type {boolean}
     * @memberof IAssertResult
     */
    result:boolean;

    /**
     * 消息
     *
     * @type {string}
     * @memberof IAssertResult
     */
    message:string;
    
    /**
     * 断言参数
     *
     * @type {*}
     * @memberof IAssertResult
     */
    params?:any;
}
export class AssertException extends Error implements IAssertResult{
    result:boolean;
    constructor(public type:string,message:string,public params?:any){
        super(buildMessage(message,params));
        this.result = false;
    }
}


class Assert implements IAssert{
    constructor(){
        this.outputs = [];
    }
    
    eq(actual,expected,message?:string):IAssert{
        return this._checkAndRecord("eq",message,{actual,expected},(p)=>actual===expected);
    }
    neq(actual,expected,message?:string):IAssert{
        return this._checkAndRecord("neq",message,{actual,expected},(p)=>actual!==expected);
    }
    hasKey(key:any,assoc:any,message?:string):IAssert{
        return this._checkAndRecord("hasKey",message,{key,assoc},(p)=>{
            for(let n in assoc) if(n===key)return true;
            return false;
        });
    }
    hasValue(value:any,assoc:any,message?:string):IAssert{
        return this._checkAndRecord("hasValue",message,{value,assoc},(p)=>{
            for(let n in assoc) if(assoc[n]===value)return true;
            return false;
        });
    }
    contains(key:any,subject:any,message?:string):IAssert{
        return this._checkAndRecord("neq",message,{key,subject},(p)=>{
            if(!subject)return false;
            if(typeof subject==="string") return subject.indexOf(key)>=0;
            if(subject[key]!==undefined) return true;
            return false;
        });
    }
    True(value,message?:string):IAssert{
        return this._checkAndRecord("True",message,{value},(p)=>value===true);
    }
    False(value,message?:string):IAssert{
        return this._checkAndRecord("False",message,{value},(p)=>value===false);
    }
    Null(value,message?:string):IAssert{
        return this._checkAndRecord("Null",message,{value},(p)=>value===null);
    }
    Undefined(value,message?:string):IAssert{
        return this._checkAndRecord("Undefined",message,{value},(p)=>value===undefined);
    }
    isset(value,message?:string):IAssert{
        return this._checkAndRecord("isset",message,{value},(p)=>value);
    }
    unset(value,message?:string):IAssert{
        return this._checkAndRecord("unset",message,{value},(p)=>!value);
    }
    empty(value,message?:string):IAssert{
        return this._checkAndRecord("empty",message,{value},(p)=>empty(value));
    }
    notEmpty(value,message?:string):IAssert{
        return this._checkAndRecord("notEmpty",message,{value},(p)=>!empty(value));
    }

    private _checkAndRecord(type:string,message:string,params:any,checker:(params:any)=>boolean):Assert{
        let rs :IAssertResult;
        if(!checker(params)){
            rs = new AssertException(type,message,params);
            if(this._debugging()) throw rs;
        }else {
            rs = {type,message:buildMessage(message,params),result:true,params};
        }
        
        if(rs.result && this._recordSuccessInfo()){
            this.outputs.push({
                contentType:"text/assert-pass",
                content:rs.message
            });
        }else{
            this.outputs.push({
                contentType:"text/assert-fail",
                content:rs.message
            });
        }
        return this;
    }

    outputs:IFragment[];
    /**
     * 是否是调试状态，如果是，断言不通过会抛出异常
     *
     * @private
     * @returns {boolean}
     * @memberof Assert
     */
    private _debugging():boolean{
        return Doct.debugging as any;
    }

    /**
     * 是否会记录成功的断言
     *
     * @private
     * @returns {boolean}
     * @memberof Assert
     */
    private _recordSuccessInfo():boolean{return true;}
}

function buildMessage(message,params?:any):string{
    if(!params)return message;
    return message.replace(branceRegx,(match)=>{
        let name =  match[1].replace(trimRegx,"");
        let val= params[name];
        return val;
    });
}
function empty(value){
    if(value===null||value===undefined) return true;
    let t = typeof value;
    if(t==="function" || t==="object"){
        for(let n in value){return false;}
        return true;
    }
    return false;
}
const branceRegx = /\{\s*([a-zA-Z0-9_\-\$]+)\s*\}/;



//断言函数的签名

export type TTestStatement = (statement:(assert:IAssert)=>void)=>void;
export type TTestMethod= (test:TTestStatement,context?:any)=>any;



export class TestMethod{
    private _codes:string[];
    private _wrappedMethod:(self:any,context:any)=>IFragment;
    public descriptor:IDescriptor;
    constructor(public raw:TestMethod,public name?:string){
        this.descriptor = raw[Doct.descriptorToken] ||{};
    }  
    
    private _initCodes(){
        if(this._codes) return this._codes;
        let statement_proc = this.raw.toString();
        let assert_proc_name_match = statement_proc.match(assert_proc_name_regx);
        let assert_proce_name = assert_proc_name_match[1];
        if(!assert_proce_name){
            this._codes =  [statement_proc.substring(assert_proc_name_match[0].length,statement_proc.length-1)];
            return;
        } 

        let codes =this._codes = [];
        
        let assert_proc_regx = new RegExp(`[;\\s]?${assert_proce_name.split(',')[0].replace(trimRegx,"")}\\s?\\(`);
        statement_proc = statement_proc.substring(assert_proc_name_match[0].length,statement_proc.length-1);
        let stateBeginAt = 0;
        let c = 0;
        while(true){
            if(c++===10){console.error("已经进入无穷循环了，代码有问题。");debugger;break;}
            //let match = assert_proc_regx.exec(statement_proc);
            let match = statement_proc.match(assert_proc_regx);
            if(match){
                let matchAt = match.index;
                let stateCode = statement_proc.substring(stateBeginAt,matchAt);
                if(stateCode) codes.push(stateCode);
                
                let branceCount =1;
                let isInStr;
                for(let i =matchAt+match[0].length,j=statement_proc.length;i<j;i++){
                    let ch = statement_proc[i];
                    if(ch===")"){
                        if(isInStr) continue;
                        if(--branceCount==0){
                            statement_proc = statement_proc.substring(i+1).replace(/^\s*;?/g,"");
                            stateBeginAt=0;
                            break;
                        }
                    }else if(ch==="("){
                        if(isInStr) continue;
                        branceCount++;
                    }else if(ch==="'" || ch==='"'){
                        if(ch===isInStr) isInStr=undefined;
                        else if(!isInStr) isInStr = ch;
                        else continue;
                    }
                }
                if(branceCount) throw new Error("无法解析的函数");
            }else {
                let stateCode = statement_proc.substring(stateBeginAt,statement_proc.length-1);
                if(stateCode)codes.push(stateCode);
                break;
            }
        }
        return this._codes;
    }

    build():TTestMethod{
        if(this._wrappedMethod) return this._wrappedMethod;
        this._initCodes();
        let wrapped=  (self,context):IFragment=>{
            let step = 0;
            let fragments:ISectionContent[] = [];
            let assert :Assert;
            let test:TTestStatement = (statement:(assert:IAssert)=>any):any=>{
                //上次调用的test产生的assert
                if(assert && assert.outputs.length){
                    fragments.push({
                        contentType:"asserts"
                        ,content:assert.outputs
                    } as any);
                }
                assert = new Assert();
                fragments.push({
                    language:"js",
                    content:this._codes[step]
                } as ICodeFragment);
                step++;
            };
            (this.raw as any as Function).call(self,test,context);
            fragments.push({
                language:"js",
                content:this._codes[step]
            } as ICodeFragment);
            return {contentType:"test-method-return",content:fragments};
        };
        return this._wrappedMethod = wrapped;
    }
    call(context:any,self?:any){
        return this.build().call(self,self,context);
    }
}
let trimRegx = /(^\s+)|(\s+$)/g;
//assert是用function开头
let assert_proc_name_regx = /^function\s*\(([^\)]+)\s*\)\s*\{/;

export interface IDescriptor{
    title?:string;
    description?:any;
    notice?:any;
}

export interface IExecuteContext{
    testMethod:TestMethod;
    testClass:TestClass;
    instance:any;
    context?:any;
}

export class TestClass{
    methods:{[name:string]:TestMethod};
    descriptor:IDescriptor;
    constructor(public ctor:{new():any}){
        this.methods={};
        this.descriptor = (this.ctor as any)[Doct.descriptorToken]||{};
        Doct.testClasses.push(this);
        tryDeferExecute();
    }

    run():IFragment{
        
        let docClass= this.buildDescriptor(this.descriptor);
        if(Doct.classExecuting) Doct.classExecuting(this);
        let instance = new this.ctor();
        let docMembers = {
            contentType:"test-methods",
            content:[]
        };
        (docClass.content as ISectionContent[]).push(docMembers);

        let debugging = typeof Doct.debugging==="string"?(Doct.debugging as string).replace(trimRegx,""):null;
        for(let n in instance){
            if(debugging && n.indexOf(debugging)<0) continue;
            let method = instance[n];
            let methodDescriptor:IDescriptor;
            if(method && (methodDescriptor = method[Doct.descriptorToken])){
                let docMethod = this.buildDescriptor(methodDescriptor) as ISpecifiedFragment;
                if(!docMethod.title)  docMethod.title = n;
                let testMethod = this.methods[n] = new TestMethod(method as any);
                let opts:IExecuteContext = {
                    testMethod:testMethod,
                    testClass:this,
                    instance:instance
                };
                let context =opts.context = Doct.methodExecuting?Doct.methodExecuting(opts):undefined;
                let methodSection = testMethod.call(instance,context);
                if(Doct.methodExecuted) Doct.methodExecuted(methodSection,opts);
                docMembers.content.push(methodSection);
            }
        }
        if(Doct.classExecuted) Doct.classExecuted(docClass,this);
        return docClass;
    }
    buildDescriptor(descriptor :IDescriptor):IFragment{

        let fragment = {
            title:descriptor.title
            ,content:[]
        };

        if(descriptor.description ){
            let section:IFragment = {contentType:"description"};
            this.buildSectionContents(section,descriptor.description);
        }
        if(descriptor.notice ){
            let section:IFragment = {contentType:"description",content:[]};
            this.buildSectionContents(section,descriptor.notice);
        }
        return fragment;
    }
    buildSectionContents(section:IFragment,desContent:any){
        
        if(desContent && desContent.push && desContent.pop){
            let subs:ISectionContent[];
            if(!section.content) subs = section.content = [];
            if(!(section.content as ISectionContent[]).push) subs = section.content = [section.content as string];
            else subs = section.content as ISectionContent[];

            for(let c of desContent){
                if(c===undefined || c===null) continue;
                if(c.push && c.pop){
                    let sub = {};
                    subs.push(sub);
                    this.buildSectionContents(sub,c);
                }else subs.push(c);
            }
        }
    }
}

export interface IDoct{
    (descriptor:IDescriptor):any;
    
    /**
     * 是否处于调试状态，调试什么
     *
     * @type {string}
     * @memberof IDoct
     */
    debugging?:string|boolean;

    /**
     * 源数据的属性
     *
     * @type {string}
     * @memberof IDoct
     */
    descriptorToken?:string;

    contextFactory?:(opts:IExecuteContext)=>any;

    autoRun?:boolean;
    methodExecuting?:(opts:IExecuteContext)=>any;

    methodExecuted?:(section:IFragment,opts:IExecuteContext)=>any;
    classExecuting?:(cls:TestClass)=>any;
    classExecuted?:(section:IFragment,cls:TestClass)=>any;

    testClasses?:TestClass[];
}

export function doct(descriptor?:IDescriptor){
    return function(subject:any,propname?:string){
        if(propname===undefined){
            subject[Doct.descriptorToken] = descriptor||{};
        }else{
            let method = subject[propname];
            method[Doct.descriptorToken] = descriptor ||{};
        }
    }
}
export let Doct:IDoct = doct;
Doct.debugging = true;
Doct.descriptorToken="$__doct_descriptor__";
Doct.autoRun = true;
Doct.testClasses = [];

let tick;
function tryDeferExecute(){
    if(Doct.autoRun){
        if(!tick) tick = setTimeout(() => {
            for(let cls of Doct.testClasses){
                let rs = cls.run();
            }
        }, 0);
    }else {
        if(tick){
            clearTimeout(tick); tick = 0;
        }
    }
}