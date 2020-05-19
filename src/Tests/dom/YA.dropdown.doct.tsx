import {doct,TAssertStatement,TAssert} from '../../doct';
import * as YA from '../../YA.core';
import * as Dom from "../../dom/YA.dom";
@doct({
    title:"YA.dom.dropdown"
    ,descriptions:[
        "下拉"
    ]
})
export class DropdownTest {
    constructor(){
    }
    
    @doct({
        title:"基本用法"
        ,descriptions:[
            "直接用mask函数创建遮罩"
        ]
    })
    base(assert_statement:TAssertStatement,demoElement?:any){
        class BaseComp{
            
            constructor(){
               
            }
            
            render(){
                return <div>
                    <input type="text" id="BaseDropdown" style={{"marginLeft":"300px",width:"100px"}} />
                    <ul class="test-dropdown" style={{"display":"none"}}>
                        <li>Item1</li>
                        <li>Item2</li>
                        <li>Item3</li>
                        <li>Item411111111111111111111111111111111</li>
                    </ul>                    
                </div>;
            }
            rendered(elem:HTMLElement){
                let input = elem.firstElementChild;
                let dropContent = elem.lastElementChild;
                let dp = new Dom.Dropdownable(input as any,{content:dropContent});
            }
        }

        YA.createComponent(BaseComp,null,demoElement);

        assert_statement((assert:TAssert)=>{
            //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
        });
    }


}