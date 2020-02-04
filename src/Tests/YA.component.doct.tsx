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

        
        
    }
    
}