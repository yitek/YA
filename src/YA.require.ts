(function(window){    
    //====================================================================
        
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
        
        class Defination{
            constructor(public deps:string[],public statement:Function){}
            value:any;
            module_exports:any;
            execute(module:Module,resolve:(value:any,module_exports:any)=>any){
                if(!window.module) window.module = {};
                let module_exports = this.module_exports = window.module.exports = window.exports = {};
                let require = function(name:string){
                    let mod = Module.fetch(name);
                    if(!mod.isReady){
                        wait_count++;
                        mod.ready((mod)=>{
                            tryResolve();
                        });
                        throw new RequireException(`module[${name} is not ready.`,true);
                    }
                    return mod.value||mod.exports||mod.default;
                };
                let args = [];
                let wait_count=this.deps.length;
                let tryResolve =()=>{
                    if((--wait_count)===0){
                        try{
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
                        args.push(module_exports);
                        wait_count--;
                    }
                    else if(depname==="require"){
                        args.push(require);
                        wait_count--;
                    } 
                    let depModule = Module.fetch(depname);
                    depModule.ready((mod:Module)=>{
                        args[idx] = mod.value || mod.exports || mod.default;
                        tryResolve();
                    });
                })(this.deps[index],index);
                tryResolve();
            }
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
            isReady:boolean;
            _loadCallbacks:{(module:Module):any}[];
            constructor(public opts:IModuleOpts){
                if(this.name = opts.name) Module.caches[opts.name] = this;
                if(this.url = opts.url)Module.caches[opts.url] = this;
                let resolve = (value,module_exports?)=>{
                    
                    this.value = value;
                    this.exports = module_exports;
                    if(module_exports) this.default = module_exports.default;
                    else if(value) this.default = value.default;

                    let loadCallbacks = this._loadCallbacks;
                    this._loadCallbacks = null;
                    this.isReady = true;

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
                    this.resource = new Resource({
                        url:url,
                        success:(elem)=>{
                            (define as any).defination.execute(this,resolve);
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
            static fetch(name:string){
                let existed = Module.caches[name];
                if(!existed) existed = new Module({url:name});
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
            for(let i in scripts){
                let script = scripts[i];
                let require_module = script.getAttribute("require");
                if(require_module){
                    Module.fetch(require_module);
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


        let define = function (deps:any[]|string,statement:any){
            if(typeof deps==="string"){
                new Module({name:deps as string,value:statement});
                return;
            }
            (define as any).defination = new Defination(deps,statement);
        };
        (define as any).create = factory;
        (define as any).resolveUrl = resolveUrl;
        (define as any).amd = true;
        window.define = define;
        return define;
    }
    factory(null,window);    
})(typeof window!=='undefined'?window:undefined);

interface IModuleOpts{
    name?:string;
    url?:string;
    value?:any;
}
interface IResourceOpts{
    url:string;
    success?:(elem)=>any;
    error?:(err)=>any;
}
interface IRequireConfigs{

    /**
     * url的解析规则
     *
     * @type {*}
     * @memberof IRequireConfigs
     */
    resolve_rules:any;

    /**
     * 预先加载的模块
     *
     * @type {*}
     * @memberof IRequireConfigs
     */
    modules:any;
}


