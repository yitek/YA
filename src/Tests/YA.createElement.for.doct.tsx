import {doct,TAssertStatement,TAssert} from '../doct';
import YA from '../YA.core';

@doct({
    title:"YA.createElement.for"
    ,descriptions:[
        "某些对象在运行中引用了外部的资源，当这些对象被系统/框架释放时，需要同时释放他们引用的资源。"
        ,"该类为这些可释放对象的基类。提供2个函数,dispose跟deteching。"
        ,"dispose(callback:Function)表示注册一个回调函数监听资源释放，一旦发生释放，这些回调函数就会被挨个调用;dispose(obj)表示释放资源，该函数完成后，$isDisposed就会变成true"
        ,"该类在框架中被应用于Component。框架会定期检查component是否还在alive状态，如果不在，就会自动释放Component"
    ]
})
export class createElementAttrsTest {
    constructor(){
    }
    
    @doct({
        title:"基本用法"
        ,descriptions:[
            "for"
        ]
    })
    base(assert_statement:TAssertStatement,demoElement?:any){
        function comp1(){
            let data = [{id:1,name:"yiy1"},{id:2,name:"yiy2"},{id:3,name:"yiy3"}];
            YA.observable(data,"items",this);
            YA.enumerator({id:0,name:"yiy"},"item",this);
            this.render= function(container,descriptor){
                
                return <ul for={[this.items,this.item]}>
                    <li>{this. item.name}</li>
                </ul>;
            }
        };
        let t = new Date();
        YA.createComponentElements(comp1,null,demoElement);
        
        assert_statement((assert:TAssert)=>{
            let t1 = new Date();
            let ellapse = t1.valueOf()-t1.valueOf();
            console.log(ellapse);
            //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
        });
    }

    @doct({
        title:"搜索"
        ,descriptions:[
            "search"
        ]
    })
    filter(assert_statement:TAssertStatement,demoElement?:any){
        function comp1(){
            let data = [{id:1,name:"yiy11"},{id:2,name:"yiy12"},{id:3,name:"yiy23"}];
            YA.observable(data,"items",this);
            YA.enumerator({id:0,name:"yiy"},"item",this);
            let self =this;
            this.keywordChange = function(e){
                let keyword = YA.trim(e.target.value);
                if(keyword){
                    let filteredData = [];
                    for(let item of data) {
                        if(item.name.indexOf(keyword)>=0)filteredData.push(item);
                    }
                    self.items = filteredData;
                }
            }
            this.render= function(container,descriptor){
                
                return <div><input type="text" placeholder="请输入关键字，比如1,2,3其中一个，然后回车" onblur={this.keywordChange}  />
                    <ul for={[this.items,this.item]}>
                    <li>{this. item.name}</li>
                </ul></div>;
            }
        };
        let t = new Date();
        YA.createComponentElements(comp1,null,demoElement);
        
        assert_statement((assert:TAssert)=>{
            let t1 = new Date();
            let ellapse = t1.valueOf()-t1.valueOf();
            console.log(ellapse);
            //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
        });
    }

}