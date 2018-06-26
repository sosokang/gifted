const app = getApp();
var tool = require('../../utils/util')
var pay = require('../../service/pay');
var md5 = require('../../utils/md5').hexMD5;
Page({
  data: {
    picSrc: '',   
    filePath:"",
    tempFilePath:'',
    giftId: null,
    title: '',       // 商品名
    price: 0,        //单价
    counter: 1,         //购买数量
    giftState: 3,        //商品状态1 编辑礼物 2 已购买送出 3 打开礼物 4 已打开礼物 5 已送出  6 已过期
    saledTime: '',        //物品出售的时间
    orderId: null,       ///订单ID   // 请求时用record_id  // 返回的结果中为id
    // say: '礼物虽小，情义千斤！', //用户留言
    say: '',  //用户留言
    uname: '', //用户名        
    authorizeBoard: 0,       //是否显示授权提示弹窗
    textareaState: false,    //是否禁止输入文字
    textareaPlaceholder: 0,     //默认提示的文字
    textareaShow: 1,       //文字域是否显示
    aniShow: 0,         ///动画是否显示
    aniActive: 'ani-active',     ///动画类名
    varAni: null,        ///动画变量
    screenWidth: 0,
    minNum:1,           ///最小购买数量
  },
  //跳到首页
  toHome() {
    wx.reLaunch({
      url: '../index/index'
    })
  },
  // 礼物数量更改
  numUp(e) {
    let num = e.currentTarget.dataset.counter;
    clearTimeout(this.data.varAni)
    // ++num
    if (++num >= 99) num = 99;
    this.setData({
      counter: num,
      aniShow: 1
    })
    this.data.varAni = setTimeout(() => {
      this.setData({
        aniShow: 0
      })
    }, 550)
  },
  numDn(e) {
    let _this = this;
    let num = e.currentTarget.dataset.counter;
    if (--num <= this.data.minNum) num = this.data.minNum;
    this.setData({
      counter: num
    })
  },
  toReceive(){  //领取礼物
    var _this = this;
    app.getOpenid(()=>{
      app.func.req('/gifts/receive',{
        record_id:_this.data.orderId,
        openid:app.globalData.openid
      },function(res){
        // console.log(res)
        if(res.data.status === 'success'){
          _this.setData({
            giftState:4
          })
        }else if(res.data.mch==1){
          wx.showModal({
            title: '领取失败',
            content: '请检查您是否通过微信实名认证。',
            showCancel:false,
          })
        }else{
          _this.setData({
            giftState:5
          })
        }
      },'POST',{
        "Content-Type": "application/x-www-form-urlencoded"
      })
    })
  },
  onSaying(e) {  //用户输入的时候
    this.setData({
      say: e.detail.value.replace(/↵/g,'\n')
    })
  },
  sayEnter(e){  //当输入回车的时候
    // console.log(e)
    // if(e.detail.lineCount>2){
    //   return false;
    // }
  },
  onFocus(e){ ///光标聚集的时候
    this.setData({
      textareaPlaceholder: 1
    })
  },
  // 写入文字信息textarea
  sayFinish(e) {
    // console.log(e)
    this.setData({
      say: e.detail.value.replace(/↵/g,'\n')
    })
    if (!this.data.say) {
      this.setData({
        textareaPlaceholder: 0
      })
    } else {
      this.setData({
        textareaPlaceholder: 1
      })
    }
  },
  toPay() {
    let _this = this;
    if(!app.globalData.userInfo){
      this.setData({
        textareaShow: 0
      })
    }
    if (app.globalData.openid && app.globalData.userInfo) {
      app.func.req(app.func.config.GETUNIFIEDORDER, {
        openid: app.globalData.openid,
        money: (_this.data.price * _this.data.counter).toFixed(2),
        id: _this.data.giftId,
        price: _this.data.price,
        num: _this.data.counter,
        remark: _this.data.say ? _this.data.say : '我想对你说：礼物虽小，情义千斤！'
      }, function (response) {
        // console.log('下单返回信息＝＝＝＝＝＝＝')
        // console.log(response.data);
        if (response.data.pay_param.return_code == 'SUCCESS' && response.data.pay_param.result_code == 'SUCCESS') {
          // 发起支付
          var appId = response.data.pay_param.appid;
          var timeStamp = (Date.parse(new Date()) / 1000).toString();
          var pkg = 'prepay_id=' + response.data.pay_param.prepay_id;
          var nonceStr = response.data.pay_param.nonce_str;
          var paySign = md5('appId=' + appId + '&nonceStr=' + nonceStr + '&package=' + pkg + '&signType=MD5&timeStamp=' + timeStamp + '&key=3ba37b8e35610d02cc91575a355d0ffe').toUpperCase();
          app.func.pay(timeStamp, nonceStr, pkg, paySign, function (res) {
            // console.log(res);
            if (res.errMsg === "requestPayment:ok") {
              app.func.req('/index/success', {
                openid: app.globalData.openid,
                money: (_this.data.price * _this.data.counter).toFixed(2),
                id: _this.data.giftId,
                price: _this.data.price,
                order_id:response.data.order_id,
                num: _this.data.counter,
                remark: _this.data.say ? _this.data.say : '我想对你说：礼物虽小，情义千斤！'
              }, function (res) {
                // console.log(res)
              
                _this.setData({
                  orderId:res.data.record_id
                })
                _this.setData({
                  giftState: 2,
                  saledTime: tool.formatTime(new Date())
                })
              })
            }
          })
        }
      })
    } else {
      this.setData({
        authorizeBoard: 1
      })
    }
  },
  toShare() {  //免费的发送后
    // console.log(this.giftState,app.globalData.openid,this.orderId)
    // console.log(111)
    wx.showModal({
      title: '',
      content: '用心礼物已送出？',
      cancelText:'重新送',
      confirmText:"确定",
      complete(e){
        // console.log(e)
        if(e.confirm){
          wx.reLaunch({url:'../index/index'})
        }
      }
    })
    var _this = this;
    app.func.req('/gifts/update-free-order', {
      record_id: _this.data.orderId,
      openid: app.globalData.openid,
      remark: _this.data.say ? _this.data.say : "我想对你说：礼物虽小，情义千斤！"
    }, function (res) {
      // console.log(res)
    },'POST',{
      "Content-Type": "application/x-www-form-urlencoded"
    })
  },
  // 隐藏授权弹窗
  hideAuthorize() {
    this.setData({
      authorizeBoard: false,
      textareaShow: 1
    })
  },
  onGetUserInfo(res) {
    // console.log(res)
    // http.req()
    let userInfo = res.detail.userInfo;
    wx.setStorage({
      key:'userInfo',
      data:userInfo
    })
    if (userInfo) {
      app.func.req('/index/user', {
        avatarUrl: res.detail.userInfo.avatarUrl,
        city: res.detail.userInfo.city,
        country: res.detail.userInfo.country,
        gender: res.detail.userInfo.gender,
        language: res.detail.userInfo.language,
        nickname: res.detail.userInfo.nickName,
        province: res.detail.userInfo.province,
        openid: app.globalData.openid
      },
        function (res) {
          // console.log(res, 111)
          app.globalData.userInfo = userInfo;
        })
    }
  },
  downPic: function (e) {
    var that = this;
    if ((e.touches[0].x >= that.data.screenWidth - 56 && e.touches[0].x <= that.data.screenWidth - 14) && (e.touches[0].y >= 17 && e.touches[0].y <= 47)) {
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.writePhotosAlbum']) {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success() {
                wx.saveImageToPhotosAlbum({
                  filePath: that.data.tempFilePath,
                  success: function (res) {
                    console.log(res)
                    wx.showToast({
                      title: '保存成功',
                      icon: 'success',
                      duration: 2000
                    })
                  },
                  fail: function (res) {
                    console.log(res)
                    console.log('fail')
                  }
                })
              }
            })
          } else {
            console.log(that.data.tempFilePath);
            wx.saveImageToPhotosAlbum({
              filePath: that.data.tempFilePath,
              success: function (res) {
                console.log(res)
                wx.showToast({
                  title: '保存成功',
                  icon: 'success',
                  duration: 2000
                })
              },
              fail: function (res) {
                console.log(res)
                console.log('fail')
              }
            })
          }
        }
      })      
    }
  },
  onLoad(opt) {  ///进入页面的时候
    // console.log(opt)
    
    var _this = this;
    //首页直接进入的
    if (opt.gift_pic && opt.id && opt.name && opt.price && opt.type) {
      // console.log(opt)
      this.setData({
        picSrc: opt.gift_pic,
        title: opt.name,       // 商品名
        price: opt.price,
        giftId: opt.id,
        giftState: 1,
        saledTime: opt.time ? opt.time : tool.formatTime(new Date())
      })
    } else if (opt.id) {  ///只有商品ID的情况
      app.func.req('/gifts/info', {
        id: opt.id
      }, function (res) {
        // console.log(res)
        if (res.data.status === 'success') {
          _this.setData({
            picSrc: res.data.data.gift_pic,
            title: res.data.data.name,       // 商品名
            price: res.data.data.price,
            giftId: res.data.data.id,
            giftState: 1,
            saledTime: tool.formatTime(new Date())
          })
        }
      })
    } else if (opt.share) {  ///已结算订单分享进入的
      // console.log(opt)
      app.func.req('/gifts/get-share', {
        record_id: opt.share,
        openid:opt.openid
      }, function (res) {
        console.log(res)
        // var newGift = res.data.data.is_expire==1?6:(res.data.data.from_openid==app.globalData.openid?2:(res.data.data.is_receive==2?5:3))
        var newGift = res.data.data.is_expire==1?
          6:(res.data.data.is_receive==2?
          (res.data.data.to_openid==app.globalData.openid?4:5):(res.data.data.from_openid==app.globalData.openid?2:3))
        // console.log(newGift)
        _this.setData({
          orderId: opt.share,      //订单号
          picSrc: res.data.data.gift_img,       //对应图片
          title: res.data.data.gift_name,       // 商品名
          price: res.data.data.gift_price,      //单价
          giftId: null,                      //礼物id
          giftState:newGift,                  //状态页
          say: res.data.data.remark,            //说的话
          uname: res.data.data.from_nickname,   //发红包的人
          counter: res.data.data.total_price/res.data.data.gift_price,
          saledTime: tool.formatTime(new Date((res.data.data.create_time + '000') * 1))  //发出时间
        })
        _this.drawCvs();
      })
    } else if (opt.item) {  ///收到的礼物
      // console.log(opt.item)
      let item = JSON.parse(opt.item);
      console.log(item)
      // console.log(item.gift_name)
      if (item.is_receive == 1 && item.gift_price == 0) {  ///签到得到的礼物
        // console.log(222)
        _this.setData({
          picSrc: item.gift_img,
          title: item.gift_name,       // 商品名
          price: 0,
          giftId: item.gift_id,
          giftState: 2,
          orderId: item.id,
          saledTime: tool.formatTime(new Date())
        })
      } else if (item.is_receive != 1 && item.from == 'receive') {   ///其他人送的礼物
        // console.log("sdfsdgsdgfs")
        app.func.req('/gifts/get-receive-info', {
          record_id: item.id,
          openid: app.globalData.openid
        }, function (res) {
          console.log(res)
          _this.setData({
            // orderId: res.data.data.order_id,
            picSrc: res.data.data.gift_img,
            title: res.data.data.gift_name,       // 商品名
            price: res.data.data.gift_price,
            giftId: item.id,
            giftState: 4,
            orderId: item.id,
            say: res.data.data.remark,
            uname: res.data.data.from_nickname,
            counter: res.data.data.total_price/res.data.data.gift_price,
            // saledTime: tool.formatTime(res.data.data.create_time + '000')
          })
          _this.setData({
            filePath: res.data.data.gift_img
          });
        })
      } else if (item.is_receive != 1 && item.from == 'give') {
        app.func.req('/gifts/get-send-info', {
          record_id: item.id,
          openid: app.globalData.openid
        }, function (res) {
          // console.log(res)
          _this.setData({
            orderId: res.data.data.id,      //订单号
            picSrc: res.data.data.gift_img,       //对应图片
            title: res.data.data.gift_name,       // 商品名
            price: res.data.data.gift_price,      //单价
            giftId: item.id,                      //礼物id
            giftState: res.data.data.is_expire ? 6 : (res.data.data.is_receive==2?5:2),
            say: res.data.data.remark,            //说的话
            uname: res.data.data.from_nickname,   //发红包的人
            //   // counter: res.data.data.gift_sum,
            saledTime: tool.formatTime(new Date((res.data.data.create_time + '000') * 1))  //发出时间
          })
        })
      }
    } else {
      console.error("商品信息不正确！ ~ qiphon")
      // wx.redirectTo({
      //   url: '../index/index'
      // })
    }
    ///设置最小值
    this.setData({
      minNum:this.data.price==1?2:1,
      counter:this.data.price==1?2:1
    })
    // console.log(this.data.minNum)

  },
  imgLoad:function(){
   this.drawCvs(); 
  },
  drawCvs: function () {
    var that = this;
    this.setData({
      screenWidth: app.globalData.systemInfo.windowWidth
    });
    var ctx = wx.createCanvasContext('cvs');
    var ctx2 = wx.createCanvasContext('down');
    console.log("picSrc:"+that.data.picSrc);
    wx.downloadFile({
      url: that.data.picSrc,
      success: function (res) {
        console.log(res);
        if (res.statusCode === 200) {
          that.setData({
            filePath: res.tempFilePath
          })
          console.log("filePath:"+that.data.filePath);
          ctx.drawImage(that.data.filePath, 0, 0, that.data.screenWidth, 241);
          ctx.setFillStyle('#ffffff');
          ctx.fillRect(0, 241, that.data.screenWidth, 569);
          ctx.textBaseline = "top";
          ctx.textAlign = "left";
          ctx.fillStyle = "#F99992";
          ctx.font = "14px Microsoft Yahei";
          var words = that.data.say;
          var line = words.split("\n");
          var arr = [];
          for (var i = 0; i < line.length; i++) {
            var linel = 0, t = 0;
            for (var j = 0; j < line[i].length; j++) {
              if (/[a-zA-Z\d]/.test(line[i][j])) {
                linel += 0.5;
              } else {
                linel++;
              }
              if (linel <= 20) t++;
            }
            if (linel > 20) {
              var arrL = Math.ceil(linel / 20);
              var arr1 = [];
              for (var k = 0; k < arrL; k++) {
                arr1[k] = line[i].slice(k * t, (k + 1) * t);
              }
              arr = arr.concat(arr1);
            } else {
              arr.push(line[i]);
            }
          }
          arr = arr.slice(0, 3);
          for (var i = 0; i < arr.length; i++) {
            ctx.fillText(arr[i], 17, 254 + i * 40);
          }
          ctx.textAlign = "right";
          ctx.fillStyle = "#D84E43";
          ctx.fillText("from：" + that.data.uname, that.data.screenWidth - 17, 380);
          ctx.strokeStyle = "#FF7485";
          ctx.setLineWidth(0.3);
          ctx.setLineDash([4, 2], 0);
          ctx.beginPath();
          ctx.moveTo(17, 281);
          ctx.lineTo(that.data.screenWidth - 17, 281);
          ctx.moveTo(17, 321);
          ctx.lineTo(that.data.screenWidth - 17, 321);
          ctx.moveTo(17, 361);
          ctx.lineTo(that.data.screenWidth - 17, 361);
          ctx.stroke();
          ctx.setFillStyle('rgba(0, 0, 0, 0.5)');
          ctx.fillRect(that.data.screenWidth - 56, 17, 42, 30);
          ctx.drawImage("../../images/btn_download@3x.png", that.data.screenWidth - 45, 22, 20, 20);

          ctx2.drawImage(that.data.filePath, 0, 0, that.data.screenWidth, 241);
          ctx2.setFillStyle('#ffffff');
          ctx2.fillRect(0, 241, that.data.screenWidth, 569);
          ctx2.textBaseline = "top";
          ctx2.textAlign = "left";
          ctx2.fillStyle = "#F99992";
          ctx2.font = "14px Microsoft Yahei";
          for (var i = 0; i < arr.length; i++) {
            ctx2.fillText(arr[i], 17, 254 + i * 40);
          }
          ctx2.textAlign = "right";
          ctx2.fillStyle = "#D84E43";
          ctx2.fillText("from：" + that.data.uname, that.data.screenWidth - 17, 380);
          ctx2.strokeStyle = "#FF7485";
          ctx2.setLineWidth(0.3);
          ctx2.setLineDash([4, 2], 0);
          ctx2.beginPath();
          ctx2.moveTo(17, 281);
          ctx2.lineTo(that.data.screenWidth - 17, 281);
          ctx2.moveTo(17, 321);
          ctx2.lineTo(that.data.screenWidth - 17, 321);
          ctx2.moveTo(17, 361);
          ctx2.lineTo(that.data.screenWidth - 17, 361);
          ctx2.stroke();
          ctx2.drawImage("../../images/code.jpg", 20, 410, 50, 50);
          ctx2.textAlign = "left";
          ctx2.fillStyle = "#dddddd";
          ctx2.fillText("用心礼物 • 红包新玩法", 80, 430);
          ctx2.draw(true, function () {
            wx.canvasToTempFilePath({
              x: 0,
              y: 0,
              width: that.data.screenWidth,
              height: 465,
              canvasId: 'down',
              success: function (res) {
                that.setData({
                  tempFilePath: res.tempFilePath
                });
                console.log(that.data.tempFilePath);
                ctx.draw();
              }
            })
          })
        }
      },
      fail: function (res) {
        console.log(res);
      }
    })
  },
  onShareAppMessage: function (res) {
    if (this.data.giftId && this.data.giftState === 1) {
      return {
        title: "我喜欢这个礼物，你愿意送给我吗？",
        path: '/pages/letter/letter?id=' + this.data.giftId,
        imageUrl: '../../images/gift.png'
      }
    } else if (this.data.giftState === 2 && app.globalData.openid && this.data.orderId) {
      return {
        title: "你有一个礼物待领取！",
        path: '/pages/letter/letter?share=' + this.data.orderId + '&openid=' + app.globalData.openid,
        imageUrl: '../../images/gift.png'
      }
    }
  },
  onShow(e){
    // console.log(e)
  }
})