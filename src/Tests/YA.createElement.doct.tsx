
import {doct,TAssertStatement,TAssert} from '../doct';
import * as YA from '../YA.core';
@doct({
    title:"YA.createElement"
    ,descriptions:[
        "该函数为YA的核心函数，其作用为：根据NodeDescription的信息(可能是展开的，该函数有许多的重载),创建真正的dom-node。它的设计目的有:"
        ,["jsx的factory,直接将jsx生成的代码转换成dom-node","开发人员在某些地方自己构建了一个vnode,想把该vnode转换成Dom-Node","在vnode中某些属性为Schema,那么就追加一个参数viewModel，可以让viewModel跟生成的dom-node做属性绑定。"]
        
    ]
})
export class CreateElementTest {
    @doct({
        title:"用于jsx factory的重载。"
        ,descriptions:[
            "调用方式有:"
            ,["createElement(tag:string)","createElement(tag:string,attrs:{},...children:IDomNode[])"]
        ]
    })
    base_jsx(assert_statement:TAssertStatement,demoElement:any){
        //最简单的创建一个div
        let div :YA.IDomNode= YA.createElement("div") as YA.IDomNode;
        YA.DomUtility.appendChild(demoElement,div);
        YA.DomUtility.setContent(div,"该div是由YA.createElement('div')产生的");

        //带属性的div
        div = YA.createElement("div",{
            "className":"blue-block"
        }) as YA.IDomNode;
        YA.DomUtility.appendChild(demoElement,div);
        YA.DomUtility.setContent(div,"该div是由YA.createElement('div',{})产生的");

        //带 children
        div = YA.createElement("div",{"class":"red-block"}
            ,"该div是外面创建的"
            ,YA.createElement("div",{className:"blue-block"},"该div是里面创建的")
        ) as YA.IDomNode;
        YA.DomUtility.appendChild(demoElement,div);
    }
    @doct({
        title:"带组件的jsx"
    })
    component_jsx(assert_statement:TAssertStatement,demoElement:any){
        //创建一个jsx函数风格的组件
        let Component:any = function(states){
            let elem = YA.DomUtility.createElement("div");
            YA.DomUtility.setAttribute(elem,"className",states.css);
            YA.DomUtility.setContent(elem,states.text);
            return elem;
        };
        let domNode = YA.createElement(Component,{css:"blue-block",text:"函数风格的jsx组件"}) as YA.IDomNode;
        YA.DomUtility.appendChild(demoElement,domNode);

        //创建一个面向对象风格的组件
        Component = function(states){
            this.render = ()=>{
                let elem = YA.DomUtility.createElement("div");
                YA.DomUtility.setAttribute(elem,"className",states.css);
                YA.DomUtility.setContent(elem,states.text);
                return elem;
            }
        };
        domNode = YA.createElement(Component,{css:"red-block",text:"对象·风格的jsx组件"}) as YA.IDomNode;
        YA.DomUtility.appendChild(demoElement,domNode);
    }
    
    @doct({
        title:"手工/开发者使用的重载。"
        ,descriptions:[
            "调用方式为:"
            ,["createElement(tag:INodeDescriptor,parent?:IDomNode,viewModel?:IViewModel)"]
        ]
    })
    manual(assert_statement:TAssertStatement,demoElement:any){
        //构建一个text
        let text = YA.createElement({content:"该文本由YA.createElement({content:''})方式创建"},demoElement);
        
        //构建一个div
        let div = YA.createElement({tag:"div",className:"blue-block",content:"该div由YA.createElement({})创建"}) as YA.IDomNode;
        YA.DomUtility.appendChild(demoElement,div);
        
        //构建一个带children的div
        let hasChildren = YA.createElement({
            tag:"div",
            className:"red-block",
            children:[
                //可以是文本
                "这是带children的div"
                //也可以是一个元素
                ,YA.DomUtility.createElement("tag",{},null,"这是children中的元素")
                //还可以是NodeDescriptor
                ,{
                    tag:"div",
                    className:"blue-block",
                    content:"这是Descriptor产生的div"
                }
            ]
        },demoElement);


    }

    @doct({
        title:"用tag调用注册到组件库中的组件"
    })
    componentLib_jsx(assert_statement:TAssertStatement,demoElement:any){
        //创建一个jsx函数风格的组件
        let Component:any = function(states){
            let elem = YA.DomUtility.createElement("div");
            YA.DomUtility.setAttribute(elem,"className",states.css);
            YA.DomUtility.setContent(elem,states.text);
            return elem;
        };
        YA.componentTypes["MyComp"] = Component;
        let domNode = YA.createElement({
            tag:"MyComp",
            css:"blue-block",
            text:"从组件库中生成的组件"
        }) as YA.IDomNode;
        YA.DomUtility.appendChild(demoElement,domNode);
    }
    @doct({
        title:"组件的组合调用"
    })
    composite(assert_statement:TAssertStatement,demoElement:any){
        let Comp1 = function(descriptor,container){
            //return <div class={descriptor.css}>这是Comp1:{descriptor.text}</div>;
            return <div class={descriptor.css}>这是Comp1:{descriptor.text}</div>;
        } as any;

        function Comp2(){
            this.render = (descriptor)=>{
                /*return <div class={descriptor.css}>
                    这是COMP2:{descriptor.text}
                    {descriptor.children}
                </div>; */
                return <div class={descriptor.css}>
                    COMP2.text:{descriptor.text}
                    {descriptor.children}
                </div>;
            };
            
        }

        function Comp3(){
            this.comp2 = "green-block";
            this.comp1 = "red-block";
            this.render = (descriptor)=>{
                /* return <div class={descriptor.css}>
                    这是Comp3
                    <Comp2 css ={this.comp2}>
                        <div class="orange-block">这是comp2里面的内容</div>
                        <div class="orange-block">这是comp2里面的内容</div>
                        <Comp1 css={this.comp1} text="这是comp1.text的内容" />
                    </Comp2>
                </div>; */
                return <div class={descriptor.css}>
                    这是Comp3
                    <Comp2 css ={this.comp2} text="这是comp3给comp2的文本">
                        <div class="orange-block">这是comp2里面的内容</div>
                        <div class="orange-block">这是comp2里面的内容</div>
                        <Comp1 css={this.comp1} text="这是comp1.text的内容" />
                    </Comp2>
                </div>;
            };
        }
        let elem = YA.createElement(Comp3,{css:"blue-block"}) as YA.IDomNode;
        YA.DomUtility.appendChild(demoElement,elem);
        
    }

    @doct({
        title:"vnode&属性绑定"
    })
    vnode(assert_statement:TAssertStatement,demoElement:any){
        
        let attrs:any = YA.observable({css:"green-block",text:"init text"});
        let vnode:YA.INodeDescriptor;
        YA.proxyMode(()=>{
            vnode = {
                tag:"div",className :attrs.css,
                children:[
                    "这是vnode创建的div",
                    {tag:"br"},
                    "vnode.text=",
                    attrs.text
                ]
            };
        });
        let elem = YA.createElement(vnode) as YA.IDomNode;
            YA.DomUtility.appendChild(demoElement,elem);
    }
    @doct({
        title:"控件与属性绑定"
    })
    compAttr(assert_statement:TAssertStatement,demoElement:any){
        function Comp(){
            YA.observable("blue-block","css",this);
            YA.observable("","text",this);
            YA.observable("这是comp2自己赋值的文本","innerText",this);
            this.render =(descriptor:YA.INodeDescriptor,container:YA.IDomNode)=>{
                /*return <div class={this.css}>
                    this.text =  {this.text}<br />
                    this.innerText={this.innerText}
                </div>;*/
                return <div class={this.css}>
                    this.text =  {this.text}<br />
                    this.innerText={this.innerText}
                </div>;
            }
        }
        let node:YA.IDomNode = YA.createElement(Comp,{css:"red-block","text":"注入的text"}) as YA.IDomNode;
        YA.DomUtility.appendChild(demoElement,node);
    }
    @doct({
        title:"多层绑定"
    })
    deep(assert_statement:TAssertStatement,demoElement:any){
        let Comp1 = function(descriptor,container){
            //return <div class={descriptor.css}>这是Comp1:{descriptor.text}</div>;
            return <div class={descriptor.css}>这是Comp1.text:{descriptor.text}</div>;
        } as any;

        function Comp2(){
            YA.observable("blue-block","css",this);
            YA.observable("","text",this);
            YA.observable("这是comp2自己赋值的文本","innerText",this);
            this.render = (descriptor)=>{
                /*return <div class={this.css}>
                    COMP2.text:{this.text}
                    <div>COMP2.innerText:{this.innerText}</div>
                    {descriptor.children}
                </div> */
                return <div class={this.css}>
                    这是comp2创建的div<br />
                    COMP2.text:{this.text}
                    <div>COMP2.innerText:{this.innerText}</div>
                    后面跟着comp1注入的children<br />
                    {descriptor.children}
                </div>;
            };
            
        }

        function Comp3(){
            YA.observable("red-block","comp1",this);
            YA.observable("blue-block","comp2",this);
            YA.observable("yellow-block","comp3",this);
            this.render = (descriptor)=>{
                /* return <div class={this.comp3}>
                    这是Comp3
                    <Comp2 css ={this.comp2}>
                        <div class="orange-block">这是comp2里面的内容</div>
                        <div class="orange-block">这是comp2里面的内容</div>
                        <Comp1 css={this.comp1} text="这是comp1.text的内容" />
                    </Comp2>
                </div>; */
                return <div class={this.comp3}>
                    这是Comp3创建的div
                    <Comp2 css ={this.comp2} text="comp3传递给comp2.text的内容">
                        <div class="orange-block">这是comp3给定的comp2.children</div>
                        <div class="orange-block">comp3里面包含了comp1</div>
                        <Comp1 css={this.comp1} text="这是comp3.text的内容,赋予给了Comp1.text" />
                    </Comp2>
                </div>;
            };
        }
        let elem = YA.createElement(Comp3) as YA.IDomNode;
        YA.DomUtility.appendChild(demoElement,elem);
        
    }
}