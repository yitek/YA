import {doct, ClassDoct, TAssert,TAssertStatement, MemberDoct,outputToElement} from '../YA.doct';
import * as YA from '../YA.core';

doct.output = outputToElement;

@doct("YA.component")
export class componentTest {
    constructor(cdoc:ClassDoct){
        cdoc.description = `UI控件`;
        cdoc.usage("基本用法",(assert_statement:TAssertStatement,container:any)=>{
            @YA.component("My")
            class MyComponent{
                @YA.reactive()
                model={title:"YA framework"};

                readonly:boolean;
                @YA.template()
                render(container?:any){
                    return <div onclick={this.changeTitle}>点击这里会弹出一个输入框,输入的文本将显示在这里:[{this.model.title}].</div>;
                }
                rows=[];
            
                item;
                col;

                tpl(container,outer_vnode){
                    return <table class={YA.EXP(this.model.title,(t)=>t+"px")}>
                        <thead>
                <tr for={[outer_vnode.children,this.col]}><th if={YA.NOT(this.col.disabled)}>{this.col.name}</th></tr>
                        </thead>
                        <tbody for={[this.rows,this.item]}>
                <tr for={[outer_vnode.children,this.col]}><td>{this.item[this.col]}</td></tr>
                        </tbody>
                        
                    </table>;
                }

                changeTitle(e){
                    let newTitle = window.prompt("请输入新的标题:",this.model.title);
                    this.model.title = newTitle;
                }

            };

            let myComponent = new MyComponent();
            myComponent.render(container);
            
            assert_statement((assert:TAssert)=>{
                //assert(YA.DataTypes.Object,proxy.$type,`代理的类型为值类型:proxy.$type === YA.DataTypes.${YA.DataTypes[proxy.$type]}`);
                //assert("YA framework",proxy.title,"可以访问对象上的数据:proxy.title==='YA framework'");
                //assert("id,title",membernames.join(","),"可以且只可以枚举原始数据的字段:membernames=['1','title']");
            });
            
        });

        cdoc.usage("模板函数中的if",(assert_statement:TAssertStatement,container:any)=>{
            @YA.component("My")
            class MyComponent{
                @YA.reactive()
                model={title:"YA framework",showTitle:true};
                @YA.template()
                render(container?:any){
                    return <div>
                        <input type="checkbox" checked={this.model.showTitle} onclick={this.changeState} />可以用checkbox控制后面的文本的显示:
                        <div if={this.model.showTitle}>[{this.model.title}]</div>
                        <span>---->这是文本后面的文字</span>
                    </div>;
                }
                changeState(e){
                    this.model.showTitle = !this.model.showTitle;
                }

            };

            let myComponent = new MyComponent();
            myComponent.render(container);
        });

        
        cdoc.usage("模板函数中的for",(assert_statement:TAssertStatement,container:any)=>{
            @YA.component("My")
            class MyComponent{
                @YA.reactive()
                queries={title:""};
                @YA.reactive()
                rows=[{"$__ONLY_USED_BY_SCHEMA__":true,title:"YA-v1.0",author:{name:"yiy"}}];
                @YA.reactive(YA.ReactiveTypes.Iterator)
                item=this.rows[0];

                data=[
                    {title:"YA-v1.1",author:{name:"yiy1"}}
                    ,{title:"YA-v2.1",author:{name:"yiy2"}}
                    ,{title:"YA-v3.2",author:{name:"yiy3"}}
                    ,{title:"YA-v4.2",author:{name:"yiy1"}}
                    ,{title:"YA-v5.3",author:{name:"yiy2"}}
                    ,{title:"YA-v6.4",author:{name:"yiy3"}}
                    ,{title:"YA-v7.4",author:{name:"yiy1"}}

                ];
                
                @YA.template()
                render(container?:any){
                    return <div>
                        <div>
                            <input type="text" placeholder="标题" value={this.queries.title} onblur={this.changeTitle}/>
                            <button  onclick={this.doFilter}>过滤</button>
                        </div>
                        <table border="1" cellspacing="0" style={{border:"1px"}}>
                            <thead>
                                <tr><th>标题</th><th>作者</th></tr>
                            </thead>
                            <tbody for={[this.rows,this.item]}>
                <tr><td>{this.item.title}</td><td>{this.item.author.name}</td></tr>
                            </tbody>
                        </table>
                    </div>;
                }
               
                
                
                changeTitle(e){
                    this.queries.title = e.target.value;
                }
                doFilter(e){
                    let rows = [];
                    for(const item of this.data){
                        //let item = this.data[i];
                        if(item.title.indexOf(this.queries.title)>=0) rows.push(item);
                    }
                    this.rows=rows;
                }

            };

            let myComponent = new MyComponent();  
            myComponent.rows= myComponent.data as any;
            myComponent.render(container);
            
        });
    }
    @doct()
    composite(mdoc:MemberDoct){
        mdoc.usage("控件组合使用",(assert_statement:TAssertStatement,container:any)=>{
            @YA.component("CompA")
            class CompA{
                @YA.reactive(YA.ReactiveTypes.In)
                name="";
                @YA.reactive(YA.ReactiveTypes.Out)
                signture="";
                @YA.template()
                render(){
                    return <div>  My name is {this.name},my signture is here:
                        <input type="text" value={this.signture} onblur={this.onblur}/>
                    </div>
                }

                onblur(e){
                    this.signture = e.target.value;
                }
            }

            @YA.component("CompB")
            class CompB{
                @YA.reactive()
                myname="yiy";
                @YA.reactive()
                mysignture="";

                @YA.template()
                render(container:any){
                    return <div>
                        <button onclick={this.changeMyName}>点击这里修改名称</button>
                        <fieldset>
                            <legend>签名</legend>
                            <CompA name={this.myname} signture={this.mysignture}/>
                        </fieldset>
                        你的签名:{this.mysignture}
                    </div>
                }

                changeMyName(){
                    let newName = prompt("修改我的名字",this.myname);
                    this.myname= newName;
                }
            }

            let b = new CompB();
            b.render(container);
        });
    }
    
}