
function  enumerable(allow:boolean) {
    return function (target:any,propname:string) {
        Object.defineProperty(target,propname,{enumerable:allow,writable:true,configurable:true,value:target[propname]});
    }
}

export enum Doctypes{
    Root,
    Namespace,
    Class,
    Member,
    Usage
}






export class Doct {
    name:string;
    descriptions:string[];
    notices:string[];
    
    start:Date;
    end:Date;
    ellapse:number;
    usageCount:number;
    errorCount:number;
    

    constructor(public type:Doctypes,public parent:NamespaceDoct){
        this.errorCount = this.usageCount = this.ellapse=0;
        this.descriptions=[];
        this.notices=[];
    }
    
    @enumerable(false)
    execute(params?:any):Doct{
        
        return this;
    }
    @enumerable(false)
    reset():Doct{
        this.start = this.end = undefined;
        this.ellapse= this.errorCount = 0;
        return this;
    }

    get description():string{
        return this.descriptions.join("\n");
    }
    set description(value:string){
        if(value)this.descriptions.push(value);
    }

    get notice():string{
        return this.notices.join("\n");
    }
    set notice(value:string){
        if(value)this.notices.push(value);
    }
}



export class NamespaceDoct extends Doct {
    subs:{[name:string]:NamespaceDoct};

    

    @enumerable(false)
    _fullName:string;

    @enumerable(false)
    _name:string;

    constructor(name:string,type:Doctypes,parent?:NamespaceDoct){
        super(type,parent);
        this.subs={};
        if(name&& parent) this.name=name;
    }
    @enumerable(false)
    _mergeTo(target:NamespaceDoct){
        for(let n in this.subs){
            let sub = this.subs[n];
            let existed = target.subs[n];
            if(sub.type===Doctypes.Namespace) sub._mergeTo(existed);
            else if(existed.type ===Doctypes.Namespace) {
                existed._mergeTo(sub); target.subs[n] = sub;
            }else{
                throw new Error(`${sub.fullName}无法合并.`);
            }
        }
    }
    
    get name():string{
        return this._name;
    }
    set name(value:string){
        if(this._name && this._name!==value) throw new Error(`已经设置了name或者fullName`);
        if(this.parent){
            let ns = this.parent.subs;
            let existed = ns[value];
            if(existed){
                if(this===existed) return;
                if(existed.type === Doctypes.Namespace){
                    existed._mergeTo(this);ns[value]=this;
                }else if(this.type === Doctypes.Namespace){
                    this._mergeTo(existed);
                }else throw new Error(`${existed.fullName}已经定义过文档，且无法合并.`);
            }else ns[value]=this;
            
        }
        
        this._name = value;
    }

    
    
    get fullName():string{
        if(this._fullName===undefined){
            if(this._name && this.parent){
                let pname = (this.parent as any).fullName;
                return pname?pname + "." + this._name:this._name;
            }
        }
        return this._fullName;
    }
    set fullName(value:string){
        if(this._fullName!==undefined) throw new Error("已经设置了fullName,不可以再设置");

        let nms = value.split(".");
        let name = nms[nms.length-1];
        if(this._name && this._name!==name) throw new Error(`已经定义了name=${this._name},但fullName又重新定义为${value}`); 
        
        let node:NamespaceDoct=rootDoc;
        let ns:{[name:string]:NamespaceDoct}=node.subs;
        for(let i =0,j=nms.length-1;i<j;i++){
            let n = nms[i];
            ns = node.subs;
            node = ns[n] || (ns[n] = new NamespaceDoct(n,Doctypes.Namespace,node));
        }

        if(this.parent){
            if(this.parent!==node) throw new Error(`指定的parent与fullName的parent不一致`);
        }else this.parent = node;

        this.name = name;
        
        this._fullName = value;
    } 
    

    
    @enumerable(false)
    execute(params?:any):NamespaceDoct{
        let start = new Date();
        try{
            for(let n in this.subs){
                this.subs[n].execute(params);
            }
        }finally{
            this.start = start;
            this.end = new Date();
        }
        return this;
    }

    @enumerable(false)
    reset():NamespaceDoct{
        for(const n in this.subs){
            this.subs[n].reset();
        }
        return this;
    }

    //@enumerable(false)
    toString(){
        return `{${this.fullName},${Doctypes[this.type]}}`;
    }
}


export type TAssert = (expected:any,actual:any,message?:string)=>any;
export type TAssertStatement = (assert:TAssert)=>any;
export type TUsageStatement = (assert_statement:TAssertStatement,container?:any)=>any;
export interface IUsageCode{
    code:string;
    asserts?:string[];
}

export class UsageDoct extends Doct{
    name:string;
    exception:Error;
    //@enumerable(false)
    //code:string;

    //@enumerable(false)
    //asserts:string[];
    @enumerable(false)
    codes:IUsageCode[];
    
    @enumerable(false)
    statement:TUsageStatement;

    domContainer:any;
    constructor(statement:TUsageStatement,parent?:StatementDoct,name?:string){
        super(Doctypes.Usage,parent);
        let p :Doct= this;
        this.name = name;
        while(p){
            p.usageCount++;
            p=p.parent;
        }
        this.statement = statement;
        //this.code = makeCode(statement);
        //this.asserts=[];
        this.codes=makeCodes(statement);
    }
    @enumerable(false)
    execute(params?:any):UsageDoct{
        let end:Date;
        let index:number = 0;
        let assert_proc = (assert_statement:(assert:(expected,actual,message)=>any)=>any)=>{
            end = this.end = new Date();
            this.setEllapse(this.end.valueOf()- this.start.valueOf());
            assert_statement(makeAssert(this,index++));
            
        };
        
        try{
            this.domContainer = document.createElement("div");
        }catch{}
        this.start = new Date();
        try{
            if((doct as TDoct).debugging){
                
                this.statement.call(this,assert_proc,this.domContainer);
            }else {
                try{
                    this.statement.call(this,assert_proc,this.domContainer);
                }catch(ex){
                    this.exception = ex;
                    let p :Doct= this;
                    while(p){
                        p.errorCount++;
                        p=p.parent;
                    }
                }
            }
        }finally{
            if(end===undefined){
                end = this.end = new Date();
                this.setEllapse(this.end.valueOf()- this.start.valueOf());
            }
        }
        if(!(this.domContainer as HTMLElement).hasChildNodes())this.domContainer=null;
        return this;
    }
    @enumerable(false)
    reset():UsageDoct{
        super.reset();
        this.exception=undefined;
        for(const i in this.codes) this.codes[i].asserts=[];
        return this;
    }

    @enumerable(false)
    setEllapse(value:number):UsageDoct{
        let p = this as Doct;
        while(p){
            p.ellapse+=value;
            p= p.parent;
        }
        return this;
    }

    

}



function makeCodes(func:Function):IUsageCode[]{
    let trimRegx = /(^\s+)|(\s+$)/g;
    let assert_proc_name_regx = /^function\s*\(([^\)]+)\s*\)\s*\{/;

    let statement_proc = func.toString();
    let assert_proc_name_match = statement_proc.match(assert_proc_name_regx);
    let assert_proce_name = assert_proc_name_match[1];
    if(!assert_proce_name) return  [{code:statement_proc.substring(assert_proc_name_match[0].length,statement_proc.length-1)}];

    let rs = [];
    
    let assert_proc_regx = new RegExp(`[;\\s]?${assert_proce_name.split(',')[0].replace(trimRegx,"")}\\s?\\(`);
    statement_proc = statement_proc.substring(assert_proc_name_match[0].length,statement_proc.length-1);
    let stateBeginAt = 0;
    //let codes = "";
    let c = 0;
    while(true){
        if(c++===10){debugger;break;}
        //let match = assert_proc_regx.exec(statement_proc);
        let match = statement_proc.match(assert_proc_regx);
        if(match){
            let matchAt = match.index;
            let stateCode = statement_proc.substring(stateBeginAt,matchAt).replace(trimRegx,"");
            if(stateCode) rs.push({code:stateCode,asserts:[]});
            
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
            let stateCode = statement_proc.substring(stateBeginAt,statement_proc.length-1).replace(trimRegx,"");
            if(stateCode)rs.push({code:stateCode,asserts:[]});
            break;
        }
    }

    return rs;
}


function makeAssert(doc:UsageDoct,codeIndex:number){
    let usageCode = doc.codes[codeIndex];
    let assert= (expected:any,actual:any,msg:string,paths?:string[])=>{
        
        let asserts :string[] = usageCode.asserts|| (usageCode.asserts=[]);
        
        if(!paths && msg) msg = msg.replace(/\{actual\}/g,JSON.stringify(actual)).replace(/\{expected\}/g,JSON.stringify(expected));
        if(actual===expected) {
            if(msg)asserts.push(msg);
            return;
        }
        let t = typeof(expected);
        
        if(t==="object"){
            paths||(paths=[]);
            //let nullMsg = msg || "期望有值";
            if(!actual) throw new AssertException(paths.join(".")+"不应为空.",msg);
    
            for(let n in expected){
                paths.push(n);
                let expectedValue = expected[n];
                let actualValue = actual[n];
                if(typeof expectedValue==="object"){
                    assert(actualValue,expectedValue,msg,paths);
                }else {
                    if(actualValue!==expectedValue){
                        throw new AssertException(`${paths?paths.join("."):""}期望值为${expectedValue},实际为${actualValue}`,msg);
                    }
                }
                paths.pop();
            }
            if(msg && !paths.length){
                asserts.push(msg);
            }
        }else if(actual!==expected){
            throw new AssertException(`${paths?paths.join("."):""}期望值为${expected},实际为${actual}`,msg);
        }else {
            if( msg && !paths){
                asserts.push(msg);
            }
        }
    };
    return assert;
}


export class StatementDoct extends NamespaceDoct {
    usages:{[name:string]:UsageDoct};
    
    constructor(type:Doctypes,parent?:NamespaceDoct,name?:string){
        super(name,type,parent);
        this.usages={};
    }
    
    

    @enumerable(false)
    usage(name:string|TUsageStatement,description?:string|TUsageStatement,statement?:TUsageStatement){
        if(statement===undefined) {
            if(description===undefined){
                statement = name as TUsageStatement;
                name = (this.usageCount++).toString();
                description=undefined;
            }else {
                statement = description as TUsageStatement;
                description= undefined;
            }
            
        }
        let usageDoc = new UsageDoct(statement,this,name as string);
        this.usages[usageDoc.name] = usageDoc;
        usageDoc.description=description as string;
    }
    
    @enumerable(false)
    execute(params?:any):StatementDoct{
        let ellapse = 0;
        let start = new Date();
        try{
            for(const n in this.usages){
                this.usages[n].execute(params);
            }
            super.execute(params);
        }finally{
            this.start = start;
            this.end = new Date();
            this.ellapse = ellapse;
        }
        return this;
    }

    @enumerable(false)
    reset():StatementDoct{
        for(const n in this.usages){
            this.usages[n].reset();
        }
        super.reset();
        return this;
    }

    @enumerable(false)
    _mergeTo(target:StatementDoct){
        for(let n in this.usages){
            let sub = this.usages[n];
            let existed = target.usages[n];
            if(existed){
                let i =1;
                while(true){
                    let newN = n+i.toString();
                    if(!target.usages[newN]){
                        target.usages[newN] = sub;
                        sub.name = newN;
                        break;
                    }else i++;
                }
            }else target.usages[n] = sub;
            sub.parent = this; 
        }
        let p = this.parent;
        while(p){
            p.usageCount+= this.usageCount;
            p = p.parent;
        }
    }
}





export class ClassDoct extends StatementDoct{
    @enumerable(false)
    ctor:{new(doc:ClassDoct):{}};
    @enumerable(false)
    isInited:boolean;
    constructor(ctor:{new(doc:ClassDoct):{}},parent?:NamespaceDoct){
        super(Doctypes.Class,parent);
        this.ctor = ctor;
    }
    @enumerable(false)
    execute(params?:any):ClassDoct{
        let ins = new this.ctor(this);
        if(!this.isInited){
            for(let n in ins){
                let method = ins[n];
                if(method.$doct_name!==undefined) {
                    let child = new MemberDoct(method,this);
                    child.name = method.$doct_name;
                }
            }
            this.isInited=true;
        }
        super.execute(ins);
        return this;
    }
}

export class MemberDoct extends StatementDoct{
    @enumerable(false)
    method:Function;
    
    constructor(method:Function,parent:NamespaceDoct){
        super(Doctypes.Member,parent);
        this.usageCount = 0;
        this.method = method;
    }
    
    @enumerable(false)
    execute(self?:any){
        this.method.call(self,this);
        super.execute();
        return this;
    }
}



export function date_format(date:any) {
    if(!date) date = 0;
    if(!(date instanceof Date)) date= new Date(date as any);
    return `${(date as Date).getMonth()+1}/${(date as Date).getDate()+1}/${(date as Date).getFullYear()}T${(date as Date).getHours()}:${(date as Date).getMinutes()}:${(date as Date).getSeconds()}.${(date as Date).getMilliseconds()}`;
}


 
export class AssertException extends Error{
    outerMessage:string;
    constructor(msg:string,outerMessage?:string){
        super(msg);
        this.outerMessage=outerMessage;
    }
    toString(){
        if(this.outerMessage) return this.outerMessage;
        return super.toString();
    }
}

export type  TDoct={
    (nameOrType?:string|Doctypes) :any;
    debugging?:boolean|string;
    reset?:()=>TDoct;
    output?:(params?:any,doc?:Doct)=>TDoct;

}

export let  doct:TDoct=function (nameOrType?:string|Doctypes) {
    return function(target:any,propName?:string) {
        if(propName!==undefined){
            let testMethod = target[propName];
            if(!testMethod) {console.warn(`${propName}不是函数，不应该由doct装饰`);}
            testMethod.$doct_name =propName;
            //testMethod.$doct_type = 
        }else {
             
            let clsDoct = new ClassDoct(target);
            if(nameOrType)clsDoct.fullName = nameOrType as string;
        }
    }
}

export default doct;

let rootDoc = new StatementDoct(Doctypes.Root,null);

doct.debugging=true;

doct.reset = ():TDoct=>{
    
    rootDoc.subs={};
    rootDoc.usages={};
    rootDoc.reset();
    return doct as TDoct;
}

doct.output = (params?:any,doc?:Doct):TDoct=>{
    if(doc===undefined) doc = rootDoc;
    
    console.group(`${doc.name}:<${Doctypes[doc.type]}>`);
    let desc = doc.description;
    if(desc) console.info(`#说明:${desc}`);
    let notice = doc.notice;
    if(notice) console.info(`#注意:${notice}`);

    if(doc instanceof UsageDoct){
        for(const i in doc.codes){
            let code = doc.codes[i];
            console.info(`#示例:`,code.code);
            if(code.asserts && code.asserts.length){
                console.info(`/*结果:${code.asserts.join('\n')}*/`);
            }
        }
    }
    if(doc instanceof StatementDoct){
        for(const n in doc.usages) doct.output(params,doc.usages[n]);
    }

    if(doc instanceof NamespaceDoct){
        for(const n in doc.subs) doct.output(params,doc.subs[n]);
    }
    

    
    if(doc.type !== Doctypes.Usage){
        if(doc.errorCount)
            console.warn(`#测试:${doc.errorCount}/${doc.usageCount}=${doc.errorCount*100/doc.usageCount}%`);
        else 
            console.info(`#测试:${doc.errorCount}/${doc.usageCount}=${doc.errorCount*100/doc.usageCount}%`);
    }else {
        if((doc as UsageDoct).exception) console.error(`#错误:`,(doc as UsageDoct).exception);
    }
    
    console.info("#时间:",`${doc.ellapse}ms`,date_format(doc.start),date_format(doc.end));
    
    console.groupEnd();
    return doct as TDoct;
}

function makeSection(dlElem:HTMLDListElement,title:string,content:any){
    let domDoc = dlElem.ownerDocument;
    let tit = domDoc.createElement("DT");dlElem.appendChild(tit);
    tit.innerHTML=title;
    let dd = domDoc.createElement("DD");dlElem.appendChild(dd);
    function makeContents(content){
        if(!content) return;
        else if(typeof content==="function") makeContents(content(domDoc,dd));
        else if(typeof content==="string") dd.innerHTML = content;
        else if(Object.prototype.toString.call(content)==="[object Array]"){
            for(const i in content) makeContents(content[i]);
        }else dd.appendChild(content);
    }
    makeContents(content);
    (tit as any).dd = dd;
    return tit;
}

export let outputToElement = (params?:any,doc?:Doct):TDoct=>{
    if(doc===undefined) doc = rootDoc;
    params ||(params={});
    let domDoc = params.document || document;
    let group = domDoc.createElement("fieldset");group.className = "group " + Doctypes[doc.type];
    let cotainerDom = params.containerDom || document.body;
    group.setAttribute("doctype",Doctypes[doc.type]);cotainerDom.appendChild(group);
    let legend = domDoc.createElement("legend");group.appendChild(legend);
    legend.innerHTML = doc.name;

    let dlElem = domDoc.createElement("DL");group.appendChild(dlElem);
    dlElem.className="main";
    let descs = doc.descriptions;
    if(descs && descs.length){
        makeSection(dlElem,"说明",(domDoc)=>{
            let ul = domDoc.createElement("ul");ul.className = "descriptions";
            for(const i in descs) {
                let li = domDoc.createElement("li"); ul.appendChild(li); li.innerHTML = descs[i].replace(/\n/g,"<br />");
            }return ul;
        });
    }
    let notices = doc.notices;
    if(notices && notices.length){
        makeSection(dlElem,"注意",(domDoc)=>{
            let ul = domDoc.createElement("ul");ul.className="notices";
            for(const i in descs) {
                let li = domDoc.createElement("li"); ul.appendChild(li); li.innerHTML = descs[i].replace(/\n/g,"<br />");
            }return ul;
        });
    }
    

    if(doc instanceof UsageDoct){
        if(doc.domContainer){
            doc.domContainer.className = "demo";
            makeSection(dlElem,"演示",doc.domContainer);
        }

        if(doc.codes && doc.codes.length){
            makeSection(dlElem,"示例",(domDoc,container:any)=>{
                let ul = domDoc.createElement("ol");ul.className="samples";container.appendChild(ul);
                for(const i in (doc as UsageDoct).codes) {
                    let codeInfo = (doc as UsageDoct).codes[i];
                    let li = domDoc.createElement("li"); ul.appendChild(li); 
                    let preElem = domDoc.createElement("pre"); li.appendChild(preElem);
                    let codeElem =domDoc.createElement("code"); preElem.appendChild(codeElem);
                    codeElem.innerHTML = codeInfo.code;
                    if(codeInfo.asserts && codeInfo.asserts.length){

                        let asserts  = domDoc.createElement("ul"); asserts.className="asserts";li.appendChild(asserts);
                        let comment = domDoc.createElement("li");comment.className="comment";comment.innerHTML = "/*";asserts.appendChild(comment);
                        for(const n in codeInfo.asserts){
                            let li = domDoc.createElement("li"); asserts.appendChild(li); li.innerHTML = (codeInfo.asserts[n].replace(/\n/g,"<br />"));
                        }

                        comment = domDoc.createElement("li");comment.className="comment";comment.innerHTML = "*/";asserts.appendChild(comment);
                    }
                }
                
            });
        }
        
    }
    if(doc instanceof StatementDoct && doc.usages){
        let hasUsage=false;
        for(const n in doc.usages) {hasUsage=true;break;};
        if(hasUsage) makeSection(dlElem,"用法",(domDoc,dd)=>{
            let ol = domDoc.createElement("ol"); dd.appendChild(ol);ol.className="usages";
            for(const n in (doc as StatementDoct).usages){
                let li = domDoc.createElement("li");params.containerDom = li;ol.appendChild(li);
                doct.output(params,(doc as StatementDoct).usages[n]);
            } 
        });
        
    }

    if(doc instanceof NamespaceDoct){
        let subs = domDoc.createElement("ul"); group.appendChild(subs);subs.className="subs";
        for(const n in doc.subs) {
            let li = domDoc.createElement("li");subs.appendChild(li);
            params.containerDom = li;
            doct.output(params,doc.subs[n]);
        }
    }
    

    dlElem = domDoc.createElement("DL");group.appendChild(dlElem);
    dlElem.className="statistics";
    if(doc.type !== Doctypes.Usage){
        let tit = makeSection(dlElem,"测试",`${doc.errorCount}/${doc.usageCount}=${doc.errorCount*100/doc.usageCount}%`);
        if(doc.errorCount){
            tit.className="warn"; (tit as any).dd.className="warn";
        }            
    }else {
        if((doc as UsageDoct).exception) {
            let tit= makeSection(dlElem,"错误",JSON.stringify((doc as UsageDoct).exception));
            tit.className="error"; (tit as any).dd.className="error";
        }
    }
    
    let tit = makeSection(dlElem,"耗时",`${doc.ellapse}ms=${date_format(doc.end)}-${date_format(doc.start)}`);
    tit.className="error"; (tit as any).dd.className="error";
    
    return doct as TDoct;
}

let isSuspended;
(doct as any).suspend =(suppend:boolean)=>{
    if(!(isSuspended =suppend) && isAutoExected){
        rootDoc.execute();
        doct.output();
    }
};
let tryRun = ()=>{
    if(!isSuspended) {
        rootDoc.execute();
        doct.output();
    }
    isAutoExected=true;
};
let isAutoExected=false;
if(typeof window!=="undefined"){
    if(window.addEventListener) window.addEventListener("load",tryRun,false);
    else if((window as any).attachEvent) (window as any).attachEvent("onload",tryRun);
    else window.onload = tryRun;
}else setTimeout(tryRun,100);

