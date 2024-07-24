import { track, trigger } from "./reactiveEffect";

export enum ReactiveFlags {
  IS_REACTIVE = "_v_isReactive", //基本唯一
}
export const mutableHandlers: ProxyHandler<any> = {
  get(target, key, recevier) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    track(target, key); //收集对象上的属性，和effect关联在一起
    // console.log(activeEffect, key);
    // 当取值的时候，应该让响应式属性和 effect 映射起来 依赖收集
    return Reflect.get(target, key, recevier);
  },
  set(target, key, value, recevier) {
    // 找到属性让对应的effect重新执行 触发更新
    let oldValue = target[key];
    let result = Reflect.set(target, key, value, recevier);
    if (!oldValue !== value) {
      //需要触发页面更新
      trigger(target, key, result, oldValue);
    }
    return result;
  },
};
