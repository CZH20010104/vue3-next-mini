export function patchDOMProp(el: Element, key: string, value) {
  try {
    el[key] = value
  } catch (e) {}
}
