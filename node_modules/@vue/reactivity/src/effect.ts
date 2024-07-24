export function effect(fn, options?) {
  //创建一个响应式effect 数据变化后可以重新执行
  //创建一个effect，只要依赖的属性变化了就要执行回调
  const _effect = new ReactiveEffect(fn, () => {
    //scheduler
    _effect.run();
  });
  _effect.run();
}
export let activeEffect;
class ReactiveEffect {
  _trackId = 0;
  deps = [];
  _depsLength = 0;
  public active = true; //创建的effect是响应式的
  // fn 用户编写的函数
  //如果fn中依赖的数据变化，需要重新调用->run()
  constructor(public fn, public scheduler) {}
  run() {
    if (!this.active) {
      return this.fn(); //不是激活的，执行后，不用做响应式处理
    }
    // 解决多层嵌套effect
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      return this.fn(); //依赖收集
    } finally {
      activeEffect = lastEffect;
    }
  }
}

export function trackEffect(effect, dep) {
  dep.set(effect, effect._trackId);
  //effect和dep关联
  effect.deps[effect._depsLength++] = dep;
  console.log(effect.deps, "depsss");
}

export function triggerEffects(dep) {
  for (const effect of dep.keys()) {
    if (effect.scheduler) {
      effect.scheduler();
    }
  }
}
