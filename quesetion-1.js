const person = {
  name: "jw",
  get aliasName() {
    return this.name + "xxx";
  },
};
let proxyPerson = new Proxy(person, {
  get(target, key, receiver) {
    //receiver 代理对象
    console.log(key);
    return Reflect.get(target, key, receiver);
    // return target[key];
  },
});
// console.log(proxyPerson.aliasName);
proxyPerson.aliasName;
