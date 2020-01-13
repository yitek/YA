import * as Babel from "@babel/parser";
import * as FS from "fs";

FS.readFile("./lib/test.tsx","utf8",(err,data:string)=>{
    let ast = Babel.parse(data,parserOpts);
    console.log(JSON.stringify(ast));
    debugger;
    
});

let parserOpts :Babel.ParserOptions={
    sourceType: "module",
    plugins: [
        // enable jsx and ts syntaxin
        "jsx",
        "typescript",
        "classProperties",
        ["decorators", {decoratorsBeforeExport:true}]
        //"decorators-legacy"
    ]
};
