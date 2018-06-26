
// var rootDocment = 'https://www.xiaositv.com';//你的域名  
var rootDocment = 'https://api.xiaositv.com';//你的域名

function upload_file(url, filePath, name, formData, success, fail) {
  console.log('a=' + filePath)
  wx.uploadFile({
    url: rootDocment + url,
    filePath: filePath,
    name: name,

    header: {
      'content-type': 'multipart/form-data'
    }, // 设置请求的 header
    formData: formData, // HTTP 请求中其他额外的 form data
    success: function (res) {
      console.log(res);
      if (res.statusCode == 200 && !res.data.result_code) {
        typeof success == "function" && success(res.data);
      } else {
        typeof fail == "function" && fail(res);
      }
    },
    fail: function (res ) {
      console.log(res);
      typeof fail == "function" && fail(res);
    }
  })
}
module.exports = {
  upload_file: upload_file
}  

