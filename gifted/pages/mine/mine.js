// pages/mine/mine.js
var formatTime = require('../../utils/formatTime.js');
var util = require('../../utils/util.js');
const app = getApp();
Page({
  data: {
    authorizeBoard:0,    ////授权弹窗
    user: {
      receive: [],
      give: []
    },
    date: "",
    gift: {
      signIn: false,
      gift_name: "陪你去看流星雨",
      gift_img: "../../images/card.png",
      id: 0 
    },
    screenHeight: 0,
    screenWidth: 0,
    showShadow:false,
    currentIndex: 0,
    left: 0,
    startX: 0, 
    startY: 0,
    broadwise: false,  //是否是横向滑动
    showNotice1: false,  //底部提示
    showNotice2: false,
    pno1: 1,
    pno2: 1,
    tem:{   
      active1:"",
      active2:"active"
    }
  },
  onLoad: function (options) {
    var that = this;
    if (options.signIn) this.signIn();
    app.getOpenid(function (id) {
      wx.getSystemInfo({
        success: function (res) {
          that.setData({
            screenHeight: res.windowHeight,
            screenWidth: res.windowWidth
          })
        }
      });
      var str = formatTime.formatTime(new Date());
      that.setData({
        date: str
      });
      app.func.req('/sign/whether', { openid: app.globalData.openid }, function (res) {
        if (res) {
          var key = "gift.signIn"
          that.setData({
            [key]: res.data
          })
        }
      })
      that.reqReceive();
      that.reqGive();  
    })
  },
  reqReceive:function(){
    var that=this;
    app.func.req('/my/demand', { openid: app.globalData.openid, pages: 1 }, function (res) {
      if (typeof (res.data) == 'object') {
        var arr = res.data;
        for (var i = 0; i < arr.length; i++) {
          arr[i]['num'] = 1.2;
          arr[i]['confirm'] = false;
          arr[i]['create_time'] = util.formatTime(new Date(arr[i]['create_time'] * 1000));
          if (arr[i]['is_receive'] == 1) arr[i]['status']="可送出";
          else arr[i]['status'] = "";
        }
        var key = "user.receive";
        that.setData({
          [key]: arr
        })
      }
    })
  },
  reqGive:function(){
    var that = this;
    app.func.req('/my/send', { openid: app.globalData.openid, pages: 1 }, function (res) {
      if (typeof (res.data) == 'object') {
        var arr = res.data;
        for (var i = 0; i < arr.length; i++) {
          arr[i]['num'] = 1.2;
          arr[i]['confirm'] = false;
          if (arr[i]['is_receive'] == 2) arr[i]['status'] = "";
          else arr[i]['status'] = util.outTime(arr[i]['create_time'] * 1000);
          arr[i]['create_time'] = util.formatTime(new Date(arr[i]['create_time'] * 1000));
        }
        var key = "user.give";
        that.setData({
          [key]: arr
        })
      }
    })
  },
  signIn: function () {
    var that = this;
    app.func.req('/sign/sign', { openid: app.globalData.openid }, function (res) {
      if (res) {
        var key1 = "gift.signIn";
        that.setData({
          gift:res.data,
          [key1]: true,
          showShadow: true
        })
        that.reqReceive();
      }
    })
  },
  left: function () {
    wx.reLaunch({
      url: '../index/index',
    })
  },
  changeView: function (e) {
    this.setData({
      currentIndex: e.target.dataset.idx
    });
  },
  close: function () {
    this.setData({
      showShadow: false
    });
  },
  foo: function (e) {
    console.log("hello~");
  },
  touchstart: function (e) {
    this.setData({
      broadwise: false,
      startX: e.touches[0].pageX,
      startY: e.touches[0].pageY
    });
  },
  touchmove: function (e) {
    var currentX = e.touches[0].pageX;
    var currentY = e.touches[0].pageY;
    var tx = currentX - this.data.startX;
    var ty = currentY - this.data.startY;
    var elemFrom = e.currentTarget.dataset.from;
    var idx = e.currentTarget.dataset.index;
    var distance = 0 - (this.data.user[elemFrom][idx].num - 1) * this.data.screenWidth;
    var key1 = 'user.' + elemFrom + '[' + idx + '].left';
    var key2 = 'user.' + elemFrom + '[' + idx + '].num';
    var key3 = 'user.' + elemFrom + '[' + idx + '].confirm';
    if (Math.abs(tx) > Math.abs(ty)) {
      this.setData({
        broadwise: true
      });
      if (tx < 0) {
        this.setData({
          [key1]: distance
        });
      } else if (tx > 0) {
        this.setData({
          [key1]: 0,
          [key2]: 1.2,
          [key3]: false
        });
      }
    }
    this.setData({
      startX: currentX,
      startY: currentY
    });
  },
  formSubmit:function(e){
    var that=this;
    app.func.req('/sign/formid', { formid: e.detail.formId,openid: app.globalData.openid }, function (res) {
      var elemFrom = e.currentTarget.dataset.from;
      var idx = e.currentTarget.dataset.index;
      var item = new Object();
      item.id = that.data.user[elemFrom][idx]['id'];
      item.gift_id = that.data.user[elemFrom][idx]['gift_id'];
      item.is_receive = that.data.user[elemFrom][idx]['is_receive'];
      item.gift_price = that.data.user[elemFrom][idx]['gift_price'];
      item.gift_img = that.data.user[elemFrom][idx]['gift_img'];
      item.gift_name = that.data.user[elemFrom][idx]['gift_name'];
      item["from"] = elemFrom;
      if(item.from=='receive' && !app.globalData.userInfo && item.gift_price==0){
        that.setData({
          authorizeBoard:1
        })
      }else{
        wx.navigateTo({
          url: '../letter/letter?item=' + JSON.stringify(item)
        })
      }
    })
  },
  confirmEvent: function (e) {
    var elemFrom = e.currentTarget.dataset.from;
    var idx = e.currentTarget.dataset.index;
    var key1 = 'user.' + elemFrom + '[' + idx + '].left';
    var key2 = 'user.' + elemFrom + '[' + idx + '].num';
    var key3 = 'user.' + elemFrom + '[' + idx + '].confirm';
    this.setData({
      [key2]: 1.3
    });
    var distance = 0 - (this.data.user[elemFrom][idx].num - 1) * this.data.screenWidth;
    this.setData({
      [key1]: distance,
      [key3]: true
    });
  },
  deleteEvent: function (e) {
    var that=this;
    var elemFrom = e.currentTarget.dataset.from;
    var idx = e.currentTarget.dataset.index;
    var url="";
    if (elemFrom=="give") url ='/my/fordel';
    else url = '/my/del'
    app.func.req(url, { openid: app.globalData.openid, id: that.data.user[elemFrom][idx].id }, function (res) {
      console.log(res.data)
    })
    var key1 = 'user.' + elemFrom;
    var key2 = 'user.' + elemFrom + '[' + idx + '].left';
    var key3 = 'user.' + elemFrom + '[' + idx + '].num';
    var key4 = 'user.' + elemFrom + '[' + idx + '].confirm';
    var arr = this.data.user[elemFrom];
    arr.splice(idx, 1);
    this.setData({
      [key1]: arr,
      [key2]: 0,
      [key3]: 1.2,
      [key4]: false
    });
    if (this.data.user[elemFrom].length == 1 && (!this.data.user[elemFrom][0].id)) {
      this.setData({
        [key1]: []
      });
    }
  },
  lastPage: function (e) {
    var that = this;
    if (!this.data.broadwise) {
      wx.showLoading({
        title: '刷新中...'
      })
      if (e.target.id == 'receive') {
        that.reqReceive();
      } else {
        that.reqGive();
      }
      setTimeout(function () {
        wx.hideLoading();
      }, 1000)
    }
  },
  nextPage: function (e) {
    var that = this;
    if (e.target.id == 'receive') {
      if (!this.data.showNotice1) {
        var page1 = this.data.pno1 + 1;
        app.func.req('/my/demand', { openid: app.globalData.openid, pages: page1 }, function (res) {
          if (typeof (res.data) == 'object') {
            wx.showLoading({
              title: '加载中...'
            })
            var arr = res.data;
            for (var i = 0; i < arr.length; i++) {
              arr[i]['num'] = 1.2;
              arr[i]['confirm'] = false;
              arr[i]['create_time'] = util.formatTime(new Date(arr[i]['create_time'] * 1000));
              if (arr[i]['is_receive'] == 1) arr[i]['status'] = "可送出";
              else arr[i]['status'] = "";
            }
            var arr1 = that.data.user.receive.concat(arr);
            var key = "user.receive";
            that.setData({
              [key]: arr1,
              pno1: page1
            })
          } else {
            that.setData({
              showNotice1: true
            })
          }
        })
      }
    } else {
      if (!this.data.showNotice2) {
        var page2 = this.data.pno2 + 1;
        app.func.req('/my/send', { openid: app.globalData.openid, pages: page2 }, function (res) {
          if (typeof (res.data) == 'object') {
            wx.showLoading({
              title: '加载中...'
            })
            var arr = res.data;
            for (var i = 0; i < arr.length; i++) {
              arr[i]['num'] = 1.2;
              arr[i]['confirm'] = false;
              if (arr[i]['is_receive'] == 2) arr[i]['status'] = "";
              else arr[i]['status'] = util.outTime(arr[i]['create_time'] * 1000);
              arr[i]['create_time'] = util.formatTime(new Date(arr[i]['create_time'] * 1000));
            }
            var arr1 = that.data.user.give.concat(arr);
            var key = "user.give"
            that.setData({
              [key]: arr1,
              pno2: page2
            })
          } else {
            that.setData({
              showNotice2: true
            })
          }
        })
      }
    }
    setTimeout(function () {
      wx.hideLoading();
    }, 1000)
  },
  toLetter:function(){
    var item = new Object();
    item["from"] ="receive";
    item.id=this.data.gift['id'];
    item.gift_id = this.data.gift['gift_id'];
    item.is_receive = this.data.gift['is_receive'];
    item.gift_price = this.data.gift['gift_price'];
    item.gift_img = this.data.gift['gift_img'];
    item.gift_name = this.data.gift['gift_name'];
    this.setData({
      showShadow:false
    });
    if(app.globalData.userInfo){
      wx.navigateTo({
        url: '../letter/letter?item=' + JSON.stringify(item)
      })
    }else{
      this.setData({
        authorizeBoard:1
      })
    }
  },
  onShareAppMessage: function () {
    return {
      title: "微信红包新玩法 · 挑选礼物 · 发给好友 · 领取立即到账",
      path: '/pages/index/index',
      imageUrl: '../../images/gift.png'
    }
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
  // 隐藏授权弹窗
  hideAuthorize() {
    this.setData({
      authorizeBoard: false,
      textareaShow: 1
    })
  },
})