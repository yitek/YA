import {doct,TAssertStatement,TAssert} from '../doct';
import YA from '../YA.core';

@doct({
    title:"YA.createElement.if"
    ,descriptions:[
        "模板中的if"
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
        function Comp(){
            
            let swicher = YA.observable(true,"swicher",this);
            this.panel1Click = function(){
                this.swicher = true;
            };
            this.panel2Click = function(){
                this.swicher = false;
            };
            
            this.render= function(descriptor){
                return <div>
                    <div>
                        <span onclick={this.panel1Click}>Panel 1</span>
                        <span onclick={this.panel2Click}>Panel 2</span>
                    </div>
                    <div class="red-block" if={this.swicher}>this is the content of Panel1</div>
                    <div class="blue-block" if={YA.not(this.swicher)}>this is the content of Panel2</div>
                </div>;
            }
        };
        
        YA.createComponent(Comp,null,demoElement);
        
        assert_statement((assert:TAssert)=>{
            
        });
    }



}