import {doct, ClassDoct, TAssert,TAssertStatement} from '../YA.doct';
import * as YA from '../YA.core';

@doct("YA.ObservableObject")
export class ObservableObjectTest {
    constructor(cdoc:ClassDoct){
        cdoc.description = `可观察的对象代理`;
        cdoc.usage("基本用法",(assert_statement:TAssertStatement)=>{
            let proxy = new YA.ObservableObject<any>({
                id:1,
                title:"YA framework"
            });

            let membernames = [];
            for(const n in proxy) membernames.push(n);
            
            assert_statement((assert:TAssert)=>{
                assert(YA.DataTypes.Object,proxy.$type,`代理的类型为值类型:proxy.$type === YA.DataTypes.${YA.DataTypes[proxy.$type]}`);
                assert("YA framework",proxy.title,"可以访问对象上的数据:proxy.title==='YA framework'");
                assert("id,title",membernames.join(","),"可以且只可以枚举原始数据的字段:membernames=['1','title']");
            });
            
            
            
        });
        
    }
}