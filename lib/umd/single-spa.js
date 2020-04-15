(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.singleSpa = {}));
}(this, (function (exports) { 'use strict';

  /**
   * 未加载
   */

  const NO_LOADED = 'NO_LOADED';
  /**
   * 加载源代码
   */

  const LOAD_SOURCE_CODE = 'LOAD_SOURCE_CODE';
  /**
   * 未启动
   */

  const NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED';
  /**
   * 启动中
   */

  const BOOTSTRAPPING = 'BOOTSTRAPPING';
  /**
   * 还没有挂载
   */

  const NOT_MOUNTED = 'NOT_MOUNTED';
  /**
   * 挂载中
   */

  const MOUNTING = 'MOUNTING';
  /**
   * 挂载结束
   */

  const MOUNTED = 'MOUNTED';
  /**
   * 执行错误
   */

  const SKIP_BECAUSE_BROKEN = 'SKIP_BECAUSE_BROKEN';
  /**
   * 加载错误
   */

  const LOAD_ERROR = "LOAD_ERROR"; // 没有错误 

  function noSkip(app) {
    return app.status !== SKIP_BECAUSE_BROKEN;
  } // 没有致命的加载错误

  function noLoadError(app) {
    return app.status !== LOAD_ERROR;
  } // 运营中

  function isActive(app) {
    return app.status === MOUNTED;
  } // 非运行中

  function isntActive(app) {
    return !isActive(app);
  } // 已经加载了

  function isLoaded(app) {
    return app.status !== NO_LOADED && app.status !== LOAD_ERROR && app.status !== LOAD_SOURCE_CODE;
  } // 未加载

  function isntLoaded(app) {
    return !isLoaded(app);
  } // 应该被执行

  function shouldBeActivity(app) {
    try {
      return app.activityWhen(window.location);
    } catch (e) {
      app.status === SKIP_BECAUSE_BROKEN;
      console.log("ERROR", e);
    }
  } // 不应该被执行

  function shouldntBeActive(app) {
    try {
      return !app.activityWhen(window.location);
    } catch (e) {
      app.status = SKIP_BECAUSE_BROKEN;
      throw e;
    }
  }

  let started = false;
  function start() {
    if (started) {
      return Promise.resolve();
    }

    started = true;
    return invoke();
  }
  function isStarted() {
    return started;
  }

  function lookLikePromise(promise) {
    // 判断是不是Promise实例
    if (promise instanceof Promise) {
      return true;
    } // 判断自定义Pormise


    return typeof promise === 'object' && typeof promise.then() === 'fucntion' && typeof promise.catch === 'function';
  } // 处理生命周期数组

  function flattenLifecyclesArray(lifecycle, description) {
    if (!Array.isArray(lifecycle)) {
      lifecycle = [lifecycle];
    }

    if (!lifecycle.length) {
      lifecycle = [() => Promise.resolve()];
    } // 对生命周期函数按顺序执行


    return props => new Promise((resolve, reject) => {
      waitForFunction(0);

      function waitForFunction(index) {
        let fn = lifecycle[index](props); // 如果不是一个promise直接返回错误信息

        if (!lookLikePromise(fn)) {
          reject(new Error(`${description}`));
        } else {
          // 处理生命周期函数
          fn.then(() => {
            if (index === lifecycle.length - 1) {
              resolve();
            } else {
              waitForFunction(++index);
            }
          }).catch(e => {
            reject(e);
          });
        }
      }
    });
  }
  function getProps(app) {
    return {
      name: app.name,
      ...app.customProps
    };
  }

  const TIMEOUTS = {
    bootstrap: {
      milliseconds: 3000,
      rejectWhenIimeout: false
    },
    mount: {
      milliseconds: 3000,
      rejectWhenIimeout: false
    },
    unmount: {
      milliseconds: 3000,
      rejectWhenIimeout: false
    }
  };
  function reasonableTime(lifecyclePromise, description, timeout) {
    return new Promise((resolve, reject) => {
      let finished = false;
      lifecyclePromise.then(data => {
        finished = true;
        resolve(data);
      }).catch(e => {
        finished = true;
        reject(e);
      });
      setTimeout(() => {
        if (finished) {
          return;
        }

        if (timeout.rejectWhenIimeout) {
          reject(`${description}`);
        } else {
          console.log("timeout but waiting");
        }
      }, timeout.milliseconds);
    });
  }
  function ensureTimeout(timeouts = {}) {
    return { ...TIMEOUTS,
      ...timeouts
    }; // return Object.assign({}, TIMEOUTS, timeouts)
  }

  function toloadPromise(app) {
    if (app.status !== NO_LOADED) {
      return Promise.resolve(app);
    } // 加载app代码


    app.status = LOAD_SOURCE_CODE; // 加载程序

    let loadPromise = app.loadFunction(getProps(app)); // 判断返回的是不是一个promise

    if (!lookLikePromise(loadPromise)) {
      app.status = SKIP_BECAUSE_BROKEN;
      return Promise.reject(new Error("loadPromise must return a promise or thenable object"));
    }

    return loadPromise.then(appConfig => {
      // appCofig必须是一个对象，包含app的生命周期等等信息
      if (typeof appConfig !== 'object') {
        throw new Error("appConfig must be a object");
      } // app生命周期：bootstrap，mount，unmount


      let errors = [];
      let temp = ['bootstrap', 'mount', 'unmount'];
      temp.forEach(lifecycle => {
        if (!appConfig[lifecycle]) {
          errors.push('lifecycle:' + lifecycle + 'must be exists');
        }
      });

      if (errors.length > 0) {
        // 状态不合法
        app.status = SKIP_BECAUSE_BROKEN;
        console.log("load.js", errors);
        return;
      }

      app.status = NOT_BOOTSTRAPPED; // 初始化当前要启用app的核心方法

      app.bootstrap = flattenLifecyclesArray(appConfig.bootstrap, `app:${app.name} bootstrapping`);
      app.mount = flattenLifecyclesArray(appConfig.mount, `app:${app.name} mounting`);
      app.unmount = flattenLifecyclesArray(appConfig.unmount, `app:${app.name} unmounting`);
      app.timeouts = ensureTimeout(appConfig.timeouts); // 加载就绪，返回app

      return app;
    }).catch(e => {
      app.status = LOAD_ERROR;
      console.log("App,加载失败", e);
    });
  }

  function toUnMountPromise(app) {
    if (app.status != MOUNTED) {
      return Promise.resolve(app);
    }

    return reasonableTime(app.unmount(getProps(app)), `app:${app.name}unmounting`, app.timeouts.unmount).then(() => {
      app.status = NOT_MOUNTED;
      return app;
    }).catch(e => {
      app.status = SKIP_BECAUSE_BROKEN;
      console.log(e);
      return app;
    });
  }

  function toMountPromise(app) {
    if (app.status !== NOT_MOUNTED) {
      return Promise.resolve(app);
    }

    app.status = MOUNTING;
    return reasonableTime(app.mount(getProps(app)), `app:${app.name} mounting`, app.timeouts.mount).then(() => {
      app.status = MOUNTED;
      return app;
    }).catch(e => {
      app.status = MOUNTED; // 如果挂载失败，就立马卸载

      return toUnMountPromise(app);
    });
  }

  function toBootStrapPromise(app) {
    if (app.status !== NOT_BOOTSTRAPPED) {
      return Promise.resolve(app);
    }

    app.status = BOOTSTRAPPING;
    return reasonableTime(app.bootstrap(getProps(app)), `app:${app.name} bootstrapping`, app.timeouts.bootstrap).then(() => {
      app.status = NOT_MOUNTED;
      return app;
    }).catch(e => {
      app.status = SKIP_BECAUSE_BROKEN;
      console.log(e);
      return app;
    });
  }

  const HIJACK_EVENT_NAME = /^(hashchange|popstate)$/i;
  const EVENT_POOL = {
    hashchange: [],
    popstate: []
  };


  function reroute() {
    invoke([], arguments);
  } // 确保框架路由优先执行


  window.addEventListener("hashchange", e => reroute(e));
  window.addEventListener("popstate", reroute);
  const originalAddEventListenner = window.addEventListener;
  const originalRemoveEventListenner = window.removeEventListener; // 方法重写

  window.addEventListener = function (eventName, handle) {
    if (eventName && HIJACK_EVENT_NAME.test(eventName)) {
      EVENT_POOL[eventName].indexOf(handle) === -1 && EVENT_POOL[eventName].push(handle);
    } else {
      originalAddEventListenner.apply(this, arguments);
    }
  };

  window.removeEventListener = function (eventName, handle) {
    if (eventName && HIJACK_EVENT_NAME.test(eventName)) {
      let events = EVENT_POOL[eventName];
      events.indexOf(handle) > -1 && (EVENT_POOL[eventName] = events.filter(fn => fn != handle));
    } else {
      originalRemoveEventListenner.apply(window, arguments);
    }
  };

  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState; // 重写history

  function mockPopStateEvent(state) {
    return new PopStateEvent('popstate', state);
  }

  window.history.pushState = function (state, title, url) {
    let res = originalPushState.apply(this, arguments);
    reroute(mockPopStateEvent(res));
    return res;
  };

  window.history.replaceState = function (state, title, url) {
    let res = originalReplaceState.apply(this, arguments);
    reroute(mockPopStateEvent(res));
    return res;
  };

  function callCapturedEvents(eventsArgs) {
    if (!eventsArgs) {
      return;
    }

    if (!Array.isArray(eventsArgs)) {
      eventsArgs = [eventsArgs];
    }

    let name = eventsArgs[0].type;

    if (!EVENT_POOL[name]) {
      return;
    }

    EVENT_POOL.forEach(el => {});
  }

  let appChangesUnderway = false;
  let changeQueue = [];
  function invoke(pendings = [], eventArgs) {
    if (appChangesUnderway) {
      return new Promise((resolve, reject) => {
        changeQueue.push({
          success: resolve,
          failure: reject,
          eventArgs
        });
      });
    }

    appChangesUnderway = true;

    if (isStarted()) {
      // app已经启动
      return performAppchanges();
    } // 预加载


    loadApps();

    function loadApps() {
      // 获取需要加载的app信息
      return Promise.all(getAppsToload().map(toloadPromise)).then(apps => {
        callAllCaptureEvents();
        console.log("APP", apps); // 返回执行结束

        return finish();
      }).catch(e => {
        callAllCaptureEvents();
        console.log(e);
      });
    }

    function performAppchanges() {
      //切换路由时：先卸载原有app，在加载目标app，挂载目标app
      //1.卸载unmount
      let unmountPromises = getAppsToUnmount().map(toUnMountPromise);
      unmountPromises = Promise.all(unmountPromises); //2.加载load

      let loadApps = getAppsToload();
      let loadPromises = loadApps.map(app => {
        return toloadPromise(app).then(app => toBootStrapPromise(app)).then(() => unmountPromises).then(toMountPromise(app));
      }); //3.挂载mounted 

      let mountApps = getAppsToMount(); // 去重

      mountApps = mountApps.filter(app => loadApps.indexOf(app) === -1);
      let mountPromises = mountApps.map(app => {
        return toBootStrapPromise(app).then(() => unmountPromises).then(() => toMountPromise(app));
      }); // 没有错误之后自取挂载

      return unmountPromises.then(() => {
        callAllCaptureEvents();
        let promiseAll = loadPromises.concat(mountPromises);
        return Promise.all(promiseAll).then(() => {
          return finish();
        }, e => {
          pendings.forEach(item => item.failure(e));
          throw e;
        });
      }, e => {
        callAllCaptureEvents();
        console.log(e);
      });
    }

    function finish() {
      let returnVal = getMoutedApps();

      if (pendings.length) {
        // 当前被挂载的app
        pendings.forEach(item => item.success(returnVal));
      }

      appChangesUnderway = false;

      if (changeQueue.length) {
        let backup = changeQueue;
        changeQueue = [];
        invoke(backup);
      } // 返回被挂载的app


      return returnVal;
    }

    function callAllCaptureEvents() {
      // eventQueue.length>0路由确实发生变化了
      pendings && pendings.length && pendings.filter(item => {
        return !!item.eventArgs;
      }).forEach(e => {
        callCapturedEvents(e);
      });
      eventArgs && callCapturedEvents(eventArgs);
    }
  }

  /**
   * 
   * @param {要注册的app的名称} appName 
   * @param {Function<Promise>||Object，app异步加载函数或者app内容} loadFunction 
   * @param {Function<Boolean> 触发时机} activityWhen 
   * @param {Object 自定义配置} customProps 
   * return Promise
   */

  const apps = []; // 注册小程序

  function registerApplication(appName, loadFunction, activityWhen, customProps = {}) {
    if (!appName || typeof appName !== 'string') {
      throw new Error("appName must be a non-empty string");
    }

    if (!loadFunction) {
      throw new Error("loadFunction must be a Function or Object");
    }

    if (typeof loadFunction !== 'function') {
      loadFunction = () => Promise.resolve(loadFunction);
    }

    if (typeof activityWhen !== 'function') {
      throw new Error("activityWhen must be a function");
    }

    apps.push({
      name: appName,
      loadFunction,
      activityWhen,
      customProps,
      status: NO_LOADED
    });
    invoke();
  } // 加载app

  function getAppsToload() {
    return apps.filter(noSkip).filter(noLoadError).filter(isntLoaded).filter(shouldBeActivity);
  } // 卸载app

  function getAppsToUnmount() {
    return apps.filter(noSkip).filter(isActive).filter(shouldntBeActive);
  } // 挂载app

  function getAppsToMount() {
    return apps.filter(noSkip).filter(isLoaded).filter(isntActive).filter(shouldBeActivity);
  } // 获取当前已经挂载的App

  function getMoutedApps() {
    return apps.filter(app => isActive(app));
  }

  exports.registerApplication = registerApplication;
  exports.start = start;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=single-spa.js.map
