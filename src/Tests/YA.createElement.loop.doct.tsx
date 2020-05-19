import {doct,TAssertStatement,TAssert} from '../doct';
import * as YA from '../YA.core';

@doct({
    title:"YA.createElement.loop"
    ,descriptions:[
        "loop标签循环测试"
    ]
    //,debugging:"complex"
})
export class createElementLoopTest {
    constructor(){
    }
    
    @doct({
        title:"基本用法"
        ,descriptions:[
            "loop"
        ]
    })
    base(assert_statement:TAssertStatement,demoElement?:any){
        function BasComp(){
            let data = [{id:1,name:"yiy1"},{id:2,name:"yiy2"},{id:3,name:"yiy3"}];
            YA.observable(data,"items",this);
            let item = YA.loopar(this.items) as any;
            this.render= function(container,descriptor){
                
                return <ul loop={[this.items,item]}>
                    <li>{item.name}</li>
                </ul>;
            }
        };
        let t = new Date();
        YA.createComponent(BasComp,null,demoElement);
        
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
            YA.variable({id:0,name:"yiy"},"item",this);
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
                    <ul loop={[this.items,this.item]}>
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
        function ItemComp(){
            let data = [{id:1,name:"yiy11"},{id:2,name:"yiy12"},{id:3,name:"yiy23"}];
            YA.observable(data,"items",this);
            YA.loopar(this.items,"item",this);
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
                    <tbody loop={[this.items,this.item]}>
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
        YA.createComponent(ItemComp,null,demoElement);
        
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
            YA.variable(data[0],"item",this);
            YA.variable("","interest",this);
            YA.variable(provinces[0],"province",this);

            YA.observable(data,"items",this);
            
            YA.observable(provinces,"provinces",this);
            this.showData = function(){
                let json = JSON.stringify(this.items.get(YA.ObservableModes.Value));
                console.log(json);
                alert(json);
            };
            this.render= function(){
                return <div><input type="button" value="点击查看数据" onclick={this.showData}/><table border="1"><tbody loop={[this.items,this.item]}>
                    <tr>
                        <td class="id">{this.item.id}</td>
                        <td class="name">{this.item.name}</td>
                        <td class="interests">
                            intereests.length={this.item.interests.length}
                            <ul loop={[this.item.interests,this.interest]}>
                                <li>{this.interest}</li>
                            </ul>
                        </td>
                        <td class="province">
                            {this.item.province}
                            <select loop={[this.provinces,this.province]} b-value={this.item.province}>
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