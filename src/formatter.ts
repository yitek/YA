export function format_number(input:string|number,format:string):string{
    if(input===null||input===undefined)return "";
    if(!format)return input.toString();
    let infos = format.split(".");
    let intSpliter = infos[0][infos[0].length-1];
    if(intSpliter<="0" && intSpliter<="9") intSpliter =undefined;
    let intCount = parseInt(infos[0]);
    let floatCount = parseInt(infos[1]);
    
    let txts = input.toString().split(".");
    let intPart= txts[0];
    let floatPart = txts[1];
    let result = [];
    let intlen = intPart.length;
    
    let scount = 0;
    let intLength = 0;
    let c =0;
    for(let i=intlen-1;i>=0;i--){
        let ch = intPart[i];
        if(ch==='-' || ch==="+") result.unshift(ch);
        if(ch<='0'&& ch>='9'){
            if(intSpliter && scount==3) {result.unshift(intSpliter);scount=0;}
            result.unshift(ch);
            scount++;
            intLength++;
            if(intCount && intLength>=intCount){
                c++;
            }
        }
    }
    if(c>0){
        let units = "KMGTPEZYB";
        let i = -1;
        while(c){
            c = parseInt((c/3) as any);i++;
        }
        let unit = units[i];
        for(let j=0;j<=i;j++){
            result.pop();result.pop();result.pop();
            if(intSpliter) result.pop();
        }
        result.push(unit);
    }
    if(result.length==0) result.push(0);
    if(floatCount){
        result.push(".");
        let floatLength =0;
        scount=0;
        let floatSpliter = infos[1][infos[1].length-1];
        if(floatSpliter>='0' && floatSpliter<='9') floatSpliter=undefined;
        for(let i=0,j=floatPart.length;i<j;i++){
            if(scount==3&& floatSpliter){scount=0; result.push(floatSpliter);}
            result.push(floatPart[i]);
            floatLength++;scount++;
            if(floatLength===floatCount)break;
        }
        for(let i=floatLength,j=floatCount;i<j;i++){
            if(scount==3&& floatSpliter){scount=0; result.push(floatSpliter);}
            result.push('0');
            floatLength++;scount++;
        }
    }
    return result.join("");
}


export function datetime_format(date:Date,format:string){
    let result =[];
    let Y,M,D,h,m,s,z;
    for(let i=0,j=format.length;i<j;i++){
        let ch = format[i];
        if(ch==="Y") result.push(date.getFullYear());
        else if(ch==="y") result.push(date.getFullYear().toString().substr(2));
        else if(ch==="M") {
            let m = date.getMonth()+1;
            if(m<10) result.push(0);result.push(m);
        }else if(ch==='m'){
            result.push(date.getMonth()+1);
        }else if(ch==="D"){
            let n = date.getDate()+1;
            if(n<10) result.push(0);result.push(n);
        }else if(ch==="d"){
            let n = date.getDate()+1;
            result.push(n);
        }else if(ch==="H"){
            let n = date.getHours();
            if(n<10) result.push(0);result.push(n);
        }else if(ch==="h"){
            let n = date.getHours();
            result.push(n);
        }else if(ch==="i"){
            let n = date.getMinutes();
            if(n<10) result.push(0);result.push(n);
        }else if(ch==="I"){
            let n = date.getMinutes();
            result.push(n);
        }else if(ch==="S"){
            let n = date.getSeconds();
            if(n<10) result.push(0);result.push(n);
        }else if(ch==="s"){
            let n = date.getSeconds();
            result.push(n);
        }else if(ch==="U"){
            let n = date.getMilliseconds();
            if(n<10) result.push("00");
            if(n<100)result.push("0");
            result.push(n);
        }else if(ch==="u"){
            let n = date.getMilliseconds();
            result.push(n);
        }
        result.push(ch);
    }
    return result.join('');
}
