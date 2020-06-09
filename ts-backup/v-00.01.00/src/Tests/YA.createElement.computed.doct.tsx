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
                this.number1 = parseInt(prompt("修改N1:",this.number1));
            };
            this.changeN2 = function(){
                this.number2 = parseInt(prompt("修改N2:",this.number2));
            };
            this.render= function(descriptor){
                return <div>
                    <button onclick={this.changeN1}>修改n1</button>
                    <button onclick={this.changeN2}>修改n2</button>
            {this.number1} + {this.number2} = {YA.computed((n1,n2)=>n1+n2,this.number1,this.number2)}
                </div>;
            }
        };
        
        YA.createComponent(CompBase,null,demoElement);
        
        assert_statement((assert:TAssert)=>{
            
        });
    }

    @doct({
        title:"控件值的computed绑定"
        ,descriptions:[
            "模板中使用表达式"
        ]
    })
    inComp(assert_statement:TAssertStatement,demoElement?:any){
        function InnerComp(){
                        
            let n2 = YA.observable(1,"number2",this);
            let n3 = YA.observable(2,"number3",this);
            this.changeN3 = function(){
                this.number3 = parseInt(prompt("修改number3:",this.number3));
            };
            
            this.render= function(descriptor){
                return <div class="yellow-block">
                    控件InnerComp:
                    <button onclick={this.changeN3}>修改InnerComp.number3</button>
                    <div>
           number2({this.number2}) + number3({this.number3}) = {YA.computed((n1,n2)=>n1+n2,this.number2,this.number3)}</div>
            </div>;
            }
        }
        function OuterComp(){
            let n1 = YA.observable(7,"number1",this);
            this.changeN1 = function(){
                this.number1 = parseInt(prompt("修改number1:",this.number1));
            };
            this.render = function(){
                return <div class="red-block">
                    <button onclick={this.changeN1}>修改OuterComp.number1</button>
                    <div>InnerComp.number2 = OuterComp.number1({this.number1}) + 100</div>
                    <InnerComp number2={YA.computed(n=>n+100,this.number1)}/>
                </div>;
            };
               
        };
        
        YA.createComponent(OuterComp,null,demoElement);
        
        assert_statement((assert:TAssert)=>{
            
        });
    }


}