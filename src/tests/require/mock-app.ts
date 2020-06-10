
import * as fra from "./mock-fra";
console.group("mock-app.ts");
console.log("mock-app.ts正在执行,检擦单一引用(fra)，依赖项fra",fra);
export let mod = {
    modname:"mock-app"
};
console.groupEnd();