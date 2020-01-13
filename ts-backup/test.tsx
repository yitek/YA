declare let React;
export class Component{
    
    states:any;
    eachValue:any;
    comp :any = <i>{}</i>;
    @view
    tpl:any=<ul 
        enable={!this.states.hidden}
        class={this.states.clsName} 
        style={{position:"absolute",left:this.states.x + "px"}} onclick={this.onclick}>
            <b repeat={[this.states,this.eachValue]}>{this.states.Name + this.template("")}</b>
            <s></s>
            {this.comp}
        </ul>;
    
    constructor(){

    }
    onclick(e,b){}
    template(s:string){
        return <div id={this.states.abc}></div>;
    }
}

type InjectA=Number;
type InjectB = Function;

function partial(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>){

}
function view(target: any){}