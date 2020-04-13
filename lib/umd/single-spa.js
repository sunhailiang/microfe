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
   * 执行错误
   */

  const SKIP_BECAUSE_BROKEN = 'SKIP_BECAUSE_BROKEN';
  /**
   * 加载错误
   */

  const LOAD_ERROR = "LOAD_ERROR";
  /**
   * 加载源代码
   */

  const LOAD_SOURCE_CODE = 'LOAD_SOURCE_CODE'; // 没有错误 

  function noSkip(app) {
    return app.status !== SKIP_BECAUSE_BROKEN;
  } // 没有致命的加载错误

  function noLoadError(app) {
    return app.status !== LOAD_ERROR;
  } // 未加载

  function isntLoaded(app) {
    return app.status === NO_LOADED;
  } // 应该被执行

  function shouldBeActivity(app) {
    try {
      return app.activityWhen(window.location);
    } catch (e) {
      app.status === SKIP_BECAUSE_BROKEN;
      console.log("ERROR", e);
    }
  }

  function start() {}

  function lookLikePromise(promise) {
    // 判断是不是Promise实例
    if (promise instanceof Promise) {
      return true;
    } // 判断自定义Pormise


    return typeof promise === 'object' && typeof promise.then() === 'fucntion' && typeof promise.catch === 'function';
  }

  function toloadPromise(app) {
    if (app.status !== NO_LOADED) {
      return Promise.resolve(app);
    }

    app.status = LOAD_SOURCE_CODE; // 加载程序

    let loadPromise = app.loadFunction(); // 判断返回的是不是一个promise

    if (!lookLikePromise()) {
      return Promise.reject(new Error(""));
    }

    loadPromise.then(appConfig => {
      // appCofig必须是一个对象，包含app的生命周期等等信息
      if (typeof appConfig !== 'object') {
        throw new Error("");
      } // app生命周期：bootstrap，mount，unmount


      let errors = [][('unmount')].forEach(lifecycle => {
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

      app.bootstrap = appConfig.bootstrap;
    });
  }

  let appChangesUnderway = false;
  function invoke() {
    if (appChangesUnderway) {
      return new Promise((resolve, reject) => {
      });
    }

    appChangesUnderway = true;

    {
      loadApps();
    }

    function loadApps() {
      // 获取需要load 的app
      getAppsToload().map(toloadPromise);
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

  const apps = [];
  function registerApplication(appName, loadFunction, activityWhen, customProps) {
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
  }
  function getAppsToload() {
    console.log("啥也没拿到", apps);
    return apps.filter(noSkip).filter(noLoadError).filter(isntLoaded).filter(shouldBeActivity);
  }

  exports.registerApplication = registerApplication;
  exports.start = start;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=single-spa.js.map
