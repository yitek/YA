import * as fra from "mock-framework";
import * as comp from "../mock-comp1";
console.group("mock-frcomp1.ts");
console.log("mock-frcomp1.ts正在执行,依赖项为 framework,comp1",fra,comp);
export let mod = {
    modname:"mock-framework"
};
console.groupEnd();