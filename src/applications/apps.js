
'use strict'
import { NO_LOADED, noSkip, isLoaded, isntActive, isActive, shouldntBeActive, noLoadError, isntLoaded, shouldBeActivity } from './apps.helper'
import { invoke } from '../navigation/invoke'
/**
 * 
 * @param {要注册的app的名称} appName 
 * @param {Function<Promise>||Object，app异步加载函数或者app内容} loadFunction 
 * @param {Function<Boolean> 触发时机} activityWhen 
 * @param {Object 自定义配置} customProps 
 * return Promise
 */

const apps = []
// 注册小程序
export function registerApplication (appName, loadFunction, activityWhen, customProps = {}) {
  if (!appName || typeof appName !== 'string') {
    throw new Error("appName must be a non-empty string")
  }
  if (!loadFunction) {
    throw new Error("loadFunction must be a Function or Object")
  }
  if (typeof loadFunction !== 'function') {
    loadFunction = () => Promise.resolve(loadFunction)
  }
  if (typeof activityWhen !== 'function') {
    throw new Error("activityWhen must be a function")
  }
  apps.push({
    name: appName,
    loadFunction,
    activityWhen,
    customProps,
    status: NO_LOADED
  })
  invoke()
}
// 加载app
export function getAppsToload () {
  return apps.filter(noSkip).filter(noLoadError).filter(isntLoaded).filter(shouldBeActivity)
}
// 卸载app
export function getAppsToUnmount () {
  return apps.filter(noSkip).filter(isActive).filter(shouldntBeActive)
}
// 挂载app
export function getAppsToMount () {
  return apps.filter(noSkip).filter(isLoaded).filter(isntActive).filter(shouldBeActivity)
}
// 获取当前已经挂载的App
export function getMoutedApps () {
  return apps.filter(app => isActive(app))
}