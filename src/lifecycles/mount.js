import { NOT_MOUNTED, MOUNTING, MOUNTED } from "../applications/apps.helper";
import { reasonableTime } from "../applications/timeout";
import { getProps } from "./helper";
import { toUnMountPromise } from "./unmount";

"use strict"
export function toMountPromise (app) {
  if (app.status !== NOT_MOUNTED) {
    return Promise.resolve(app)
  }
  app.status = MOUNTING
  return reasonableTime(app.mount(getProps(app)),
    `app:${app.name} mounting`,
    app.timeouts.mount
  ).then(() => {
    app.status = MOUNTED
    return app
  }).catch(e => {
    app.status = MOUNTED
    // 如果挂载失败，就立马卸载
    return toUnMountPromise(app)
  })
}