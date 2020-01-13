import {Unittest} from '../Unittest'
import {ValueObservable, ValueProxy}  from '../YA.core'

Unittest.Test("YA.Core",{ 
    "ValueObservable":(assert:(actual:any,expected:any,message?:string)=>any,info:(msg:string,variable?:any)=>any)=>{
        let ob = new ValueObservable<any>();
        let membername;
        for(let n in ob){membername=n;break;}
        assert(membername,undefined,"用for不能获取到任何的成员");

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

    }
});