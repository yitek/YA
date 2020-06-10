import * as loop2 from "libs/mock-loop2";
import * as framework from "libs/mock-framework";
console.group("mock-loop1.ts");
console.log("mock-loop1.ts正在执行,检查循环引用.loop2,framework",loop2,framework);

export let mod = {
    modname:"mock-loop1"
};
console.groupEnd();