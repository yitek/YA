import  {doct, ClassDoct, MemberDoct, TAssertStatement, TAssert} from '../YA.doct';
import * as YA  from '../YA.core'

@doct("YA.Observable")
class ObservableTest {
    constructor(doc:ClassDoct){
        doc.description=`可监听对象类
实现订阅/发布模式
它支持订阅/发布某个主题;如果未指定主题，默认主题为""
它的所有关于订阅发布的成员字段/函数都是enumerable=false的
一般用作其他类型的基类`;
        doc.usage("基本用法",`通过$subscribe订阅，$notify发布`,(assert_statement:TAssertStatement)=>{
            //1 创建一个可监听对象 
            let ob = new YA.Observable<any>();    

            //2 定义监听函数
            let listener = (evt)=>{argPassToListener=evt;}
            //记录传递给监听函数的参数
            let argPassToListener :any;
            
            //3 注册监听器
            ob.$subscribe(listener);

            //4 定义事件参数
            let evtArgs = {};

            //5 发送通知
            ob.$notify(evtArgs); 

            assert_statement((assert:TAssert)=>{
                assert(true,argPassToListener!==undefined,"监听函数会被调用");
                assert(evtArgs,argPassToListener,"监听函数中接收到的参数，就是$notify发送的参数");
            });
        });
    }
    
    @doct()
    subscribe(mdoc:MemberDoct){
        mdoc.description = `支持默认主题与指定主题订阅2种用法`;
        mdoc.usage("订阅默认事件",(assert_statement:TAssertStatement)=>{
            // 1 创建可监听对象
            let ob = new YA.Observable<any>();
            
            let evtInListener1:any,evtInListener2:any;

            // 2 定义2个监听者函数,并订阅默认事件
            let lisenter1 = (evt)=>{evtInListener1=evt;}
            let lisenter2 = (evt)=>{evtInListener2=evt;}
            ob.$subscribe(lisenter1);
            ob.$subscribe(lisenter2); 

            //3 定义事件参数，并发布事件
            let evtArgs = {};
            ob.$notify(evtArgs); 
            
            assert_statement((assert:TAssert)=>{
                assert(evtArgs,evtInListener1);
                assert(evtArgs,evtInListener2,"2个监听器都应该被调用且收到相同的事件参数:evtInListener1===evtInListener2===evtArgs");
            });
            
            evtInListener1= evtInListener2 = undefined;
            let evtArgs2 = {};
            ob.$notify(evtArgs2);
            
            assert_statement((assert:TAssert)=>{
                assert(evtArgs2,evtInListener1);
                assert(evtArgs2,evtInListener2,"可以多次发送事件，每次发送所有订阅过的监听器都会被调用:evtInListener1===evtInListener2===evtArgs2");
            });
            
        });

        mdoc.usage("订阅主题事件",(assert_statement:TAssertStatement)=>{
            // 1 创建可监听对象
            let ob = new YA.Observable<any>();
            
            let evtInListener1:any,evtInListener2:any;

            // 2 定义2个监听者函数,分别订阅topic1跟topic2
            let lisenter1 = (evt)=>{evtInListener1=evt;}
            let lisenter2 = (evt)=>{evtInListener2=evt;}
            ob.$subscribe("topic1",lisenter1);
            ob.$subscribe("topic2",lisenter2); 

            // 3 发送topic1主题事件
            ob.$notify("topic1","topic1_eventArgs");

            assert_statement((assert:TAssert)=>{
                assert("topic1_eventArgs",evtInListener1,"topic1的监听器接收到事件:evtInListener1==='topic1_eventArgs'");
                assert(undefined,evtInListener2,"topic2的监听器不能接收到事件:evtInListener2===undefined");
            });

            // 清洗数据，准备下一调用
            evtInListener1 = evtInListener2 = undefined;
            ob.$notify("topic2","topic2_eventArgs");

            assert_statement((assert:TAssert)=>{
                assert(undefined,evtInListener1,"topic1的监听器不能接收到事件:evtInListener1===undefined");
                assert("topic2_eventArgs",evtInListener2,"topic2的监听器接收到事件:evtInListener2==='topic2_eventArgs'");
            });
        });
    }
    @doct()
    notify(mdoc:MemberDoct){
        mdoc.usage((assert_statement)=>{
            let ob = new Observable<any>();
            let evtArgs = {lisenter1Invoked:0,lisenter2Invoked:0};

            ob.$notify(evtArgs);
            assert_statement((assert)=>{
                assert(true,true,"不注册任何监听器，observable也可以正常发送事件.");
            });
            
        });
        mdoc.usage((assert_statement)=>{
            let ob = new Observable<any>();
            let order =[];
            let evtArgs = {lisenter1Invoked:0,lisenter2Invoked:0};
            let lisenter1 = (evt)=>order.push("listener1");
            let lisenter2 = (evt)=>order.push("listener2");
            ob.$subscribe(lisenter1);
            ob.$subscribe(lisenter2);
            ob.$subscribe(lisenter1); 
            ob.$notify(evtArgs);

            assert_statement((assert)=>{
                assert(3,order.length,"注册了3个监听函数，每个监听函数都会被调用.");
                assert("listener1",order[0],"第一个注册的listener1首先被调用.");
                assert("listener2",order[1],"第二个注册的listener2接着被调用.");
                assert("listener1",order[2],"重复注册的listener1最后被调用.");
            });
        });
    }
    @doct()
    unsubscribe(mdoc:MemberDoct){
        mdoc.usage((assert_statement)=>{
            let ob = new Observable<any>();
    
            let evtArgs = {lisenter1Invoked:0,lisenter2Invoked:0};
            let lisenter1 = (evt)=>evt.lisenter1Invoked++;
            let lisenter2 = (evt)=>evt.lisenter2Invoked++;
            ob.$unsubscribe(lisenter1);

            assert_statement((assert)=>{
                assert(true,true,"即使没有注册任何监听器，也可以正常调用unsubscribe");
            });
        });

        mdoc.usage((assert_statement)=>{
            let ob = new Observable<any>();
    
            let evtArgs = {lisenter1Invoked:0,lisenter2Invoked:0};
            let lisenter1 = (evt)=>evt.lisenter1Invoked++;
            let lisenter2 = (evt)=>evt.lisenter2Invoked++;
            ob.$unsubscribe(lisenter1);
            ob.$subscribe(lisenter1);
            ob.$unsubscribe(lisenter2);
            ob.$notify(evtArgs);
            assert_statement((assert)=>{
                assert(true,true,"注册了listener1,也可以unsubscribe其他函数");
        
                assert(1,evtArgs.lisenter1Invoked,"unsubscribe2后，监听器1不受影响收到事件参数");
                assert(0,evtArgs.lisenter2Invoked,"listener2未被注册，不会被调用");
            });
        });
        
        mdoc.usage((assert_statement)=>{
            let ob = new Observable<any>();
    
            let evtArgs = {lisenter1Invoked:0,lisenter2Invoked:0};
            let lisenter1 = (evt)=>evt.lisenter1Invoked++;
            let lisenter2 = (evt)=>evt.lisenter2Invoked++;
            ob.$subscribe(lisenter1);
            ob.$unsubscribe(lisenter1);
            ob.$subscribe(lisenter2); 
            ob.$notify(evtArgs);

            assert_statement((assert)=>{
                assert(1,evtArgs.lisenter1Invoked,"unsubscribe1后，监听器1不应该收到事件参数");
                assert(1,evtArgs.lisenter2Invoked,"listener2未调用unsubscribe,监听器2应该能收到事件参数");
            });
        });

        
        

        
        

        //ob.$unsubscribe(lisenter1);
        //ob.$notify(evtArgs);
        //assert(1,evtArgs.lisenter1Invoked,"两次调用unsubscribe1后，监听器1不应该收到事件参数");
        //assert(2,evtArgs.lisenter2Invoked,"unsubscribe1不影响listener2,监听器2应该能收到事件参数");

        //ob.$unsubscribe(lisenter2);
        //ob.$notify(evtArgs);
        //assert(1,evtArgs.lisenter1Invoked,"两次调用unsubscribe1后，监听器1不应该收到事件参数");
        //assert(2,evtArgs.lisenter2Invoked,"unsubscribe2后,监听器2应该不能收到事件参数");

        
    }

    // oversub(assert:IAssert){
    //     assert.info("测试重复注册相同监听器及取消重复的监听器的行为");
    //     let ob = new Observable<any>();
    //     let order =[];
    //     let evtArgs = {lisenter1Invoked:0,lisenter2Invoked:0};
    //     let lisenter1 = (evt)=>order.push("listener1");
    //     let lisenter2 = (evt)=>order.push("listener2");

    //     ob.$subscribe(lisenter1);
    //     ob.$subscribe(lisenter2);
    //     ob.$subscribe(lisenter1); 
        
    //     ob.$unsubscribe(lisenter2);
    //     ob.$notify(evtArgs);
    //     assert(2,order.length,"unsubscribe listener2后，剩余的2个监听函数都会被调用.");
    //     assert("listener1",order[0],"第一个注册的listener1首先被调用.");
    //     assert("listener1",order[1],"重复注册的listener1最后被调用.");

    //     order = [];
    //     ob.$unsubscribe(lisenter1);
    //     assert(0,order.length,"unsubscribe listener1后，因为listener1为重复注册，解除了所有的注册，没有任何监听器被调用.");
    // }

    // topic(assert:IAssert){
    //     assert.info("主题的订阅/取消/通知");
    //     let evtArgs = {lisenter1Invoked:0,lisenter2Invoked:0};
    //     let lisenter1 = (evt)=>evt.lisenter1Invoked++;
    //     let lisenter2 = (evt)=>evt.lisenter2Invoked++;

    //     let ob = new Observable<any>();
    //     ob.$subscribe("evt1",lisenter1);
    //     ob.$subscribe("evt2",lisenter2);

    //     ob.$notify(evtArgs);
    //     assert(0,evtArgs.lisenter1Invoked,"notify方式为非topic方式，listener1不会被调用");
    //     assert(0,evtArgs.lisenter2Invoked,"notify方式为非topic方式，listener2不会被调用");

    //     ob.$notify("evt1",evtArgs);
    //     assert(1,evtArgs.lisenter1Invoked,"notify主题为evt1，listener1被调用");
    //     assert(0,evtArgs.lisenter2Invoked,"notify主题为evt1，listener2不会被调用");

    //     ob.$notify("evt2",evtArgs);
    //     assert(1,evtArgs.lisenter1Invoked,"notify主题为evt2，listener1不会被调用");
    //     assert(1,evtArgs.lisenter2Invoked,"notify主题为evt2，listener2被调用");

    //     ob.$unsubscribe("evt1",lisenter1);
    //     ob.$notify("evt1",evtArgs);
    //     assert(1,evtArgs.lisenter1Invoked,"evt1的主题订阅被取消，notify即使发送主题evt1通知，listener1也被调用");
    //     assert(1,evtArgs.lisenter2Invoked,"notify主题为evt1，listener2不会被调用");

    // }

    // each(assert:IAssert){
    //     let ob :any= new Observable<any>();
    //     ob.$subscribe(evt=>{});
    //     ob.additionProp = "addition";
    //     let propCount =0;
    //     let propName,propValue;
    //     for(let n in ob){
    //         propCount++;
    //         propName =n;
    //         propValue = ob[n];
    //     }

    //     assert(1,propCount,"只有自定义的属性才会被循环，Observable的成员，无论是否是public，都不会出现在循环中");
    //     assert("additionProp",propName,"循环只能获取到自定义属性的属性名");
    //     assert("addition",propValue,"循环只能获取到自定义属性的值");
    // }
}

