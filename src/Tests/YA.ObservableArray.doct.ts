import {doct, ClassDoct, TAssert,TAssertStatement, MemberDoct} from '../YA.doct';
import * as YA from '../YA.core';

@doct("YA.ObservableArray")
export class ObservableArrayTest {
    constructor(cdoc:ClassDoct){
        cdoc.description = `可观察的数组代理`;
        cdoc.usage("基本用法",(assert_statement:TAssertStatement)=>{
            let data = ["yi","yan","YA"];
            // 1 创建一个Observable代理/模型
            let proxy = new YA.ObservableArray<string>(data);

            let membernames = [];
            for(const n in proxy) membernames.push(n);
            
            assert_statement((assert:TAssert)=>{
                assert(YA.DataTypes.Array,proxy.$type,`代理的类型为值类型:proxy.$type === YA.DataTypes.${YA.DataTypes[proxy.$type]}`);
                let str = proxy[0] +"," + proxy[1] + "," + proxy[2];
                assert(3,proxy.length,`代理的类型为值类型:proxy.length === 3`);
                assert("yi,yan,YA",str,"通过下标访问数组项的值:proxy[0]==='yi',proxy[1]==='yan',proxy[2]==='YA'");
                assert("0,1,2",membernames.join(","),"可以且只可以枚举下标:membernames=[0,1,2]");
            });

            let evtForIndex2:YA.IChangeEventArgs<string>;
            YA.proxyMode(()=>{
                proxy[2].$subscribe((e)=>evtForIndex2=e);
            });

            proxy[2] = "YA framework";

            assert_statement((assert:TAssert)=>{
                let str = proxy[0] +"," + proxy[1] + "," + proxy[2];
                assert("yi,yan,YA framework",str,"数组代理的项值变更为:proxy[0]==='yi',proxy[1]==='yan',proxy[2]==='YA framework'");
                assert("YA",data[2],"原始数组的项值保持不变:data[2]==='YA'");
                assert(undefined,evtForIndex2,"监听器未触发");
            });

            //更新数组代理
            proxy.$update();

            assert_statement((assert:TAssert)=>{
                
                assert("yi,yan,YA framework",data.toString(),"原始数据的项值被更新:data==['yi','yan','YA framework']");
                assert(true,evtForIndex2!==undefined,"监听器被触发");
                assert(2,evtForIndex2.index,"事件参数可获得被更新的下标:evtForIndex2.index===2");
                assert("YA framework",evtForIndex2.value,"新的项值:evtForIndex2.index===2");
            });
            
        });

        
    }
    @doct()
    objectArray(mdoc:MemberDoct){
        mdoc.description="数组项为对象的ObservableArray";
        mdoc.usage((assert_statement:TAssertStatement)=>{
            let data = [
                {title:"YA-v1.0",author:{name:"yiy1"}}
                    ,{title:"YA-v2.0",author:{name:"yiy2"}}
                    ,{title:"YA-v3.0",author:{name:"yiy3"}}
                    ,{title:"YA-v4.0",author:{name:"yiy1"}}
                    

            ];
            // 1 创建一个ObservableArray代理/模型
            let obArray = new YA.ObservableArray<any>(data);

            assert_statement((assert:TAssert)=>{
                assert(4,obArray.length,"有4个项:proxy.length===4");
                let item0 = obArray[0];
                debugger;
                let item0Value = item0.title + item0.author.name;
                assert("YA-v1.0yiy1",item0Value,"obArray[0]=={title:'YA-v1.0',author:{name:'yiy1'}}");
                let item3 = obArray[3];
                let item3Value = item3.title + item3.author.name;
                assert("YA-v4.0yiy1",item3Value,"obArray[3]=={title:'YA-v4.0',author:{name:'yiy1'}}");
            });

            obArray[3].author={name:"yiy4"};
            assert_statement((assert:TAssert)=>{
                assert("yiy4",obArray[3].author.name,`代理上的值变更为新值:obArray[3].author.name="yiy4"`);
                assert("yiy1",data[3].author.name,`原始数据的值还未变化:data[3].author.name="yiy1"`);
            });
            
            let newData = [
                {title:"YA-v5.0",author:{name:"yiy2"}}
                ,{title:"YA-v6.0",author:{name:"yiy3"}}
                ,{title:"YA-v7.0",author:{name:"yiy1"}}
            ];
            obArray.$set(newData);
        });
    }
    
}