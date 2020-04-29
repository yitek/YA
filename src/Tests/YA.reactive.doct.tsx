import {doct,TAssertStatement,TAssert} from '../doct';
import YA from '../YA.core';

@doct({
    title:"YA.component"
    ,descriptions:[
        "ts等的支持"
    ]
})
export class ComponentTest {
    constructor(){
    }
    
    @doct({
        title:"基本用法"
        ,descriptions:[
            "用dispose(callback)注册释放时的回调"
            ,"用dispose(any)来释放资源"
        ]
    })
    base(assert_statement:TAssertStatement,demoElement?:any){
        class Comp{
            @YA.reactive()
            number1=1;
            number2:any;
            number3:any;
            constructor(){
                YA.reactive(YA.ReactiveTypes.Internal,22,"number2",this);
                this.number3 = YA.reactive(YA.ReactiveTypes.Internal,3);
            }
            

            changeNumber1(){
                this.number1 = parseInt(prompt("number1:",this.number1 as any as string));
            }
            changeNumber2(){
                this.number2 = parseInt(prompt("number2:",this.number2 as any as string));
            }
            changeNumber3(){
                this.number3.set(prompt("number3:",this.number3.get()));
            }
            render(){
                return <div>
                    <button onclick={this.changeNumber1}>修改number1</button>
                    <button onclick={this.changeNumber2}>修改number2</button>
                    <button onclick={this.changeNumber3}>修改number3</button>
                    <div>
                        {this.number1} + {this.number2} + {this.number3}
                    </div>
                    
                </div>;
            }
        }

        YA.createComponent(Comp,null,demoElement);

        assert_statement((assert:TAssert)=>{
            //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
        });
    }

}