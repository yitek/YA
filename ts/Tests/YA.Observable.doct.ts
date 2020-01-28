import  {doct, ClassDoct, MemberDoct, TAssertStatement, TAssert} from '../YA.doct';
import * as YA  from '../YA.core'

@doct("YA.Observable")
class ObservableTest {
    constructor(doc:ClassDoct){
        doc.description=`可观察对象类
实现订阅/发布模式
它支持订阅/发布某个主题;如果未指定主题，默认主题为""
它的所有关于订阅发布的成员字段/函数都是enumerable=false的
一般用作其他类型的基类
*注意*:该对象并不会做垃圾回收，如果监听器及其上下文已经失效，由于它依然被该对象引用，JS的垃圾回收器不会回收该监听器及上下文。这在某些情况下会造成悬垂引用问题。`;
        doc.usage("基本用法",`通过$subscribe订阅，$notify发布`,(assert_statement:TAssertStatement)=>{
            //1 创建一个可观察对象 
            let ob = new YA.Observable<any>();    

            //2 定义监听函数
            let listener = (evt)=>{argPassToListener=evt;}
            //记录传递给监听函数的参数
            let argPassToListener :any;
            
            //3 注册监听器
            ob.$subscribe(listener);

            //4 定义事件参数
            let evtArgs = {};

            //5 发送/通知事件
            ob.$notify(evtArgs); 

            assert_statement((assert:TAssert)=>{
                assert(true,argPassToListener!==undefined,"监听函数会被调用");
                assert(evtArgs,argPassToListener,"监听函数中接收到的参数，就是$notify发送的参数");
            });
        });
        doc.usage("成员不可枚举","所有成员enumerable==false",(assert_statement:TAssertStatement)=>{
            //1 创建一个可观察对象 
            let ob = new YA.Observable<any>();    

            //2 订阅监听器
            ob.$subscribe(()=>{});

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
    $subscribe(mdoc:MemberDoct){
        mdoc.description = `订阅/注册事件监听函数
当只传递一个参数时，为订阅默认事件，参数为监听器函数
传递两个参数时,为订阅主题事件，第一个参数为主题名，第二个参数为监听器函数
*注意*:订阅并不会给监听器排重，用相同的监听器函数重复订阅相同主题，会造成监听器重复调用
`;
        mdoc.usage("订阅默认事件",(assert_statement:TAssertStatement)=>{
            // 1 创建可观察对象
            let ob = new YA.Observable<any>();
            
            let evtInListener1:any,evtInListener2:any;

            // 2 定义2个监听者函数,并订阅默认事件
            let listener1 = (evt)=>{evtInListener1=evt;}
            let listener2 = (evt)=>{evtInListener2=evt;}
            ob.$subscribe(listener1);
            ob.$subscribe(listener2); 

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
            // 1 创建可观察对象
            let ob = new YA.Observable<any>();
            
            let evtInListener1:any,evtInListener2:any;

            // 2 定义2个监听者函数,分别订阅topic1跟topic2
            let listener1 = (evt)=>{evtInListener1=evt;}
            let listener2 = (evt)=>{evtInListener2=evt;}
            ob.$subscribe("topic1",listener1);
            ob.$subscribe("topic2",listener2); 

            // 3 发送topic1主题事件
            ob.$notify("topic1","topic1_eventArgs");

            assert_statement((assert:TAssert)=>{
                assert("topic1_eventArgs",evtInListener1,"topic1的监听器接收到事件:evtInListener1==='topic1_eventArgs'");
                assert(undefined,evtInListener2,"topic2的监听器不能接收到事件:evtInListener2===undefined");
            });

            // 清洗数据，准备下一调用
            evtInListener1 = evtInListener2 = undefined;
            // 4 发送topic2 主题事件
            ob.$notify("topic2","topic2_eventArgs");

            assert_statement((assert:TAssert)=>{
                assert(undefined,evtInListener1,"topic1的监听器不能接收到事件:evtInListener1===undefined");
                assert("topic2_eventArgs",evtInListener2,"topic2的监听器接收到事件:evtInListener2==='topic2_eventArgs'");
            });
        });
        mdoc.usage("重复订阅",(assert_statement:TAssertStatement)=>{
            // 1 创建可观察对象
            let ob = new YA.Observable<any>();
            
            let records:string[]=[];

            // 2 定义监听者，其功能为向records写入一个字符串。
            let listener = (evt)=>{records.push("listener invoked.");}

            //3 用相同的监听器，向同一个主题订阅订阅2次
            ob.$subscribe("topic1",listener);
            ob.$subscribe("topic1",listener);

            // 4 发布topic1事件
            ob.$notify("topic1",null);

            assert_statement((assert:TAssert)=>{
                assert("listener invoked.,listener invoked.",records.join(","),"listener被调用了2次:records==['listener invoked.','listener invoked.']");
            });            
        });
    }
    @doct()
    $notify(mdoc:MemberDoct){
        mdoc.description=`发布事件
当只传递一个参数时，为发布默认事件，参数为事件参数
传递2个参数时，为发布主题事件，第一个参数为主题名，第二个参数为事件参数
其基本用法可参见subscibe的示例.
当事件/主题发布时，监听器的调用顺序为订阅的顺序
`;
        mdoc.usage("事件发布时，监听器按订阅时的顺序依次被调用",(assert_statement)=>{
            // 1 创建可观察对象
            let ob = new YA.Observable<any>();

            // 2 创建3个监听器，每个监听器向指定数组add自己的名称
            let order =[];
            let listener1 = (evt)=>order.push("listener1");
            let listener2 = (evt)=>order.push("listener2");
            let listener3 = (evt)=>order.push("listener3");

            // 3 订阅默认事件
            ob.$subscribe(listener1);
            ob.$subscribe(listener2);
            ob.$subscribe(listener3); 

            //发布默认事件
            let evtArgs = {};
            ob.$notify(evtArgs);

            assert_statement((assert)=>{
                assert(3,order.length,"每个监听函数都会被调用:order.length===3");
                assert("listener1",order[0],'第一个注册的listener1首先被调用:order[0]==="listener1"');
                assert("listener2",order[1],"第二个注册的listener2接着被调用:order[1]==='listener2'");
                assert("listener3",order[2],"重复注册的listener1最后被调用:order[2]==='listener3'");
            });
        });
        mdoc.usage("没有订阅的发布","即使主题没有被订阅，也可以发布该主题",(assert_statement)=>{
            // 1 创建可观察对象
            let ob = new YA.Observable<any>();

            // 2 不订阅默认事件，直接发布默认事件
            let evtArgs = {};
            ob.$notify(evtArgs);
            // 3 不订阅topic，但发布了topic
            ob.$notify("topic",null);
            
            // 这些操作是允许的，只是没有任何效果的空操作
            
        });
        
    }
    @doct()
    $unsubscribe(mdoc:MemberDoct){
        mdoc.description=`
取消某个监听器函数的订阅
当只传递一个参数时，为订阅默认事件，参数为监听器函数
传递两个参数时,为订阅主题事件，第一个参数为主题名，第二个参数为监听器函数
*注意*:取消订阅会把相同的监听器都取消掉
        `;
        mdoc.usage("取消默认事件的订阅",(assert_statement)=>{
            // 1 创建可观察对象
            let ob = new YA.Observable<any>();

            // 1 定义2个监听器
            let listener1 = (evt)=>evt.listener1Invoked=true;
            let listener2 = (evt)=>evt.listener2Invoked=true;

            // 2 用这2个监听器订阅默认事件
            ob.$subscribe(listener1);
            ob.$subscribe(listener2);

            // 3 取消listener1的订阅
            ob.$unsubscribe(listener1);

            // 3 发布默认事件
            let evtArgs= {listener1Invoked:false,listener2Invoked:false};
            ob.$notify(evtArgs);

            assert_statement((assert)=>{
                assert(false,evtArgs.listener1Invoked,"被取消订阅的listener1不会被调用:evtArgs.listener1Invoked===false.");
                assert(true,evtArgs.listener2Invoked,"未被取消订阅listener2被调用:evtArgs.listener2Invoked===true.");
            });
        });

        mdoc.usage("取消主题事件的订阅",(assert_statement)=>{
            // 1 创建可观察对象
            let ob = new YA.Observable<any>();

            // 1 定义2个监听器
            let listener1 = (evt)=>evt.listener1Count++;
            let listener2 = (evt)=>evt.listener2Count++;

            // 2 用这2个监听器订阅topic事件
            ob.$subscribe("topic",listener1);
            ob.$subscribe("topic",listener2);

            // 3 发布topic事件
            let evtArgs= {listener1Count:0,listener2Count:0};
            ob.$notify("topic",evtArgs);

            // 4 取消listener2的订阅
            //   即使发布过事件，也可以取消订阅
            ob.$unsubscribe("topic",listener2);

            // 5 再次以相同的事件参数发布topic事件
            ob.$notify("topic",evtArgs);

            assert_statement((assert)=>{
                assert(2,evtArgs.listener1Count,"监听器listener1会被调用2次:evtArgs.listener1Count===2");
                assert(1,evtArgs.listener2Count,"由于第二次发布前取消了监听器listener2的订阅，listener2只会被调用1次::evtArgs.listener1Count===2");
            });
        });

        mdoc.usage("重复订阅的取消",(assert_statement)=>{
            // 1 创建可观察对象
            let ob = new YA.Observable<any>();

            let order = [];

            // 1 定义2个监听器
            let listener1 = (evt)=>order.push("listener1 invoked by " + evt);
            let listener2 = (evt)=>order.push("listener2 invoked by " + evt);

            // 2 用这2个监听器订阅默认事件
            ob.$subscribe(listener1);
            ob.$subscribe(listener2);
            ob.$subscribe(listener1);

            // 3 发布事件
            
            ob.$notify("@notify1");

            // 4 取消listener1的订阅
            //   即使发布过事件，也可以取消订阅
            ob.$unsubscribe(listener1);

            // 5 再次以相同的事件参数发布topic事件
            ob.$notify("@notify2");

            assert_statement((assert)=>{
                assert(
                    "listener1 invoked by @notify1,listener2 invoked by @notify1,listener1 invoked by @notify1,listener2 invoked by @notify2"
                    ,order.join(",")
                    ,`listener1会在第一次notify时被调用两次,被取消掉后，第二次notify只调用了一次listener2:order==["listener1 invoked by @notify1","listener2 invoked by @notify1","listener1 invoked by @notify1","listener2 invoked by @notify2"]`
                );
            });
        });
    }
}

