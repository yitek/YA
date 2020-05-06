import {doct,TAssertStatement,TAssert} from '../../doct';
import * as YA from '../../YA.core';
import * as Dom from "../../YA.dom";
@doct({
    title:"YA.dom.tab"
    ,descriptions:[
        "选项卡"
    ]
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
            
            constructor(){
               
            }
            
            render(){
                return <Dom.Tab>
                    <Dom.Tab.Panel name="tp-1" label="第一个选项卡">第一个选项卡的内容</Dom.Tab.Panel>
                    <Dom.Tab.Panel name="tp-2" label="第二个选项卡">第二个选项卡的内容</Dom.Tab.Panel>
                </Dom.Tab>;
            }
        }

        YA.createComponent(TabBasComp,null,demoElement);

        assert_statement((assert:TAssert)=>{
            //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
        });
    }


}