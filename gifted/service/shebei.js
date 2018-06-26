
function equipment(){
  var info={};
  wx.getSystemInfo({
    success: function (res) {
      var windowWidth = res.windowWidth;
      // console.log(res.pixelRatio)
      // console.log(res.windowWidth)
      // console.log(res.windowHeight)
      // console.log(res.language)
      // console.log(res.version)
      // console.log(res.platform)
     info.imageWidth = windowWidth;
    }
  })
  return info;

}
module.exports = {
  equipment:equipment
}  
