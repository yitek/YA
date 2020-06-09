import {doct,TAssertStatement,TAssert} from '../doct';
import * as YA from '../YA.core';
import * as Ob from '../YA';
@doct({
    title:"YA.Observable"
    ,descriptions:[
        "YA.Observable是YA框架最基本的构成。YA通过该对象来捕捉对象的变化。代表一个number,string,object,array"
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
        

        assert_statement((assert:TAssert)=>{
            //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
        });
    }


}