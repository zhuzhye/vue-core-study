export function effect(fn, options?) {
  //创建一个响应式effect 数据变化后可以重新执行
  //创建一个effect，只要依赖的属性变化了就要执行回调
  //fn(effect(()=>xxxx))
  const _effect = new ReactiveEffect(fn, () => {
    //scheduler
    _effect.run();
  });
  _effect.run();
  if (options) {
    Object.assign(_effect, options);
  }
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

function preCleanEffect(effect) {
  effect._depsLength = 0;
  effect._trackId++; //每次执行id都加1,如果当前同一个effect执行，id就是相同的
}
function postCleanEffect(effect) {
  if (effect.deps.length > effect._depsLength) {
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
      cleanDepEffect(effect.deps[i], effect); //删除映射表中对应的effect
    }
    effect.deps.length = effect._depsLength; //更新依赖列表的长度
  }
}
export let activeEffect;
class ReactiveEffect {
  _trackId = 0;
  deps = [];
  _depsLength = 0;
  _running = 0;
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
    // effect 重新执行前，需要将上次的依赖的清除 effect.dep
    preCleanEffect(this);
    this._running++;
    try {
      activeEffect = this;
      return this.fn(); //依赖收集
    } finally {
      this._running--;
      postCleanEffect(this);
      activeEffect = lastEffect;
    }
  }
}
//1._trackId 用于记录执行次数(防止一个属性在在当前effect中多次依赖收集) 只收集一次
//2.拿到上一次依赖的最后一个和这一次的比较
//{flag，name}
//{flag，age}
function cleanDepEffect(dep, effect) {
  dep.delete(effect);
  if (dep.size == 0) {
    dep.cleanup(); //如果map为空，则删除这个属性
  }
}
export function trackEffect(effect, dep) {
  //收集时是一个个的
  //需要重新收集依赖，将不需要的移除
  // debugger;
  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId);
    let oldDep = effect.deps[effect._depsLength];
    //如果没有存过
    if (oldDep !== dep) {
      if (oldDep) {
        //删除老的
        cleanDepEffect(oldDep, effect);
      }
      //换成新的
      effect.deps[effect._depsLength++] = dep; //永远按照本次更新的来存放
    } else {
      effect._depsLength++;
    }
  }
  // dep.set(effect, effect._trackId);
  // //effect和dep关联
  // effect.deps[effect._depsLength++] = dep;
}

export function triggerEffects(dep) {
  for (const effect of dep.keys()) {
    if (!effect._running) {
      if (effect.scheduler) {
        // 如果不是正在执行，才能执行
        effect.scheduler();
      }
    }
  }
}
// Map: {obj: {属性：Map:{effect,effect,effect }}}
// {
//     {name:'jw',age:30}:{
//         age:{
//             effect:0,
//             effect:0
//         },
//         name:{
//             effect ,effect
//         }
//     }
// }
