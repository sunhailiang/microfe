(function () {
  let ctx = {
    container: null
  }
  window.appA = {
    bootstrap: function () {
      console.log("bootstrap")
      return Promise.resolve().then(() => {
        console.log("没拿到dom？", document.querySelector("#app"));
        ctx.container = document.querySelector("#app")
      })
    },
    mount: function () {
      console.log("mount")
      return Promise.resolve().then(() => {
        ctx.container.innerHTML = 'hello word appA'
      })
    },
    unmount: function () {
      console.log("unmount")

      return Promise.resolve().then(() => {
      })
    }
  }
})() 