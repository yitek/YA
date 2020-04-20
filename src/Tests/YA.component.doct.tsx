import {doct,TAssertStatement,TAssert} from '../doct';
import YA from '../YA.core';

@doct({
    title:"YA.component"
    ,descriptions:[
        "某些对象在运行中引用了外部的资源，当这些对象被系统/框架释放时，需要同时释放他们引用的资源。"
        ,"该类为这些可释放对象的基类。提供2个函数,dispose跟deteching。"
        ,"dispose(callback:Function)表示注册一个回调函数监听资源释放，一旦发生释放，这些回调函数就会被挨个调用;dispose(obj)表示释放资源，该函数完成后，$isDisposed就会变成true"
        ,"该类在框架中被应用于Component。框架会定期检查component是否还在alive状态，如果不在，就会自动释放Component"
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
        let disposable = new YA.Disposable();
        let dispose1Arg,dispose1Sender;
        let dispose2Arg,dispose2Sender;
        //注册第一个dispose回调，当dispose发生时，它会被调用
        disposable.dispose((arg,sender)=>{dispose1Arg=arg;dispose1Sender= sender;});
        //注册第二个dispose回调，当dispose发生时，它会被调用
        disposable.dispose((arg,sender)=>{dispose2Arg=arg;dispose2Sender= sender;});
        //带参数释放资源
        disposable.dispose("dispose arg");

        assert_statement((assert:TAssert)=>{
            assert(disposable.$isDisposed===true,"对象处于释放状态，disposable.$isDisposed===true");
            assert(dispose1Arg==="dispose arg",`一个回调会被调用，接收到的参数为dispose调用的参数，dispose1Arg==="dispose arg"`);
            assert(dispose1Sender===disposable,`第一个回调函数的第二个参数为dispose对象，dispose1Sender===disposable`);
            assert(dispose2Arg==="dispose arg",`第二个回调函数也会被调用dispose2Arg==="dispose arg"`);
            assert(dispose2Sender===disposable,`dispose2Sender===disposable`);
        });

        let ex;
        try{
            disposable.dispose("second");
        }catch(ex1){ex =ex1;}

        assert_statement((assert:TAssert)=>{
            assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
        });
    }

    @doct({
        title:"释放前检查"
        ,descriptions:[
            "用deteching(callback)注册释放前的的检查方法"
            ,"用deteching()来做检查，只有所有的检查方法都不返回false，才会认为检查通过"
        ]
    })
    deteching(assert_statement:TAssertStatement,demoElement?:any){
        let disposable = new YA.Disposable();
        let deteching1Sender,deteching1ReturnValue=false;
        //注册一个释放前检查函数
        disposable.deteching((sender)=>{deteching1Sender=sender;return deteching1ReturnValue;});
        let deteching2Sender;
        //注册另一个释放前检查函数
        disposable.deteching((sender)=>{deteching2Sender=sender;return true;});

        let check = disposable.deteching();
        assert_statement((assert:TAssert)=>{
            assert(deteching1Sender===disposable,"第一个释放前检查函数被调用，检查函数的参数传入的是disposable对象，deteching1Sender===disposable");
            assert(check===false,"deteching()的结果为false,因为有一个检查函数返回了false");
            assert(deteching2Sender===undefined,"第二个回调函数不会运行 ,因为它前面的检查函数没通过检查:deteching2Sender===undefined");
        });
        //清空测试变量
        deteching1Sender = deteching2Sender = undefined;
        //改变第一个检查函数的返回值
        deteching1ReturnValue =true;
        //做检查
        check = disposable.deteching();
        assert_statement((assert:TAssert)=>{
            assert(check===true,"deteching()的结果为true,因为所有的检查函数都没有返回false：check===true");
            assert(deteching1Sender===disposable,"第一个释放前检查函数被调用，检查函数的参数传入的是disposable对象，deteching1Sender===disposable");
            
            assert(deteching2Sender===disposable,"第二个回调函数也被调用:deteching2Sender===disposable");
        });
    }
}