
import * as fra from "./mock-fra";
import * as framework from "./libs/mock-framework";
console.group("mock-app2.ts");
console.log("mock-app2.ts正在执行.检查引用多个依赖项(fra,framework)，加载完fra后就要加载该模块,依赖项为fra ,framework",fra,framework);
export let mod = {
    modname:"mock-app2"
};
console.groupEnd();