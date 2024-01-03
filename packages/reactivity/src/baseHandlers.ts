import { track, trigger } from './effect'

const get = createGetter()

function createGetter() {
  return function get(target: object, key: string | symbol, receiver: object) {
    const res = Reflect.get(target, key, receiver)

    track(target, key)

    return res
  }
}

const set = createSetter()

function createSetter() {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ) {
    const res = Reflect.set(target, key, value, receiver)

    trigger(target, key, value)

    return res
  }
}

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set
}
