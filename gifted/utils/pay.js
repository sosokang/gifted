function pay(timeStamp, nonceStr, pkg, paySign,scb,fcb){
  wx.requestPayment({
    'timeStamp': timeStamp,
    'nonceStr': nonceStr,
    'package': pkg,
    'signType': 'MD5',
    'paySign': paySign,
    //成功
    'success': function (res) {
      return typeof scb == "function" && scb(res)
    },
    //失败
    'fail': function (res) {
      return typeof fcb == "function" && fcb(false)
    },
    //完成
    'complete':function(res){

    }
  })
}

module.exports = {
  pay: pay
}  