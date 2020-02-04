import {doct, ClassDoct, TAssert,TAssertStatement, MemberDoct} from '../YA.doct';
import * as YA from '../YA.core';

@doct("YA.ObservableProxy")
export class ObservableTest {
    constructor(cdoc:ClassDoct){
        cdoc.description = `可观察的数据模型，可以通过$get/$set来操作它的值`;
        cdoc.description =`它通常用作mvc中的模型model,本质上是一个数据代理。
在本文档中，有时候也用模型/代理等词代指该类型的实例`;
        cdoc.usage("基本用法",(assert_statement:TAssertStatement)=>{
            //0 定义被代理的数据 
            let raw_data = 12;
            //1 创建一个数据代理,它的第一个参数为读/写原始值的函数
            let proxy = new YA.Observable<number>((val)=>val===undefined?raw_data:raw_data=val);
            assert_statement((assert:TAssert)=>{
                assert(YA.DataTypes.Value,proxy.$type,`代理的类型为值类型:proxy.$type === YA.DataTypes.${YA.DataTypes[proxy.$type]}`);
                assert(12,proxy.$target,`代理的目标为当前的值:proxy.$target===12`);
                
            });
            
            //2 可以通过$get()获取到它的值
            let value_beforeSet = proxy.$get();
            assert_statement((assert:TAssert)=>{
                assert(12,value_beforeSet,"value_beforeSet===raw_value===12");
            });

            //2 在代理上注册一个监听器,将接收到的事件参数存入changeInfo
            let changeInfo :YA.IChangeEventArgs<number>;
            proxy.$subscribe((e:YA.IChangeEventArgs<number>)=>changeInfo=e);

            //3 通过$set改变代理的值
            proxy.$set(33);
            let value_afterSet = proxy.$get();
            assert_statement((assert:TAssert)=>{
                assert(33,value_afterSet,"set操作后，代理的数据为修改后的值:value_afterSet===33");
                assert(12,raw_data,"update操作之前，被代理的数据不会变化:raw_value===12");
                assert(12,proxy.$target,"proxy.$target===12");
                assert(33,proxy.$_modifiedValue,"代理内部缓存了最新写入的数据");
                assert(undefined,changeInfo,"监听器也不会触发");
            });

            //4 用最新写入的数据，更新被代理的数据
            proxy.$update();
            assert_statement((assert:TAssert)=>{
                assert(33,raw_data,"更新update操作后，被代理的数据变更为修改后的值:raw_data===33");
                assert(33,proxy.$target,"代理引用的被代理数据变更为新值:proxy.$target===33");
                assert(true,changeInfo!==undefined,"注册的事件被触发");
                assert(33,changeInfo.value ,"事件参数中带有修改的值:changeInfo.value===33");
                assert(12,changeInfo.old ,"以及修改前的值:changeInfo.old===12");
                assert(proxy,changeInfo.sender ,"事件参数的sender字段指明了事件的发送者:changeInfo.sender===proxy");
            });
            
        });
        cdoc.usage("成员不可枚举","所有成员enumerable==false",(assert_statement:TAssertStatement)=>{
            //1 创建一个可观察对象 
            let raw_data = 12;
            let ob = new YA.Observable((val:number)=>val===undefined?raw_data:raw_data=val,{});    

            //2 做一些操作
            ob.$subscribe(()=>{});
            ob.$set(12);

            //3 给可观察对象赋予一个属性
            (ob as any).name = "test";

            let propnames = [];
            //4 枚举可观察对象，记录获取到的属性名
            for(let n in ob) propnames.push(n);

            assert_statement((assert:TAssert)=>{
                assert("name",propnames.join(","),"所有的属性/方法可以使用，但不可枚举:propnames=['name']");
            });
        });
    }
    @doct()
    ctor(mdoc:MemberDoct){
        mdoc.description="构造函数的几种用法";
        mdoc.usage("ctor(初始化值,额外信息?)",(assert_statement:TAssertStatement)=>{
            let data = {};
            let ob = new YA.Observable(data,(val)=>val===undefined?data:data=val,33);
            assert_statement((assert:TAssert)=>{
                assert(data,ob.$target,"指定初值，可观察数据代理的值为初值:ob.$target===data");
                assert(33,ob.$extras,"额外信息为33:ob.$extras===33");
            });  
        });

        mdoc.usage("ctor(原始值访问函数,额外信息?)",(assert_statement:TAssertStatement)=>{
            let data = {};
            let ob = new YA.Observable((val)=>val===undefined?data:data=val,33);
            assert_statement((assert:TAssert)=>{
                assert(data,ob.$target,"可观察数据代理的初值从原始值访问函数中获取:ob.$target===data");
                assert(33,ob.$extras,"额外信息为33:ob.$extras===33");
            });  
        });


        mdoc.usage("ctor(初始化值,原始值访问函数,额外信息?)",(assert_statement:TAssertStatement)=>{
            let data = 12;
            let ob = new YA.Observable(22,(val)=>val===undefined?data:data=val,33);
            assert_statement((assert:TAssert)=>{
                assert(22,ob.$target,"指定初值，可观察数据代理的值为初值:ob1.$target===22");
                assert(22,data, "代理同时会把初值回写回原始数据中:data2===22");
            });  
        });
        mdoc.usage("ctor(上级代理,属性名,额外信息?)",(assert_statement:TAssertStatement)=>{
            let owner= new YA.ObservableObject({name:"yiy"});
            let prop = new YA.Observable(owner,"name",44);
            assert_statement((assert:TAssert)=>{
                assert("yiy",prop.$target,"初值从原始对象中来:prop.$target==='yiy'");
                assert(44,prop.$extras, "额外信息为44:prop.$extras===44");
                assert(owner,prop.$_owner);
            });  
        });
    }
}