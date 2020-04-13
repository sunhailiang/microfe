
'use strict'
import { NO_LOADED, noSkip, noLoadError, isntLoaded, shouldBeActivity } from './apps.helper'
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
export function registerApplication (appName, loadFunction, activityWhen, customProps) {
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
export function getAppsToload () {
  console.log("啥也没拿到", apps)
  return apps.filter(noSkip).filter(noLoadError).filter(isntLoaded).filter(shouldBeActivity)
}