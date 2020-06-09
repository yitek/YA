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
        let options = {
            "footboall":"足球"
            ,"basketball":"篮球"
            ,"swimming":"游泳"
        };
        YA.createElement(<Dom.Dropdown id="sport" options={options} fields={{"Text":"运动"}}/>,demoElement);

        assert_statement((assert:TAssert)=>{
            //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
        });
    }


}