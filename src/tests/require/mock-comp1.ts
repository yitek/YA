
import * as fra from "./mock-fra";
console.group("mock-comp1.ts");
console.log("mock-comp1.ts正在执行,该模块为插件模块,依赖项为fra",fra );
export let mod = {
    modname:"mock-comp1"
};
console.groupEnd();