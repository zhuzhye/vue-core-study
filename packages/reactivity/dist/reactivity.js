// packages/reactivity/src/effect.ts
function effect(fn, options) {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();
}
var activeEffect;
var ReactiveEffect = class {
  //创建的effect是响应式的
  // fn 用户编写的函数
  //如果fn中依赖的数据变化，需要重新调用->run()
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this._trackId = 0;
    this.deps = [];
    this._depsLength = 0;
    this.active = true;
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      return this.fn();
    } finally {
      activeEffect = lastEffect;
    }
  }
};
function trackEffect(effect2, dep) {
  dep.set(effect2, effect2._trackId);
  effect2.deps[effect2._depsLength++] = dep;
  console.log(effect2.deps, "depsss");
}
function triggerEffects(dep) {
  for (const effect2 of dep.keys()) {
    if (effect2.scheduler) {
      effect2.scheduler();
    }
  }
}

// packages/shared/src/index.ts
function isObject(value) {
  return typeof value === "object" && value !== null;
}

// packages/reactivity/src/reactiveEffect.ts
var targetMap = /* @__PURE__ */ new WeakMap();
var createDep = (cleanup, key) => {
  const dep = /* @__PURE__ */ new Map();
  dep.cleanup = cleanup;
  dep.name = key;
  return dep;
};
function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      dep = depsMap.set(
        key,
        createDep(() => {
          depsMap.delete(key);
        }, key)
      );
    }
    trackEffect(activeEffect, dep);
    console.log(targetMap, "targetMap");
  }
}
function trigger(target, key, newValue, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let dep = depsMap.get(key);
  if (dep) {
    triggerEffects(dep);
  }
}

// packages/reactivity/src/baseHandler.ts
var mutableHandlers = {
  get(target, key, recevier) {
    if (key === "_v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
    track(target, key);
    return Reflect.get(target, key, recevier);
  },
  set(target, key, value, recevier) {
    let oldValue = target[key];
    let result = Reflect.set(target, key, value, recevier);
    if (!oldValue !== value) {
      trigger(target, key, result, oldValue);
    }
    return result;
  }
};

// packages/reactivity/src/reactive.ts
var reactiveMap = /* @__PURE__ */ new WeakMap();
function createReactiveObject(target) {
  if (!isObject(target)) {
    return target;
  }
  if (target["_v_isReactive" /* IS_REACTIVE */]) {
    return target;
  }
  const existsProxy = reactiveMap.get(target);
  if (existsProxy) {
    return existsProxy;
  }
  let proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy);
  return proxy;
}
function reactive(target) {
  return createReactiveObject(target);
}
export {
  activeEffect,
  effect,
  reactive,
  trackEffect,
  triggerEffects
};
//# sourceMappingURL=reactivity.js.map
