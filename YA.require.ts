/*
要正确编译该文件，tsconfig必须要配置成
"compilerOptions": {
        "module":"None",
        ..
}
*/

interface IRequireReady{
    value:any;
    isCompleted:boolean;
    isReady:boolean;
    isFailed:boolean;
    ready(callback:(value:any)=>any):IRequireReady;
    fail(callback:(value:any)=>any):IRequireReady;
}
interface IRequireUri{
    paths:string[];
    orignal:string;
    resolved:string;
    url:string;
    filename:string;
}
interface IRequireDefine{
    (name:string|any[]|Function,deps?:any,statement?:any):void;
    /**
     * 用指定的window创建一个新的define
     * 主要用于iframe中
     *
     * @param {{[name:string]:any}} initModules
     * @param {*} window
     * @param {HTMLDocument} [document]
     * @memberof IDefine
     */
    create(initModules:{[name:string]:any},window:any,document?:HTMLDocument):IRequireDefine;
    config(cfgs:IRequireConfigs):IRequireDefine;
    require(name:string):IRequireDefine;
    context:IRequireContext;
    modules:{[alias:string]:IRequireModule};
    disabled:boolean;
}

interface IRequireModuleOpts{
    name?:string;
    url?:string;
    value?:any;
    deps?:string[];
}

interface IRequireModule extends IRequireReady{
    uri:IRequireUri;
    url:string;
    name:string;
    
    resource:IRequireResource;
    deps:{[name:string]:any};

    value:any;
    result:any;
    exports:any;
    default:any;
}

interface IRequireContext{
    name?:string;
    url?:string;
    deps?:string[];
}

interface IRequireResourceOpts{
    url:string;
    type:string;
}

interface IRequireResource extends IRequireReady{
    url:string;
    type:string;
    element:HTMLElement;
}

type TModuleConfigItem = IRequireModuleOpts | string;
    
    
interface IRequireConfigs{
    reset?:boolean;

    /**
     * url的解析规则
     *
     * @type {*}
     * @memberof IRequireConfigs
     */
    resolve_rules?:any;

    /**
     * 预先加载的模块
     *
     * @type {*}
     * @memberof IRequireConfigs
     */
    modules?:TModuleConfigItem[];
}

interface IRequireProgressEventArgs{
    name?:string;
    url?:string;
    ready?:boolean;
    loadingCount:number;
    readyCount:number;
    totalCount:number;
}

(function(window){    
    //====================================================================   
    function factory(initModules:{[name:string]:any},window:any,document?:HTMLDocument){
        document|| (document=window.document);
        let head=function():HTMLHeadElement{
            let elems = document.getElementsByTagName("head");
            if(!elems || elems.length==0) return document.body as any;
            let headElem = elems[0] as HTMLHeadElement;
            head = ()=>headElem as any;
            return headElem;
        }

        class Ready implements IRequireReady{
            _readyCallbacks:{(value:any,sender:Ready):void}[];
            _failCallbacks:{(err:any,sender:Ready):void}[]
            value:any;
            isCompleted:boolean;
            isReady:boolean;
            isFailed:boolean;
            constructor(statement:(ready:(value:any)=>void,fail:(err:any)=>void)=>void){
                let readyCallbacks = this._readyCallbacks=[];
                let failCallbacks = this._failCallbacks=[];
                this.isReady = this.isFailed = this.isCompleted = false;
                let isCompleted,isReady,isFailed,value;

                let ready = (val:any)=>{
                    if(isCompleted){
                        console.warn('Ready对象已经Complete，又再次调用了ready操作，忽略');
                        return;
                    }
                    console.debug(`${(this as any).url} is called ready.`,this);
                    this.value = value = val;
                    isCompleted = isReady = this.isReady=this.isCompleted=true;
                    let callbacks = readyCallbacks;
                    this._readyCallbacks =this._failCallbacks= readyCallbacks= failCallbacks= undefined;
                    for(const callback of callbacks){
                        callback.call(this,val,this);
                    }
                };
                let fail = (val:any)=>{
                    if(isCompleted){
                        console.warn('Ready对象已经Complete，又再次调用了fail操作，忽略');
                        return;
                    }
                    console.debug(`${(this as any).url} is called fail.`,this);
                    this.value = value = val;
                    isCompleted = isFailed = this.isFailed=this.isCompleted=true;
                    let callbacks = failCallbacks;
                    this._readyCallbacks = this._failCallbacks = readyCallbacks= failCallbacks= undefined;
                    for(const callback of callbacks){
                        callback.call(this,val,this);
                    }
                };

                this.ready = (callback:(module:Module)=>any)=>{
                    if(!isCompleted){
                        readyCallbacks.push(callback);
                    }else if(isReady){
                        callback.call(this,value,this);
                    }
                    return this;
                };
                this.fail = (callback:(module:Module)=>any)=>{
                    if(!isCompleted){
                        failCallbacks.push(callback);
                    }else if(isFailed){
                        callback.call(this,value,this);
                    }
                    return this;
                };

                statement.call(this,ready,fail);
            }
            ready(callback:(value:any)=>any):Ready{
                return this;
            }
            fail(callback:(value:any)=>any):Ready{
                return this;
            }
        }

        class Uri{
            paths:string[];
            orignal:string;
            resolved:string;
            url:string;
            filename:string;
            constructor(url:string,basPaths?:string[]){
                this.orignal = url;
                url = this.resolved = resolveUrl(url);
                
                let paths=this.paths=[];
                if(basPaths)for(let i =0,j=basPaths.length;i<j;i++) paths.push(basPaths[i]);
                let names = url.split('/');       
                for(let i = 0,j=names.length-1;i<j;i++){
                    let n = names[i].replace(/(^\s+)|(\s+)$/g,"");
                    if(n==="." && paths.length) continue;
                    else if(n==="..") {
                        if(paths.length){
                            let n1 = paths.pop();
                            if(n1[0]=='.') paths.push(n1);
                            else continue;
                        }
                    }
                    else if(!n) continue;
                    paths.push(n);
                }
                
                let name = names[names.length-1];
                if(name.lastIndexOf(".js")!==name.length-3) name += ".js";
                this.filename = name;
                if(paths.length) this.url = paths.join("/") + "/" + name;
                else this.url = name;
            }
        }

        //////////////////////////////////////////////////////////////////////////////////////////
        // Resource

        class Resource extends Ready implements IRequireResource{
            element:HTMLElement;
            type:string;
            constructor(public url:string){
                super(function(ready,fail){
                    let self = this;
                    url = self._makeUrl(url);
                    let elem:any = self.element = self._createElement(url);
                    if(elem.onload!==undefined)elem.onload=()=>self._loaded(ready);
                    else elem.onreadystatechange = ()=>{
                        if(elem.readyState===4|| elem.readyState==="complete") self._loaded(ready);
                    };
                    
                    
                    elem.onerror =(err,ex)=>{console.error(err,ex,this);fail(err);}

                    self._load();
                });
                
            }
            protected _makeUrl(url:string):string{
                if(url.indexOf("?")>0) url+= "&";
                else url += "?";
                url += Math.random();
                return url;
            }
            protected _createElement(url:string):HTMLElement{
                throw new Error("abstract method");
            }
            protected _load(){
                head().appendChild(this.element);
            }
            protected _loaded(ready:(value:any)=>any){
                ready(this.element);
            }
            static load(opts:IRequireResourceOpts|string):IRequireResource{
                let url ,type;
                if(typeof opts ==="object"){
                    url = opts.url;
                    type = opts.type;
                }else {
                    url = opts as any;
                }
                if(type){
                    let ext = "." + type;
                    if(url.substr(url.length-ext.length)!==ext) url += ext;
                }else {
                    let at = url.lastIndexOf(".");
                    if(at>0){
                        let ext = url.substr(at);
                        if(ext==".css") type = "css";
                        else if(ext==".js") type= "js";
                    }
                    if(!type){
                        type = "js";
                        url += ".js";
                    }
                }
                if(type=="js") return new ScriptResource(url);
                else if(type=="css") return new StylesheetResource(url);
            }
        }
        
        class ScriptResource extends Resource{
            constructor(url:string){
                super(url);
                this.type = "js";
            }
            _createElement(url):HTMLElement{
                let elem = document.createElement("script") as HTMLScriptElement;
                elem.type="text/javascript";
                elem.src = url;
                return elem;
            }
        }

        class StylesheetResource extends Resource{
            constructor(url:string){
                super(url);
                this.type = "css";
            }
            _createElement(url):HTMLElement{
                let elem = document.createElement("link") as HTMLLinkElement;
                elem.type="text/css";
                elem.href = url;
                elem.rel = "stylesheet";
                return elem;
            }
        }

        ////////////////////////////////////////////////////////////////
        // Module

        class Module extends Ready{
           
            uri:Uri;
            url:string;
            name:string;
            aliases:string[];

            resource:IRequireResource;
            deps:{[name:string]:any};

            result:any;
            exports:any;
            default:any;

            constructor(public opts:IRequireModuleOpts,uri?:Uri){
                super(function(ready,fail){
                    window.exports = {};
                    let self:Module = this;
                    self.aliases=[];
                    self.deps={};
                    
                    if(opts.url){
                        self.uri = uri || (uri = new Uri(opts.url));
                        self.url = uri.url;
                        self.aliases.push(self.url);
                    }

                    if((self.name = opts.name) && self.url!=this.name) self.aliases.push(self.name);
                    
                    let resolve = (result,module_exports?)=>{
                        
                        self.result = result;
                        self.exports = module_exports;
                        self.value = result || module_exports;
                        if(module_exports) self.default = module_exports.default;                     
                        ready(self.value);
                    }
                    if(opts.value){
                        resolve(opts.value);
                    }else{
                        self.resource = Resource.load(this.url).ready((elem)=>{
                            let context = RequireContext.current;
                            let g_exports = window.exports;
                            window.exports = {};
                            RequireContext.current= undefined;
                            if(!context) {
                                let module_exports = {};
                                for(let n in g_exports) module_exports[n] = g_exports[n];
                                console.warn(`模块${this.url}中未用define定义模块,克隆全局的exports作为该模块的输出。`);
                                resolve(module_exports);
                                return;
                            }
                            //把module注入到当前上下文中
                            //上下文会在setTimout(0)后执行模块的factory
                            context.module = this;
                            context.resolve = resolve;
                        }).fail(fail) as IRequireResource;                        
                    }
                });
            }
            

            alias(name:string,force?:boolean):Module{
                let existed =define.modules[name];
                if(existed){
                    if(existed===this) return this;
                    if(force){
                        console.warn(`模块[${name}]被替换掉了`,existed,this);
                    }else throw new Error(`模块[${name}]被替换掉了`);
                }else {
                    for(let i =0,j=this.aliases.length;i<j;i++){
                        let n = this.aliases.shift();
                        if(n!==name) this.aliases.push(n);
                    }
                    this.aliases.push(name);
                }
                define.modules[name] = this;

            }
            
            static caches :{[name:string]:Module}={};
            static fetch(name:string,requireModule:Module){
                if(!name) throw new Error("无法获取模块,未指定模块名/url");
                let existed = define.modules[name];
                if(!existed) {
                    let uri = new Uri(name,requireModule?.uri.paths);
                    existed =  define.modules[uri.url];
                    if(!existed)existed =define.modules[uri.url]= new Module({name:uri.url,url:name},uri);
                }
                return existed;
            }
        }

        

        let resolveUrl =(url:string):string=>{
            let at = url.lastIndexOf(".");
            
            if(at<0) return url;
            let ext = url.substr(at);
            if(ext!==".js") url += ".js";
            return url;
        }

        

        class RequireException extends Error{
            is_in_defination_statement:boolean;
            constructor(msg:string,is_in_defination_statement?:boolean){
                super(msg);
                this.is_in_defination_statement = is_in_defination_statement;
            }
        }

        
        window.exports = {};
        
        class RequireContext{
            module:Module;
            resolve:(value:any,module_exports:any)=>any;
            constructor(public name:string,public deps:string[],public factory:Function){
                RequireContext.current = this;
                this.module_exports = {};
                setTimeout(()=>{
                    let require = (name:string)=>{
                        let mod = Module.fetch(name,this.module);
                        if(!mod.isReady){
                            wait_count++;
                            mod.ready((mod)=>{
                                tryResolve();
                            });
                            throw new RequireException(`module[${name} is not ready.`,true);
                        }
                        return mod.value||mod.exports||mod.default;
                    };
                    (require as any).config = set_config;
                    let args = [];
                    let wait_count=this.deps.length;
                    let tryResolve =()=>{
                        if((--wait_count)===0){
                            let success = false;
                            let result;
                            try{
                                
                                result=this.factory.apply(this,args);
                                success=true;
                            }catch(ex){
                                if(ex.is_in_defination_statement){

                                }else throw ex;
                            }
                            if(success){ 
                                this.resolve(result,this.module_exports);
                                
                            }
                        }
                    };
                    for(const index in this.deps)((depname:string,idx:string)=>{
                        if(depname==="exports") {
                            args.push(this.module_exports);
                            wait_count--;
                        }
                        else if(depname==="require"){
                            args.push(require);
                            wait_count--;
                        } else{
                            let depModule = Module.fetch(depname,this.module);
                            this.module.deps[depModule.name] = depModule;
                            depModule.ready((mod:Module)=>{
                                args[idx] = mod.value;
                                tryResolve();
                            });
                        }
                        
                    })(this.deps[index],index);
                    tryResolve();
                },0);
            }
            value:any;
            module_exports:any;
           
            static current:RequireContext;
        }
        

        function boot(){
            let scripts = document.scripts;
            for(let i =0,j=scripts.length;i<j;i++){
                let script = scripts[i];
                let require_module = script.getAttribute("require");
                if(require_module){
                    console.info("YA.require is loading init module[" + require_module + "]");
                    Module.fetch(require_module,null).ready(()=>{
                        console.info("init module[" + require_module + "] is loaded.");
                    });
                    break;
                }
            }
            if(window.removeEventListener)
                window.removeEventListener("load",boot,false);
            else if(window.detechEvent)
                window.detechEvent("onload",boot);
        }
        if(window.addEventListener)
            window.addEventListener("load",boot,false);
        else if(window.attachEvent)
            window.attachEvent("onload",boot);
        else window.onload = boot;

        function set_config(cfgs:IRequireConfigs){
            if(cfgs.modules) config_modules(cfgs.modules);
            return define;
        }
        function config_modules(moduleCfgs:TModuleConfigItem[],progress?:(evt:IRequireProgressEventArgs)=>any){
            let evt:IRequireProgressEventArgs = {
                readyCount:0,loadingCount:0,totalCount:moduleCfgs.length
            };
            let callback = (mod:IRequireModule)=>{
                if(mod.isReady)evt.readyCount++;else evt.loadingCount++;
                evt.name = mod.name;
                evt.url = mod.url;
                evt.ready = mod.isReady;
                if(progress) progress(evt);
                return mod;
            };
            for(let item of moduleCfgs){
                let opts :IRequireModuleOpts;
                if(typeof item ==="string"){
                    opts ={url:item};
                }else opts = item;
                let mod:Module;
                if(opts.value){
                    if(!opts.value) {
                        let err= new Error("无法加载模块，未指定名称"); 
                        (err as any).moduleOpts = opts.value;
                        throw err;
                    }
                    define(opts.name,opts.value);
                    callback(Module.fetch(opts.name,null));
                    
                }else{
                    let mod = callback(Module.fetch(opts.url || opts.name,null));
                    if(opts.name) define.modules[opts.name] = mod;
                }
            }
        }

        

        let define = function (name:string|any[]|Function,deps?:any,factory?:any):void{
            //整理参数
            //define(name,deps,statement)
            if(factory===undefined){
                // define(deps,statement) or define(name,value)
                if(typeof name==="string"){
                    //define(name,value);
                    let value:any = deps;
                    let existed = define.modules[name];
                    if(existed){
                        if(existed.isReady&&existed.value===value) return;
                        console.warn(`Module[${name}] is replaced.`,value,existed);
                    }
                    new Module({name:name as string,value:value},null);
                    return;
                }else {
                    factory = deps;
                    deps = name;
                    name = undefined;
                }
                
                if(factory===undefined){
                    //define(statement);
                    factory = deps;
                    deps = undefined;
                }
            }
            
            if(typeof factory !=="function") throw new Error("不正确的参数");
            
            define.context = new RequireContext(name as string,deps as any[],factory);            
        } as IRequireDefine;
        define.modules = {};
        define.create = factory;
        //define.resolveUrl = resolveUrl;
        (define as any).amd = true;
        define.config = set_config;
        window.define = define;
        

        let global_require = function(name:string):IRequireModule{
            return Module.fetch(name,null);
        };
        (global_require as any).config = set_config;
        window.require = global_require;
        define("require",global_require);

        return define;
    }
    factory(null,window);    
})(typeof window!=='undefined'?window:undefined);

