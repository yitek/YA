import * as dt from "doct";

export let Doct = dt.Doct;
export let doct = dt.doct;
export type IDescritor = dt.IDescriptor;

export interface IDoct extends dt.IDoct{
    rootElement?:HTMLElement;
}

export function execute(cls:{new():any}|dt.TestClass,parent?:HTMLElement){
    if(!(cls instanceof dt.TestClass)) cls = new dt.TestClass(cls);
    let output = cls.run();
    render(output,(Doct as IDoct).rootElement || document.body,false);
}
let currentDemo;
Doct.methodExecuting =(opts:dt.IExecuteContext):any => {
    currentDemo = document.createElement("div");
    return;
}
Doct.methodExecuted = (section:dt.IFragment,opts:dt.IExecuteContext)=>{
    if(currentDemo.innerHTML){
        (section.content as any).push({contentType:"demo",element:currentDemo});
    }
    currentDemo=null;
}
Doct.classExecuted =(output:dt.IFragment,cls:dt.TestClass)=>{
    render(output,(Doct as IDoct).rootElement || document.body,false);
};

function render(section:dt.IFragment|string|dt.ISectionContent[],parent:HTMLElement,insub:boolean):Node{
    let elem:HTMLElement;
    if((section as dt.ISectionContent[]).push && (section as dt.ISectionContent[]).pop){
        if(insub){
            elem = document.createElement("ol");
            for(let sub of section as dt.ISectionContent[]){
                let li = document.createElement("li");
                elem.appendChild(li);
                render(sub,li,true);
            } 
        }else {
            elem = document.createElement("section");
            elem.className = "section";
            for(let sub of section as dt.ISectionContent[]) render(sub,elem,true);
        }
        
    }else if((section as dt.IFragment).content) {
        elem = document.createElement("section");
        elem.className = "section ";
        let ct = (section as dt.IFragment).contentType;
        if(ct){
            if((ct as []).push && (ct as []).pop){
                (elem  as HTMLElement).className += (ct as []).join(" ");
            }else (elem  as HTMLElement).className += (ct as string);
        }
    } else if((section as any).element){
        elem = document.createElement("aside");
        elem.className = "demo";
        elem.appendChild((section as any).element);
    }
    if(parent) parent.appendChild(elem);
    return elem;
}
