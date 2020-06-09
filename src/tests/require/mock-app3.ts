
import * as comp1 from "./mock-comp1";
import * as framework from "./libs/mock-framework";
console.group("mock-app3.ts");
console.log("mock-app3.ts正在执行.该模块为应用模块，还会加载comp1");
console.log(`import comp1`,comp1);
console.log(`import framework`,framework);
export let mod = {
    modname:"mock-app3"
};
console.groupEnd();