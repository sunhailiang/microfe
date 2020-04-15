'use strict'
/**
 * 未加载
 */
export const NO_LOADED = 'NO_LOADED'
/**
 * 加载源代码
 */
export const LOAD_SOURCE_CODE = 'LOAD_SOURCE_CODE'

/**
 * 未启动
 */
export const NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED'
/**
 * 启动中
 */
export const BOOTSTRAPPING = 'BOOTSTRAPPING'
/**
 * 还没有挂载
 */
export const NOT_MOUNTED = 'NOT_MOUNTED'
/**
 * 挂载中
 */
export const MOUNTING = 'MOUNTING'
/**
 * 挂载结束
 */
export const MOUNTED = 'MOUNTED'
/**
 * 卸载中
 */
export const UNMOUNTING = 'UNMOUNTING'
/**
 * 更新中
 */
export const UPDATING = 'UPDATING'
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

// 没有错误 
export function noSkip (app) {
  return app.status !== SKIP_BECAUSE_BROKEN
}
// 没有致命的加载错误
export function noLoadError (app) {
  return app.status !== LOAD_ERROR

}

// 运营中
export function isActive (app) {
  return app.status === MOUNTED;
}
// 非运行中
export function isntActive (app) {
  return !isActive(app)
}
// 已经加载了
export function isLoaded (app) {
  return app.status !== NO_LOADED && app.status !== LOAD_ERROR && app.status !== LOAD_SOURCE_CODE;
}

// 未加载
export function isntLoaded (app) {
  return !isLoaded(app)
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
// 不应该被执行
export function shouldntBeActive (app) {
  try {
    return !app.activityWhen(window.location);
  } catch (e) {
    app.status = SKIP_BECAUSE_BROKEN;
    throw e;
  }
}
