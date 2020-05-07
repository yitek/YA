import {doct,TAssertStatement,TAssert} from '../../doct';
import * as YA from '../../YA.core';
import * as Dom from "../../YA.dom";
@doct({
    title:"YA.dom.tab"
    ,descriptions:[
        "选项卡"
    ]
    ,debugging:"style"
})
export class TabTest {
    constructor(){
    }
    
    @doct({
        title:"基本用法"
        ,descriptions:[
            ""
        ]
    })
    base(assert_statement:TAssertStatement,demoElement?:any){
        class TabBasComp{
            
            selectPn2:boolean;
            tab:Dom.Tab;
            constructor(){
                YA.observable(true,"selectPn2",this);
            }
            changeTab(){
                let name = prompt("只能填写tp1,tp2其中一个",this.tab.selected[0]);
                if(name!=="tp1" && name!=="tp2"){return;}
                this.tab.selected = [name];
            }
            changeAttr(){
                this.selectPn2 = confirm("Yes=显示第二个卡,No=取消第二个卡片的显示");
            }
            
            render(){
                return <div>
                <input type="button" onclick={this.changeTab} value="通过修改tab.selected选中第一个卡" />
                <input type="button" onclick={this.changeAttr} value="通过修改TabBasComp.selectPn2选中第二个卡" />
                <Dom.Tab name="tab">
                    <Dom.Tab.Panel name="tp1" label="第一个选项卡">第一个选项卡的内容</Dom.Tab.Panel>
                    <Dom.Tab.Panel name="tp2" label="第二个选项卡" selected={this.selectPn2}>第二个选项卡的内容</Dom.Tab.Panel>
                </Dom.Tab>
                </div>;
            }
        }

        YA.createComponent(TabBasComp,null,demoElement);

        assert_statement((assert:TAssert)=>{
            //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
        });
    }

    @doct({
        title:"风格切换"
        ,descriptions:[
            ""
        ]
    })
    style(assert_statement:TAssertStatement,demoElement?:any){
        class StyleComp{
            
            style:string;
           
            constructor(){
                YA.observable("group","style",this);
            }
            groupStyle(){
                this.style="group";
            }
            tabStyle(){
                this.style="tab";
            }
            
            render(){
                return <div>
                <input type="button" onclick={this.tabStyle} value="选项卡风格" />
                <input type="button" onclick={this.groupStyle} value="分组风格" />
                <Dom.SelectablePanels name="pns" panelStyle={this.style}>
                    <Dom.SelectablePanel name="tp1" label="第一个选项卡">第一个选项卡的内容</Dom.SelectablePanel>
                    <Dom.SelectablePanel name="tp2" label="第二个选项卡">第二个选项卡的内容</Dom.SelectablePanel>
                </Dom.SelectablePanels>
                </div>;
            }
        }

        YA.createComponent(StyleComp,null,demoElement);

        assert_statement((assert:TAssert)=>{
            //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
        });
    }


}