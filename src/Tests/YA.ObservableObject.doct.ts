import {doct, ClassDoct, TAssert,TAssertStatement, MemberDoct} from '../YA.doct';
import * as YA from '../YA.core';

@doct("YA.ObservableObject")
export class ObservableObjectTest {
    constructor(cdoc:ClassDoct){
        cdoc.description = `可观察的对象代理`;
        cdoc.usage("基本用法",(assert_statement:TAssertStatement)=>{
            let data = {
                id:1,
                title:"YA framework"
            };
            // 1 创建一个Observable代理/模型
            let proxy = new YA.ObservableObject<any>(data);

            let membernames = [];
            for(const n in proxy) membernames.push(n);
            
            assert_statement((assert:TAssert)=>{
                assert(YA.DataTypes.Object,proxy.$type,`代理的类型为值类型:proxy.$type === YA.DataTypes.${YA.DataTypes[proxy.$type]}`);
                assert("YA framework",proxy.title,"可以访问对象上的数据:proxy.title==='YA framework'");
                assert("id,title",membernames.join(","),"可以且只可以枚举原始数据的字段:membernames=['1','title']");
            });
            // 2 用usingMode改变ob的访问模式，获取到属性的代理(而不是值)
            // 在title属性上注册一个事件监听
            let titleChangeInfo:YA.IChangeEventArgs<string>;
            YA.proxyMode(()=>{
                (proxy.title as YA.IObservable<string>).$subscribe((e)=>{
                    titleChangeInfo = e;
                });
            });
            //3 改变模型的属性的值
            proxy.title = "YA framework v1.0";
            assert_statement((assert:TAssert)=>{
                assert("YA framework v1.0",proxy.title,"模型上的title属性的值变更为新值:proxy.title==='YA framework v1.0'");
                assert("YA framework",data.title,"更新模型前，原始数据的值不会被改变:data.title === 'YA framework'");
                assert(undefined,titleChangeInfo,"注册的监听器不会触发");
            });
            //在Proxy访问模式下，可以从模型中获取到原始的值
            let raw_title_value:string;
            YA.proxyMode(()=>{
                raw_title_value = (proxy.title as YA.IObservable<string>).$get(YA.ObservableModes.Raw) as string;
            });
            assert_statement((assert:TAssert)=>{
                assert("YA framework",raw_title_value,"raw_title_vale === 'YA framework'");
            });
            // 4 更新模型
            proxy.$update();
            assert_statement((assert:TAssert)=>{
                assert("YA framework v1.0",data.title,"原始数据的属性被写入新值:data.title==='YA framework v1.0'");
                assert(true,titleChangeInfo!==undefined,"注册在title上的事件被触发");
                assert(true,titleChangeInfo.old==="YA framework" && titleChangeInfo.value==="YA framework v1.0","事件参数记录了新值与旧值:evt.value==='YA framework v1.0',evt.old==='YA framework'");
            });
        });

        cdoc.usage("非平坦对象",(assert_statement:TAssertStatement)=>{
            let proxy = new YA.ObservableObject<any>({
                author:{name:"yiy",email:"y-tec@qq.com"},
                title:"YA"
            });
            
            assert_statement((assert:TAssert)=>{
                assert("yiy",proxy.author.name,"可以访问对象的对象:proxy.author.name==='yiy'");
            });
        });
        
    }
    
}