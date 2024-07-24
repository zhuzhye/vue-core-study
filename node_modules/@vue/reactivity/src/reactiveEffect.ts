import { activeEffect, trackEffect, triggerEffects } from "./effect";
const targetMap = new WeakMap(); //存放依赖收集的关系

export const createDep = (cleanup, key) => {
  //3.4之前是set 后改为map
  const dep = new Map() as any; //创建的收集器还是一个map
  dep.cleanup = cleanup; //清理
  dep.name = key; //自定义为了标识这个映射表是给哪个属性服务的
  return dep;
};
export function track(target, key) {
  // activeEffect 有这个属性这个是在effect中访问的，没有说明在effect之外访问
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
      dep = depsMap.set(
        key,
        createDep(() => {
          depsMap.delete(key);
        }, key)
      ); //用于清理属性
    }
    trackEffect(activeEffect, dep); //将当前的effect放入dep映射表，后续可以根据值的变化触发次dep中存放的effect
    console.log(targetMap, "targetMap");
  }
}

export function trigger(target, key, newValue, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let dep = depsMap.get(key);
  if (dep) {
    //修改的属性对应了effect
    triggerEffects(dep);
  }
}
