import {doct,TAssertStatement,TAssert} from '../../doct';
import * as YA from '../../YA.core';
import * as Dom from "../../YA.dom";
@doct({
    title:"YA.dom.mask"
    ,descriptions:[
        "遮罩"
    ]
})
export class MaskTest {
    constructor(){
    }
    
    @doct({
        title:"基本用法"
        ,descriptions:[
            "直接用mask函数创建遮罩"
        ]
    })
    base(assert_statement:TAssertStatement,demoElement?:any){
        class Comp{
            
            constructor(){
               
            }
            showMask(){
                Dom.mask(document.getElementById("masked"),"前面的消息");
            }
            hideMask(){
                Dom.mask(document.getElementById("masked"),false);
            }
            render(){
                return <div>
                    <button onclick={this.showMask}>show</button>
                    <button onclick={this.hideMask}>hide</button>
                    <div id="masked">
                        这是一些内容<br />
                        可能有些长
                    </div>
                    
                </div>;
            }
        }

        YA.createComponent(Comp,null,demoElement);

        assert_statement((assert:TAssert)=>{
            //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
        });
    }

    @doct({
        title:"用属性控制遮罩"
        ,descriptions:[
            ""
        ]
    })
    attr(assert_statement:TAssertStatement,demoElement?:any){
        class Comp {
           
            @YA.reactive()
            mask:string|boolean=false;
            showMask(){
                this.mask =prompt("请填写消息内容",this.mask as string);
            }
            hideMask(){
                this.mask = false;
            }
            
            render(){
                return <div>
                    <button onclick={this.showMask}>show</button>
                    <button onclick={this.hideMask}>hide</button>
                    <div style={{backgroundColor:"green",width:"200px",height:"100px"}} mask={this.mask}>
                        这是一些内容<br />
                        可能有些长
                    </div>
                    
                </div>;
            }
        }

        YA.createComponent(Comp,null,demoElement);

        assert_statement((assert:TAssert)=>{
            //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
        });
    }

    @doct({
        title:"用属性控制遮罩"
        ,descriptions:[
            ""
        ]
    })
    maskComp(assert_statement:TAssertStatement,demoElement?:any){
        class MaskableComp extends Dom.Component{
           
            
            showMask(){
                this.mask =prompt("请填写消息内容",this.mask as string);
                setTimeout(()=>{
                    this.mask=false;
                },5000);
            }
            
            
            render(){
                return <div>
                    <button onclick={this.showMask}>show</button>
                    <div style={{backgroundColor:"green",width:"200px",height:"100px"}}>
                        这是一些内容<br />
                        可能有些长<br />
                        遮罩产生后5秒会退出
                    </div>
                    
                </div>;
            }
        }

        YA.createComponent(MaskableComp,null,demoElement);

        assert_statement((assert:TAssert)=>{
            //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
        });
    }

}