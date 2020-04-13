"use strict"
import { isStarted } from '../start'
import { getAppsToload } from '../applications/apps'
import { toloadPromise } from '../lifecycles/load'
let appChangesUnderway = false
let changeQueue = []
export function invoke () {
  if (appChangesUnderway) {
    return new Promise((resolve, reject) => {
      changeQueue.push(
        {
          success: resolve,
          failure: reject
        }
      )
    })
  }
  appChangesUnderway = true
  if (isStarted()) {

  } else {
    loadApps()
  }
  function loadApps () {
    // 获取需要load 的app
    getAppsToload().map(toloadPromise)
  }
}