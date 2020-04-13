'use strict'
/**
 * 未加载
 */
export const NO_LOADED = 'NO_LOADED'
/**
 * 未跳过
 */
export const NOT_SKIP = 'NOT_SKIP'
/**
 * 执行错误
 */
export const SKIP_BECAUSE_BROKEN = 'SKIP_BECAUSE_BROKEN'
/**
 * 加载错误
 */
export const LOAD_ERROR = "LOAD_ERROR"
/**
 * 加载源代码
 */
export const LOAD_SOURCE_CODE = 'LOAD_SOURCE_CODE'
// 没有错误 
export function noSkip (app) {
  return app.status !== SKIP_BECAUSE_BROKEN
}
// 没有致命的加载错误
export function noLoadError (app) {
  return app.status !== LOAD_ERROR

}
// 未加载
export function isntLoaded (app) {
  return app.status === NO_LOADED
}
// 应该被执行
export function shouldBeActivity (app) {
  try {
    return app.activityWhen(window.location)
  } catch (e) {
    app.status === SKIP_BECAUSE_BROKEN
    console.log("ERROR", e);

  }
}
