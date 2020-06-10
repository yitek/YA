import * as loop1 from "mock-loop1";
import * as framework from "mock-fra";
console.group("mock-loop3.ts");
console.log("检查循环引用.loop1,framework",loop1,framework);

export let mod = {
    modname:"mock-loop3"
};
console.groupEnd();