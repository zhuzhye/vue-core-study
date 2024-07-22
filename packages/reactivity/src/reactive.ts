import { isObject } from "@vue/shared";
const mutableHandlers: ProxyHandler<any> = {
  get(target, key, recevier) {},
  set(target, key, value, recevier) {
    return true;
  },
};

export function reactive(target) {
  return createReactiveObject(target);
}
function createReactiveObject(target) {
  // 统一做判断 ，响应式对象必须是对象才可以
  if (!isObject(target)) {
    return target;
  }
  let proxy = new Proxy(target, mutableHandlers);
  return proxy;
}
