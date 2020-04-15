(function () {
  let ctx = {
    container: null
  }
  window.appB = {
    bootstrap: function () {
      console.log("bootstrap")
      return Promise.resolve().then(() => {
        ctx.container = document.querySelector("#app")
      })
    },
    mount: function () {
      console.log("mount")
      return Promise.resolve().then(() => {
        ctx.container.innerHTML = 'hello word appB'
      })
    },
    unmount: function () {
      console.log("unmount")

      return Promise.resolve().then(() => {
      })
    }
  }
})() 