import { invoke } from "./invoke";
const HIJACK_EVENT_NAME = /^(hashchange|popstate)$/i
const EVENT_POOL = {
  hashchange: [],
  popstate: []
}
'use strict'
// 路由拦截
function reroute () {
  invoke([], arguments)
}
// 确保框架路由优先执行
window.addEventListener("hashchange", e => reroute(e))
window.addEventListener("popstate", reroute)

const originalAddEventListenner = window.addEventListener
const originalRemoveEventListenner = window.removeEventListener

// 方法重写
window.addEventListener = function (eventName, handle) {
  if (eventName && HIJACK_EVENT_NAME.test(eventName)) {
    EVENT_POOL[eventName].indexOf(handle) === -1 && EVENT_POOL[eventName].push(handle)
  } else {
    originalAddEventListenner.apply(this, arguments)
  }

}
window.removeEventListener = function (eventName, handle) {
  if (eventName && HIJACK_EVENT_NAME.test(eventName)) {
    let events = EVENT_POOL[eventName]
    events.indexOf(handle) > -1 && (EVENT_POOL[eventName] = events.filter(fn => fn != handle))
  } else {
    originalRemoveEventListenner.apply(window, arguments)
  }
}

const originalPushState = window.history.pushState
const originalReplaceState = window.history.replaceState


// 重写history
function mockPopStateEvent (state) {
  return new PopStateEvent('popstate', state)
}

window.history.pushState = function (state, title, url) {
  let res = originalPushState.apply(this, arguments)
  reroute(mockPopStateEvent(res))
  return res
}
window.history.replaceState = function (state, title, url) {
  let res = originalReplaceState.apply(this, arguments)
  reroute(mockPopStateEvent(res))
  return res
}

export function callCapturedEvents (eventsArgs) {
  if (!eventsArgs) {
    return
  }
  if (!Array.isArray(eventsArgs)) {
    eventsArgs = [eventsArgs]
  }

  let name = eventsArgs[0].type
  if (!EVENT_POOL[name]) {
    return
  }
  EVENT_POOL.forEach(el => {

  });
}