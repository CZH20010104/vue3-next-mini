export const isArray = Array.isArray

export const isObject = (val: unknown) =>
  val !== null && typeof val === 'object'
