'use strict'
import { NO_LOADED, LOAD_SOURCE_CODE, SKIP_BECAUSE_BROKEN, NOT_BOOTSTRAPPED, LOAD_ERROR } from '../applications/apps.helper'
import { lookLikePromise, flattenLifecyclesArray, getProps } from './helper'
import { ensureTimeout } from '../applications/timeout'

export function toloadPromise (app) {
  if (app.status !== NO_LOADED) {
    return Promise.resolve(app)
  }
  // 加载app代码
  app.status = LOAD_SOURCE_CODE
  // 加载程序
  let loadPromise = app.loadFunction(getProps(app))
  // 判断返回的是不是一个promise
  if (!lookLikePromise(loadPromise)) {
    app.status = SKIP_BECAUSE_BROKEN
    return Promise.reject(new Error("loadPromise must return a promise or thenable object"));
  }
  return loadPromise.then(appConfig => {
    // appCofig必须是一个对象，包含app的生命周期等等信息
    if (typeof appConfig !== 'object') {
      throw new Error("appConfig must be a object")
    }
    // app生命周期：bootstrap，mount，unmount
    let errors = []
    let temp = ['bootstrap', 'mount', 'unmount']
    temp.forEach(lifecycle => {
      if (!appConfig[lifecycle]) {
        errors.push('lifecycle:' + lifecycle + 'must be exists')
      }
    })
    if (errors.length > 0) {
      // 状态不合法
      app.status = SKIP_BECAUSE_BROKEN
      console.log("load.js", errors);
      return
    }
    app.status = NOT_BOOTSTRAPPED
    // 初始化当前要启用app的核心方法
    app.bootstrap = flattenLifecyclesArray(appConfig.bootstrap, `app:${app.name} bootstrapping`)
    app.mount = flattenLifecyclesArray(appConfig.mount, `app:${app.name} mounting`)
    app.unmount = flattenLifecyclesArray(appConfig.unmount, `app:${app.name} unmounting`)
    app.timeouts = ensureTimeout(appConfig.timeouts)
    // 加载就绪，返回app
    return app
  }).catch(e => {
    app.status = LOAD_ERROR
    console.log("App,加载失败", e);

  })
}