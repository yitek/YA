function Action() {
    return function (target:object, methodName: string, descriptor: PropertyDescriptor) {
        console.log("I am method decorator");
    }
}