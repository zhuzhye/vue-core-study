// packages/reactivity/src/effect.ts
function effect() {
}

// packages/shared/src/index.ts
function isObject(value) {
  return typeof value === "object" && value !== null;
}

// packages/reactivity/src/reactive.ts
var mutableHandlers = {
  get(target, key, recevier) {
  },
  set(target, key, value, recevier) {
    return true;
  }
};
function reactive(target) {
  return createReactiveObject(target);
}
function createReactiveObject(target) {
  if (!isObject(target)) {
    return target;
  }
  let proxy = new Proxy(target, mutableHandlers);
  return proxy;
}
export {
  effect,
  reactive
};
//# sourceMappingURL=reactivity.js.map
