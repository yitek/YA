import {doct,TAssertStatement,TAssert} from '../../doct';
import * as YA from '../../YA.core';
import * as Ctnr from "../../dom/YA.container";
@doct({
    title:"YA.dom.tab"
    ,descriptions:[
        "选项卡"
    ]
    ,debugging:"composite"
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
            tab:Ctnr.Tab;
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
                <Ctnr.Tab name="tab">
                    <Ctnr.Tab.Panel name="tp1" text="第一个选项卡">第一个选项卡的内容</Ctnr.Tab.Panel>
                    <Ctnr.Tab.Panel name="tp2" text="第二个选项卡" selected={this.selectPn2}>第二个选项卡的内容</Ctnr.Tab.Panel>
                </Ctnr.Tab>
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
            pns:Ctnr.SelectablePanels;
           
            constructor(){
                YA.observable("group","style",this);
            }
            groupStyle(){
                this.style="group";
            }
            tabStyle(){
                this.style="tab";
            }
            selectAll(){
                this.pns.selectAll = true;
            }

            selectNone(){
                this.pns.unselectAll = true;
            }
            
            render(){
                return <div>
                <input type="button" onclick={this.tabStyle} value="选项卡风格" />
                <input type="button" onclick={this.groupStyle} value="分组风格" />
                <input type="button" onclick={this.selectAll} value="全选" />
                <input type="button" onclick={this.selectNone} value="全不选" />
                <Ctnr.SelectablePanels name="pns" panelStyle={this.style}>
                    <Ctnr.SelectablePanel name="tp1" text="第一个选项卡">第一个选项卡的内容</Ctnr.SelectablePanel>
                    <Ctnr.SelectablePanel name="tp2" text="第二个选项卡">第二个选项卡的内容</Ctnr.SelectablePanel>
                </Ctnr.SelectablePanels>
                </div>;
            }
        }

        YA.createComponent(StyleComp,null,demoElement);

        assert_statement((assert:TAssert)=>{
            //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
        });
    }

    
    @doct({
        title:"组合测试"
        ,descriptions:[
            ""
        ]
    })
    composite(assert_statement:TAssertStatement,demoElement?:any){
        class CompositeComp{
            
            
            render(){
                return <div>
                
                <Ctnr.Tab name="tb1">
                    <Ctnr.SelectablePanel name="tp1" text="第一个选项卡">
                        <Ctnr.Group>
                            <Ctnr.Group.Panel text="第一个group">
                                111111111111111111111111111111
                            </Ctnr.Group.Panel>
                            <Ctnr.Group.Panel text="第二个group">
                                <Ctnr.Tab>
                                    <Ctnr.Tab.Panel text="里面的选项卡1">
                                        里面的选项卡1的内容
                                    </Ctnr.Tab.Panel>
                                    <Ctnr.Tab.Panel text="里面的选项卡2">
                                        里面的选项卡2的内容
                                    </Ctnr.Tab.Panel>
                                </Ctnr.Tab>
                            </Ctnr.Group.Panel>
                            <Ctnr.Group.Panel text="第三个group">
                                3
                            </Ctnr.Group.Panel>
                        </Ctnr.Group>
                    </Ctnr.SelectablePanel>
                    <Ctnr.SelectablePanel name="tp2" text="第二个选项卡">第二个选项卡的内容</Ctnr.SelectablePanel>
                </Ctnr.Tab>
                </div>;
            }
        }

        YA.createComponent(CompositeComp,null,demoElement);

        assert_statement((assert:TAssert)=>{
            //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
        });
    }

}