import {doct, ClassDoct, TAssert,TAssertStatement, MemberDoct,outputToElement} from '../YA.doct';
import * as YA from '../YA.core';

doct.output = outputToElement;

@doct("YA.dom")
export class DomTest {
    constructor(cdoc:ClassDoct){
        cdoc.description = `UI控件`;
        cdoc.usage("基本用法",(assert_statement:TAssertStatement,container:any)=>{
        });

        
    }
    @doct()
    mask(mdoc:MemberDoct){
        mdoc.usage("遮挡",(assert_statement:TAssertStatement,container:any)=>{
            @YA.component("CompA")
            class Comp{
                maskText:boolean|string=false;
                render(container:any){
                    return <div><div style="width:200px;height:200px;padding:10px;background-color:#ffffff;border:2px solid black;color:black;font-size:24px;font-weight:bold;" mask={this.maskText}>被遮挡的内容</div><a onclick={this.changeMask}>点击我可以交替遮罩效果</a></div>;
                }
                changeMask(e){
                    if(this.maskText) this.maskText=false;
                    else this.maskText ="遮挡";
                }
            }

            let b = new Comp();
            b.render(container);
        });
    }
    
}