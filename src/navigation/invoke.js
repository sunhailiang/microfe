"use strict"
import { isStarted } from '../start'
import { getAppsToload, getAppsToUnmount, getAppsToMount, getMoutedApps } from '../applications/apps'
import { toloadPromise } from '../lifecycles/load'
import { toUnMountPromise } from '../lifecycles/unmount'
import { toMountPromise } from '../lifecycles/mount'
import { toBootStrapPromise } from '../lifecycles/bootstrap'
import { callCapturedEvents } from './hijackLocation'
let appChangesUnderway = false
let changeQueue = []
export function invoke (pendings = [], eventArgs) {
  if (appChangesUnderway) {
    return new Promise((resolve, reject) => {
      changeQueue.push(
        {
          success: resolve,
          failure: reject,
          eventArgs
        }
      )
    })
  }
  appChangesUnderway = true
  if (isStarted()) {
    // app已经启动
    return performAppchanges()
  }
  // 预加载
  loadApps()

  function loadApps () {
    // 获取需要加载的app信息
    return Promise.all(getAppsToload().map(toloadPromise)).then((apps) => {
      callAllCaptureEvents()
      console.log("APP", apps)
      // 返回执行结束
      return finish()
    }).catch(e => {
      callAllCaptureEvents()
      console.log(e);

    })
  }
  function performAppchanges () {
    //切换路由时：先卸载原有app，在加载目标app，挂载目标app
    //1.卸载unmount
    let unmountPromises = getAppsToUnmount().map(toUnMountPromise)
    unmountPromises = Promise.all(unmountPromises)
    //2.加载load
    let loadApps = getAppsToload()
    let loadPromises = loadApps.map(app => {
      return toloadPromise(app).then(app => toBootStrapPromise(app)).then(() => unmountPromises).then(toMountPromise(app))
    })
    //3.挂载mounted 
    let mountApps = getAppsToMount()
    // 去重

    mountApps = mountApps.filter(app => loadApps.indexOf(app) === -1)
    let mountPromises = mountApps.map(app => {
      return toBootStrapPromise(app).then(() => unmountPromises).then(() => toMountPromise(app));
    })

    // 没有错误之后自取挂载
    return unmountPromises.then(() => {
      callAllCaptureEvents()
      let promiseAll = loadPromises.concat(mountPromises)
      return Promise.all(promiseAll).then(() => {
        return finish()
      }, e => {
        pendings.forEach(item => item.failure(e))
        throw e
      })
    }, e => {
      callAllCaptureEvents()
      console.log(e)
    })
  }
  function finish () {
    let returnVal = getMoutedApps()
    if (pendings.length) {
      // 当前被挂载的app
      pendings.forEach(item => item.success(returnVal));
    }
    appChangesUnderway = false
    if (changeQueue.length) {
      let backup = changeQueue
      changeQueue = []
      invoke(backup)
    }
    // 返回被挂载的app
    return returnVal
  }
  function callAllCaptureEvents () {
    // eventQueue.length>0路由确实发生变化了
    pendings && pendings.length && pendings.filter(item => {
      return !!item.eventArgs
    }).forEach(e => {
      callCapturedEvents(e)
    })

    eventArgs && callCapturedEvents(eventArgs)
  }
}
