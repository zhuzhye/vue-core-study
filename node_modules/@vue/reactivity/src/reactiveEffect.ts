import { activeEffect } from "./effect";

export function track(target, key) {
  // activeEffect 有这个属性活命这个是在effect中访问的，没有说明在effect之外访问
  console.log(key, activeEffect, "++++");
}
