import * as fra from "mock-framework";
import * as loop3 from "../mock-loop3";
console.group("mock-loop2.ts");
console.log("依赖项为 framework,loop3",fra,loop3);
export let mod = {
    modname:"mock-loop3"
};
console.groupEnd();