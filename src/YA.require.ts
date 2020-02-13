/*
要正确编译该文件，tsconfig必须要配置成
"compilerOptions": {
        "module":"None",
        ..
}
*/
(function(window){    
    //====================================================================
    interface IModuleOpts{
        name?:string;
        url?:string;
        value?:any;
    }
    type TModuleConfigItem = IModuleOpts | string;
    interface IResourceOpts{
        url:string;
        success?:(elem)=>any;
        error?:(err)=>any;
    }
    
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
    
            
    function factory(initModules:{[name:string]:any},window:any,document?:HTMLDocument){
        document|| (document=window.document);
        let head=function():HTMLHeadElement{
            let elems = document.getElementsByTagName("head");
            if(!elems || elems.length==0) return document.body as any;
            let headElem = elems[0] as HTMLHeadElement;
            head = ()=>head as any;
            return headElem;
        }
 
        class Resource {
            element:HTMLElement;
            constructor(public opts:IResourceOpts){
                let elem:any = this.element = this._createElement(opts.url);
                if(opts.success){
                    if(elem.onreadystatechange===null){
                        elem.onreadystatechange = function(e){
                            if(elem.readyState===4|| elem.readyState==="complete"){
                                opts.success(elem);
                            }
                        };
                    }else elem.onload=()=>opts.success(elem);
                }
                
                if(opts.error)elem.onerror =(err)=>opts.error(err);
                this._load(elem);
            }
            _createElement(url:string):HTMLElement{
                let elem = document.createElement("script") as HTMLScriptElement;
                elem.type="text/javascript";
                elem.src = url;
                return elem;
            }
            _load(elem:any){
                head().appendChild(elem);
            }
        }
        class RequireException extends Error{
            is_in_defination_statement:boolean;
            constructor(msg:string,is_in_defination_statement?:boolean){
                super(msg);
                this.is_in_defination_statement = is_in_defination_statement;
            }
        }

        function refreshGlobalExports(){
            if(!window.module) window.module = {};
            return this.module_exports = window.module.exports = window.exports = {};
        }
        
        class Defination{
            constructor(public deps:string[],public statement:Function){}
            value:any;
            module_exports:any;
            execute(module:Module,resolve:(value:any,module_exports:any)=>any){
                this.module_exports = refreshGlobalExports();
                let require = function(name:string){
                    let mod = Module.fetch(name,module);
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
                        try{
                            (define as any).disabled=true;
                            this.value =this.statement.apply(module,args);
                        }catch(ex){
                            if(ex.is_in_defination_statement){

                            }else throw ex;
                        }
                        resolve(this.value,this.module_exports);
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
                    } 
                    let depModule = Module.fetch(depname,module);
                    depModule.ready((mod:Module)=>{
                        args[idx] = mod.value || mod.exports || mod.default;
                        tryResolve();
                    });
                })(this.deps[index],index);
                tryResolve();
            }
        }
        
        function clearUrl(url:string,paths?:string[]){
            let names = url.split('/');
            if(!paths) paths=[];
            for(let i = 0,j=url.length-1;i<j;i++){
                let n = url[i].replace(/(^\s+)|(\s+)$/g,"");
                if(n===".") continue;
                else if(n==="..") paths.pop();
                else if(!n) continue;
                else paths.push(n);
            }
            return paths.join("/") + "/" + names[names.length-1];
        }
        
        class Module {
            resource:Resource;
            url:string;
            resolvedUrl:string;
            name:string;
            exports:any;
            default:any;
            value:any;
            deps:{[name:string]:any};
            paths:string[];
            isReady:boolean;
            _loadCallbacks:{(module:Module):any}[];
            constructor(public opts:IModuleOpts,paths?:string[]){
                if(this.name = opts.name) Module.caches[opts.name] = this;
                if(this.url = opts.url){
                    if(!paths) {
                        paths = [];
                        this.url = clearUrl(this.url,[]);
                    }
                    this.paths = paths;
                    Module.caches[this.url] = this;
                }
                
                this._loadCallbacks=[];
                let resolve = (value,module_exports?)=>{
                    
                    this.value = value;
                    this.exports = module_exports;
                    if(module_exports) this.default = module_exports.default;
                    else if(value) this.default = value.default;

                    let loadCallbacks = this._loadCallbacks;
                    this._loadCallbacks = null;
                    this.isReady = true;
                    (define as any).disabled=false;
                    for(const callback of loadCallbacks){
                        callback.call(this,this);
                    }
                    
                }
                if(opts.value){
                    resolve(opts.value);
                }else{
                    this._loadCallbacks=[];
                    let url = this.resolvedUrl = resolveUrl(opts.url);
                    Module.caches[url] = this;
                    (define as any).disabled=false;
                    this.resource = new Resource({
                        url:url,
                        success:(elem)=>{
                            let defination = (define as any).defination;
                            if(!defination){
                                console.warn(`${this.url}没有调用define定义模块.`);
                                let module_exports = window.exports;
                                refreshGlobalExports();
                                resolve(undefined,module_exports);
                            }else{
                                (define as any).defination=undefined;
                                window.exports={};
                                (define as any).defination.execute(this,resolve);
                            }
                            
                        },
                        error:(e)=>{
                            throw e;
                        }
                    });
                    
                }
               
                
            }
            ready(callback:(module:Module)=>any){
                if(this._loadCallbacks){
                    this._loadCallbacks.push(callback);
                }else{
                    callback.call(this,this);
                }
                return this;
            }

            alias(name:string,force?:boolean):Module{
                let existed =Module.caches[name];
                if(existed){
                    if(existed===this) return this;
                    if(force){
                        console.warn(`模块[${name}]被替换掉了`,existed,this);
                    }else throw new Error(`模块[${name}]被替换掉了`);
                }
                Module.caches[name] = this;
            }
            
            static caches :{[name:string]:Module}={};
            static fetch(name:string,requireModule?:Module){
                if(!name) throw new Error("无法获取模块,未指定模块名/url");
                let existed = Module.caches[name];
                if(!existed) {
                    let url = name;
                    let paths = [];
                    if(name[0]==="." && requireModule){
                        for(const path of requireModule.paths){
                            paths.push(path);
                        }
                        
                    }
                    existed = new Module({url:url},paths);
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

        function boot(){
            let scripts = document.scripts;
            for(let i =0,j=scripts.length;i<j;i++){
                let script = scripts[i];
                let require_module = script.getAttribute("require");
                if(require_module){
                    console.info("YA.require is loading init module[" + require_module + "]");
                    Module.fetch(require_module).ready(()=>{
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
        }
        function config_modules(moduleCfgs:TModuleConfigItem[],progress?:(evt:IRequireProgressEventArgs)=>any){
            let evt:IRequireProgressEventArgs = {
                readyCount:0,loadingCount:0,totalCount:moduleCfgs.length
            };
            let callback = (mod:Module)=>{
                if(mod.isReady)evt.readyCount++;else evt.loadingCount++;
                evt.name = mod.name;
                evt.url = mod.url;
                evt.ready = mod.isReady;
                if(progress) progress(evt);
                return mod;
            };
            for(let item of moduleCfgs){
                let opts :IModuleOpts;
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
                    callback(define(opts.name,opts.value));
                    
                }else{
                    let mod = callback(Module.fetch(opts.url || opts.name));
                    if(opts.name) Module.caches[opts.name] = mod;
                }
            }
        }

        

        let define = function (deps:any[]|string|Function,statement?:any){
            let t = typeof deps;
            if(t==="function"){
                return (deps as Function)(global_require);
            }
            if(t==="string"){
                return new Module({name:deps as string,value:statement});
            }
            if((define as any).disabled) throw new Error("define模块内部不能再调用define.");
            (define as any).defination = new Defination(deps as string[],statement);
        };
        (define as any).create = factory;
        (define as any).resolveUrl = resolveUrl;
        (define as any).amd = true;
        (define as any).config = set_config;
        window.define = define;

        let global_require = function(name:string):Module{
            return Module.fetch(name);
        };
        (global_require as any).config = set_config;
        window.require = global_require;
        define("require",global_require);

        return define;
    }
    factory(null,window);    
})(typeof window!=='undefined'?window:undefined);

