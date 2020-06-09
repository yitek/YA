
import * as fra from "./mock-fra";
import * as framework from "./libs/mock-framework";
console.group("mock-app2.ts");
console.log("mock-app2.ts正在执行.该模块为应用模块，加载完fra后就要加载该模块");
console.log(`import fra`,fra);
console.log(`import framework`,framework);
export let mod = {
    modname:"mock-app2"
};
console.groupEnd();