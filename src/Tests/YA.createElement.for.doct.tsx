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
    //,debugging:"base"
})
export class createElementForTest {
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
            let item = YA.enumerator({id:0,name:"yiy"}) as any;
            this.render= function(container,descriptor){
                
                return <ul for={[this.items,item]}>
                    <li>{item.name}</li>
                </ul>;
            }
        };
        let t = new Date();
        YA.createComponent(comp1,null,demoElement);
        
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
        YA.createComponent(comp1,null,demoElement);
        
        assert_statement((assert:TAssert)=>{
            let t1 = new Date();
            console.log(t1.valueOf()-t1.valueOf());
            //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
        });
    }

    @doct({
        title:"子项内容变更"
        ,descriptions:[
            "search"
        ]
    })
    item(assert_statement:TAssertStatement,demoElement?:any){
        function comp1(){
            let data = [{id:1,name:"yiy11"},{id:2,name:"yiy12"},{id:3,name:"yiy23"}];
            YA.observable(data,"items",this);
            YA.enumerator({id:0,name:"yiy"},"item",this);
            this.nameChange = function(evt,item){
                let name = YA.trim(evt.target.value);
                item.name = name;
            };
            this.showData = function(){
                let json = JSON.stringify(this.items.get(YA.ObservableModes.Value));
                console.log(json);
                alert(json);
            }
            this.render= function(container,descriptor){
                return <div><table border="1">
                    <tbody for={[this.items,this.item]}>
                        <tr>
                            <td>{this.item.id}</td>
                            <td><input type="text" value={this.item.name} onblur={[this.nameChange,YA.EVENT,this.item]} /></td>
                            <td>{this.item.name}</td>
                        </tr>
                    </tbody></table>
                    <button onclick={this.showData}>点击我查看变更后的数据</button>
                </div>;
            }
        };
        let t = new Date();
        YA.createComponent(comp1,null,demoElement);
        
        assert_statement((assert:TAssert)=>{
            let t1 = new Date();
            console.log(t1.valueOf()-t1.valueOf());
            //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
        });
    }

    @doct({
        title:"复杂的循环"
        ,descriptions:[
            "复杂的循环，嵌套，变更子项等"
        ]
    })
    complex(assert_statement:TAssertStatement,demoElement?:any){
        function ComplexComp(){
            let provinces = [{key:"",value:"--"},{key:"cq",value:"重庆"},{key:"sc",value:"四川"},{key:"bj",value:"北京"}];
            let interests = [{key:"football",value:"足球"},{key:"basketball",value:"篮球"},{key:"swimming",value:"游泳"}];
            let data = [
                {id:1,name:"yiy11",interests:["football","swimming"],province:"cq"}
                ,{id:2,name:"yiy12",interests:["basketball","swmming"],province:"sc"}
                ,{id:3,name:"yiy23",interests:["basketball","football"],province:"bj"}
            ];
            YA.enumerator(data[0],"item",this);
            YA.enumerator("","interest",this);
            YA.enumerator(provinces[0],"province",this);

            YA.observable(data,"items",this);
            
            YA.observable(provinces,"provinces",this);
            this.showData = function(){
                let json = JSON.stringify(this.items.get(YA.ObservableModes.Value));
                console.log(json);
                alert(json);
            };
            this.render= function(){
                return <div><input type="button" value="点击查看数据" onclick={this.showData}/><table border="1"><tbody for={[this.items,this.item]}>
                    <tr>
                        <td>{this.item.id}</td>
                        <td>{this.item.name}</td>
                        <td>
                            {this.item.interests.length}
                            <ul for={[this.item.interests,this.interest]}>
                                <li>{this.interest}</li>
                            </ul>
                        </td>
                        <td>
                            {this.item.province}
                            <select for={[this.provinces,this.province]} b-value={this.item.province}>
                                <option value={this.province.key}>{this.province.value}</option>
                            </select>
                        </td>
                    </tr>
                </tbody></table></div>;
            };
            
        };
        YA.createComponent(ComplexComp,null,demoElement);
    }

}