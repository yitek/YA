
import * as comp1 from "./mock-comp1";
import * as framework from "./libs/mock-framework";
console.group("mock-app3.ts");
console.log("mock-app3.ts正在执行.检查深层引用(2层，app->comp1->fra)，依赖项为comp1,framework",comp1,framework);

export let mod = {
    modname:"mock-app3"
};
console.groupEnd();