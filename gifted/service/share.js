 function share(res,type,title,path,scb,failcb) {
  //  if (res.form === type) {
  //   // 来自页面内转发按钮
  //   console.log(res.target)
  // }
  return {
    title: title,
    path: path,
    success: function (res) {
      return typeof scb == "function" && scb(res)
    },
    fail: function (res) {
      return typeof failcb == "function" && failcb(false)
    }
  }
}

module.exports = {
  share: share
}  

