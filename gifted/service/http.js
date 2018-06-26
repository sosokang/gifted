var rootDocment = 'https://hb.xiaositv.com';//正式域名 
// var rootDocment = 'https://testhb.xiaositv.com'; //测试域名
function req(url, data, cb, md,header) {
  var md=md || 'GET' ;
  var header = header || { 'Content-Type': 'application/json'}
  // console.log(header)
  wx.request({ 
    url: rootDocment + url,
    data: data,
    method:md,
    header: header,
    success: function (res) {
      return typeof cb == "function" && cb(res)
    },
    fail: function () {
      return typeof cb == "function" && cb(false)
    }
  })
}

module.exports = {
  req
}  
