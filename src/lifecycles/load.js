'use strict'
import { NO_LOADED, LOAD_SOURCE_CODE, SKIP_BECAUSE_BROKEN } from '../applications/apps.helper'
import { lookLikePromise } from './helper'
export function toloadPromise (app) {
  if (app.status !== NO_LOADED) {
    return Promise.resolve(app)
  }
  app.status = LOAD_SOURCE_CODE
  // 加载程序
  let loadPromise = app.loadFunction()
  // 判断返回的是不是一个promise
  if (!lookLikePromise()) {
    return Promise.reject(new Error(""));
  }
  loadPromise.then(appConfig => {
    // appCofig必须是一个对象，包含app的生命周期等等信息
    if (typeof appConfig !== 'object') {
      throw new Error("")
    }
    // app生命周期：bootstrap，mount，unmount
    let errors = []
    ['bootstrap', 'mount', 'unmount'].forEach(lifecycle => {
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
    app.bootstrap = appConfig.bootstrap
  })
}