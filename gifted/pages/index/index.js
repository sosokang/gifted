//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    gift: [],
    screenWidth: 0,
    screenHeight: 0,
    price: 0,
    signIn: true,
    page: 1,
    flag: false,
    tem: {
      active1: "active",
      active2: ""
    }
    // isChecked: false 
  },
  //事件处理函数
  goSign: function () {
    if (this.data.signIn) {
      wx.navigateTo({
        url: '../mine/mine',
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine?signIn=true',
      })
    }
    this.setData({
      signIn: true
    })
  },
  right: function () {
    wx.navigateTo({
      url: '../mine/mine',
    })
  },
  giftGift: function (e) {
    var id = e.currentTarget.dataset.id,
      name = e.currentTarget.dataset.name,
      type = e.currentTarget.dataset.type,
      price = e.currentTarget.dataset.price,
      gift_pic = e.currentTarget.dataset.gift_pic
    wx.navigateTo({
      url: '../letter/letter?id=' + id + '&name=' + name + '&type=' + type + '&price=' + price + '&gift_pic=' + gift_pic,
    })
  },
  formSubmit: function (e) {
    // console.log(e)
    var that = this;
    app.func.req('/sign/formid', { formid: e.detail.formId, openid: app.globalData.openid }, function (res) {
      // console.log(res)
    })
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
    })
    // 隐藏加载框  
    setTimeout(function () {
      wx.hideLoading()
    }, 1000)
    var that = this;
    app.getOpenid(function (id) {
      // 判断签到
      app.func.req('/sign/whether', { openid: app.globalData.openid }, function (res) {
        if (res) {
          that.setData({
            signIn: res.data,
          })
        }
      })
    })
    // 从本地缓存中同步获取指定 key 对应的内容。
    var value = wx.getStorageSync("unique")
    console.log(value)
    //调用接口
    if (!value) {
      app.func.req('/index/index', {}, function (res) {
        if (res) {
          that.setData({
            gift: res.data,
          })
          // 将数据存储在本地缓存中指定的 key 中
          wx.setStorage({
            key: 'unique',
            data: JSON.stringify(res.data),
          })

        }
      })
    } else {
      that.setData({
        gift: JSON.parse(value)
      })
    }

  },
  getPage(){

  },
  onUnload: function () {
    wx.clearStorageSync()
  },
  /**
  * 页面相关事件处理函数--监听用户下拉动作
  */
  // onPullDownRefresh: function () {
  //   wx.showLoading({
  //     title: '加载中...'
  //   })
  //   var arr1 = [

  //   ]
  //   var key = "user.gift"
  //   this.setData({
  //     [key]: arr1
  //   });
  //   setTimeout(function () {
  //     wx.hideLoading();
  //   }, 2000)
  //   // this.getList();
  //   console.log('刷新数据')
  //   wx.stopPullDownRefresh()
  // },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    var page = ++that.data.page,
      flag = that.data.flag
    // 页数+1  
    that.setData({
      page: page + 1
    })
    if (!that.data.flag) {
      wx.showLoading({
        title: '加载中...'
      })
      app.func.req('/index/index', { page: page }, function (res) {

        if (!res.data.length) {
          that.data.flag = true;
        }
        var moment_list = that.data.gift;
        for (var i = 0; i < res.data.length; i++) {
          moment_list.push(res.data[i]);
        }
        that.setData({
          gift: moment_list
        })
        // 隐藏加载框  
        wx.hideLoading();
      })
    }
  },
  onShareAppMessage: function () {
    return {
      title: "微信红包新玩法 · 挑选礼物 · 发给好友 · 领取立即到账",
      path: '/pages/index/index',
      imageUrl: '../../images/gift.png'
    }
  }
})
