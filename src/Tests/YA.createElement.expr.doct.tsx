import {doct,TAssertStatement,TAssert} from '../doct';
import YA from '../YA.core';

@doct({
    title:"YA.createElement.expr"
    ,descriptions:[
        "模板中的表达式"
    ]
    //,debugging:"complex"
})
export class createElementExprTest {
    constructor(){
    }
    
    @doct({
        title:"基本用法"
        ,descriptions:[
            "模板中使用表达式"
        ]
    })
    base(assert_statement:TAssertStatement,demoElement?:any){
        function CompBase(){
            
            let n1 = YA.observable(1,"number1",this);
            let n2 = YA.observable(2,"number2",this);
            this.changeN1 = function(){
                this.number1 = prompt("修改N1:",this.number1);
            };
            this.changeN2 = function(){
                this.number2 = prompt("修改N2:",this.number2);
            };
            this.render= function(descriptor){
                return <div>
                    <button onclick={this.number1}>修改n1</button>
                    <button onclick={this.number2}>修改n2</button>
                    {YA.CALL((n1,n2)=>n1+n2,this.number1,this.number2)}
                </div>;
            }
        };
        
        YA.createComponent(CompBase,null,demoElement);
        
        assert_statement((assert:TAssert)=>{
            
        });
    }


}