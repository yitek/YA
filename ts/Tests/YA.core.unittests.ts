import {Unittest} from '../Unittest'
import {ValueObservable, ValueProxy,ObjectProxy}  from '../YA.core'

Unittest.Test("YA.Core",{ 
    "ValueObservable":(assert:(actual:any,expected:any,message?:string)=>any,info:(msg:string,variable?:any)=>any)=>{
        let ob = new ValueObservable<any>();
        

        let evtArgs = {lisenter1Invoked:false,lisenter2Invoked:false};
        let lisenter1 = (evt)=>evt.lisenter1Invoked=true;
        ob.$subscribe(lisenter1);
        ob.$subscribe((evt)=>evt.lisenter2Invoked=true); 
        ob.$notify(evtArgs); 
        assert(true,evtArgs.lisenter1Invoked,"监听器1应该能收到事件参数")
        assert(true,evtArgs.lisenter2Invoked,"监听器2应该能收到事件参数")

        evtArgs = {lisenter1Invoked:false,lisenter2Invoked:false};
        ob.$unsubscribe(lisenter1);
        ob.$notify(evtArgs);
        assert(false,evtArgs.lisenter1Invoked,"unsubscribe1后，监听器1不应该收到事件参数");
        assert(true,evtArgs.lisenter2Invoked,"listener2未调用unsubscribe,监听器2应该能收到事件参数");

        let membername;
        for(let n in ob){membername=n;break;}
        assert(membername,undefined,"用for不能获取到任何的成员");

    }
    ,"ValueProxy":(assert:(actual:any,expected:any,message?:string)=>any,info:(msg:string,variable?:any)=>any)=>{
        let target = {x:1};
        let proxy = new ValueProxy((value?:any)=>(value===undefined) ?target.x:target.x=value);

        

        assert(1,proxy.$get(),"代理应该可以获取到原先的值");
        proxy.$set(2);
        assert(2,proxy.$get(),"在代理上改变值后，重新获取代理的值应该是新值");
        assert(1,target.x, "在代理上调用$set后，原始的值还应该是旧值");
        assert(2,proxy.$modifiedValue, "在代理上调用$set后，代理内部的$modifiedValue记录了改变的值");

        let evtArgs:any;
        proxy.$subscribe((evt)=>evtArgs = evt);
        proxy.$update();
        assert(2,target.x,"调用$update更新代理后，原始的值变更为新值");
        assert(false,!evtArgs,"事件应该被调用");
        assert(proxy,evtArgs.sender,"事件的发送者应该为代理");
        assert(1,evtArgs.old, "事件对象中应该记录了旧值");
        assert(2,evtArgs.value, "事件对象中应该记录的新值");
        assert(undefined,proxy.$modifiedValue,"$update后，代理内部记录改变的$modifiedValue将会被清空");

        evtArgs=undefined;
        proxy.$update();
        assert(undefined,evtArgs,"虽然调用了$update,由于未对旧值做变更，事件不会触发");

        proxy.$set(2);
        assert(2,proxy.$modifiedValue, "在代理上调用$set后，代理内部的$modifiedValue记录了改变的值");
        proxy.$update();
        assert(undefined,evtArgs, "虽然调用了$update，但新值与旧值一样，监听不会触发");

        let membername;
        for(let n in proxy){membername=n;break;}
        assert(membername,undefined,"用for不能获取到任何的成员");

    }
    ,"ObjectProxy":(assert:(expected:any,actual:any,message?:string)=>any,info:(msg:string,variable?:any)=>any)=>{
        let target = {
            name:"yiy",
            gender:1,
            age:38,
            nick:"yy",
            changeNick:function(val){this.nick = val;}
        };
        let proxy:any = new ObjectProxy((val)=>val===undefined?target:target=val,{
            fieldnames:["name"],
            methodnames:["changeNick"],
            propBuilder:(define)=>{
                define("gender")("age");
            }
        });
        assert("yiy",proxy.name,"代理的字段的值应该跟目标对象的字段的值一样");
        assert(target.changeNick,proxy.changeNick,"代理的方法应该目标对象的方法是同一个");
        assert(38,proxy.age,"代理的属性的值应该跟目标对象的值一样");
        let propAge;
        try{
            ValueProxy.gettingProxy=true;
            propAge = proxy.age;
            
        }finally{
            ValueProxy.gettingProxy=false;
        }
        assert(true,propAge instanceof ValueProxy,"当ValueProxy.gettingProxy开关打开时，属性返回的的是代理对象本身");
        let evtArgs;
        propAge.$subscribe((evt)=>evtArgs = evt);
        assert(proxy,propAge.$owner,"属性上的$owner应该是对象代理");

        proxy.age = 18;
        assert(18,proxy.age,"对象代理的属性改变后，再次取出的值是改变后的值");
        assert(38,target.age,"目标对象的值应该保持不变");
        assert(undefined,evtArgs,"监听器未被触发");
        
        proxy.$update();
        assert(18,target.age,"对象代理调用$update更新后，目标对象的字段值获得更新");
        assert(false,!evtArgs,"监听器已经触发");


        let newTarget = {
            name:"yanyi",
            gender:2,
            age:28,
            nick:"ya",
            changeNick:function(val){this.nick = val;}
        };
        evtArgs=undefined;
        proxy.$set(newTarget);
        assert(newTarget,proxy.$modifiedValue,"更换目标对象后，代理对象上的$modifiedValue变更为新对象");
        assert(target,proxy.$target,"更换目标对象后，代理对象上的$target还保持为原先的对象");
        assert("yanyi",proxy.name,"更换目标对象后，代理上的字段的值是新的对象的字段值");
        assert(2,proxy.gender,"更换目标对象后，属性值是新的对象的字段值");
        assert(28,proxy.age,"更换目标对象后，属性值是新的对象的字段值");
        assert(true,evtArgs===undefined,"更换目标对象后，监听器尚未被调用");

        assert("yiy",target.name,"原始对象的值还未被改变");
        assert(1,target.gender,"原始对象的值还未被改变");

        proxy.$update();
        assert(newTarget,target,"$update后，原始对象应该更换为新的对象");
        assert(28,proxy.age,"更换目标对象，且$update后，属性值u欧美广告是新的对象的字段值");
        assert(true,evtArgs!==undefined,"$update后，代理上的监听器应该被调用");

        let membernames={
            "name":false,
            "age":false,
            "gender":false
        };
        for(let n in proxy){
            if(membernames[n]===undefined) assert("name,age,gender",n,"用for应该只能能获取到[name,age,gender]");
            membernames[n]=true;
        }
        for(let n in membernames){
            if(!membernames[n]) assert(n,false,"用for应该能获取到以下成员[name,age,gender]");
            
        }
    }
});