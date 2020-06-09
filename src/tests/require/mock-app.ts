
import * as fra from "./mock-fra";
console.group("mock-app.ts");
console.log("mock-app.ts正在执行.该模块为应用模块，加载完fra后就要加载该模块");
console.log(`import fra`,fra);
export let mod = {
    modname:"mock-app"
};
console.groupEnd();