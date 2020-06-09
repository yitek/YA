import {doct,TAssertStatement,TAssert} from '../doct';
import YA from '../YA.core';

@doct({
    title:"YA.createElement.condition"
    ,descriptions:[
        "模板中的if,if-not,empty,not-empty功能测试"
    ]
    //,debugging:"complex"
})
export class createElementExprTest {
    constructor(){
    }
    
    @doct({
        title:"if标签"
        ,descriptions:[
            "模板中使用if,if-not标签"
        ]
    })
    if(assert_statement:TAssertStatement,demoElement?:any){
        function IfComp(){
            
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
                    <div class="blue-block" if-not={this.swicher}>this is the content of Panel2</div>
                </div>;
            }
        };
        
        YA.createComponent(IfComp,null,demoElement);
        
        assert_statement((assert:TAssert)=>{
            
        });
    }



}