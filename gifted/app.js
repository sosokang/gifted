//app.js
var http = require('service/http');
var share = require('service/share');
var img = require('service/img');
var info = require('service/shebei');
var pay = require('service/pay');
var config = require('service/config');
var upload_file = require('service/upload_file')
var objz = {};
var loginStatus = true;
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var find = wx.getStorageSync('find') || []
    find.unshift(Date.now())
    wx.setStorageSync('find', find)
    // console.log(find)
    // 获取用户信息
    // this.getUserInfo();
    this.getSystemInfo();
    this.bindNetworkChange();//监听网络变化事件
    // this.getPromission();
    let openid = wx.getStorageSync('openid')
    let userInfo = wx.getStorageSync('userInfo')
    // console.log(userInfo)
    if(!openid){
      this.userinfo();
    }else{
      this.globalData.openid = openid;
      if(userInfo){
        this.globalData.userInfo = userInfo;
      }else{
        this.getUserInfo()
      }
    }
  },
  ///获取用户的openid
  userinfo: function () {
    var _this = this;
    wx.login({
      success: function (res) {
        // console.log(res);
        if (res.code) {
          http.req(config.GETOPENIDURL, { appid: config.APPID, secret: config.SECRET, js_code: res.code }, function (res) {
            // console.log(res,'aaaa');
            var obj = {};
            obj.openid = res.data.openid;
            if (res.data.openid) {
              // console.log(res)
              _this.globalData.openid = res.data.openid;
              wx.setStorageSync('openid', res.data.openid);//存储openid
            }
          });
        }
      }
    })
  },
  getPromission: function () {
    if (!loginStatus) {
      wx.openSetting({
        success: function (data) {
          console.log(data)
          if (data) {
            if (data.authSetting["scope.userInfo"] == true) {
              loginStatus = true;
              wx.getUserInfo({
                withCredentials: false,
                success: function (data) {
                  console.info("2成功获取用户返回数据");
                  console.info(data.userInfo);
                  console.log(data)
                },
                fail: function () {
                  console.info("2授权失败返回数据");
                }
              });
            }
          }
        },
        fail: function () {
          console.info("设置失败返回数据");
        }
      });
    } else {
      wx.login({
        success: function (res) {
          if (res.code) {
            wx.getUserInfo({
              withCredentials: false,
              success: function (data) {
                console.info("1成功获取用户返回数据");
                console.info(data.userInfo);
              },
              fail: function () {
                console.info("1授权失败返回数据");
                loginStatus = false;
                // 显示提示弹窗
                wx.showModal({
                  title: '需要用户授权',
                  content: '确定授权？',
                  success: function (res) {
                    if (res.cancel) {
                      console.log('用户点击取消');
                    } else if (res.confirm) {
                      wx.openSetting({
                        success: function (data) {
                          if (data) {
                            if (data.authSetting["scope.userInfo"] == true) {
                              loginStatus = true;
                              wx.getUserInfo({
                                withCredentials: false,
                                success: function (data) {
                                  console.info("3成功获取用户返回数据");
                                  console.info(data.userInfo);
                                },
                                fail: function () {
                                  console.info("3授权失败返回数据");
                                }
                              });
                            }
                          }
                        },
                        fail: function () {
                          console.info("设置失败返回数据");
                        }
                      });
                    }
                  }
                });
              }
            });
          }
        },
        fail: function () {
          console.info("登录失败返回数据");
        }
      });
    }
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {

      wx.getSetting({
        success(res) {
          // console.log(res,222)
          if(res.authSetting['scope.userInfo']){
            wx.getUserInfo({
              success(res) {
                // console.log(res ,11111)
                objz.avatarUrl = res.userInfo.avatarUrl;
                objz.nickName = res.userInfo.nickName;
                objz.city = res.userInfo.city;
                objz.province = res.userInfo.province;
                wx.setStorageSync('userInfo', objz);//存储userInfo  
                that.globalData.userInfo = res.userInfo
                // console.log(that.globalData.userInfo)
                typeof cb == "function" && cb(that.globalData.userInfo)
              }
            })
          }
          // if (!res['scope.userInfo']) {
          //   wx.authorize({
          //     scope: 'scope.userInfo',
          //     success(res) {
          //       console.log(res,11)
          //       // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问 
          //       // wx.getUserInfo
          //     }
          //   })
          // }
        }
      })
    }
  },
  getOpenid: function (cb) {
    //调用登录接口
    var that = this;
    if (this.globalData.openid) {
      typeof cb == "function" && cb(this.globalData.openid)
    } else {
      wx.login({
        success: function (res) {
          // console.log(res.code);
          if (res.code) {
            http.req(config.GETOPENIDURL, { appid: config.APPID, secret: config.SECRET, js_code: res.code }, 
              function (res) {
              // console.log(res);
                var obj = {};
                obj.openid = res.data.openid;
                typeof cb == "function" && cb(res.data.openid)
                obj.expires_in = Date.now() + res.data.expires_in;
                // console.log(obj.nickName);  
                wx.setStorageSync('user', obj);//存储openid
                // console.log(obj.openid, 'openid')
                var userinfo = {};
                userinfo.openid = obj.openid
                userinfo.avatarUrl = objz.avatarUrl
                userinfo.nickName = objz.nickName
                userinfo.city = objz.city
                userinfo.province = objz.province
                // http.req(config.SAVEUSERINFO, userinfo, function (res) {
                //   var user = wx.getStorageSync('user');
                //   console.log(user);

                // });
            });
          } else {
            console.log('获取用户登录态失败！' + res.errMsg)
          }
        }
      })
    }
  },
  //设备信息
  getSystemInfo: function () {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.systemInfo = res
      }
    })
  },
  dealNetworkData: function (res) {
    this.globalData.networkType = res.networkType;
    if (res.networkType == 'none') {
      wx.showModal({
        title: "提示",
        content: "当前网略异常，请检查网略并重新刷新",
        showCancel: false,
        confirmText: "知道了",
      });
    }
  },
  bindNetworkChange: function () {
    var that = this;
    wx.onNetworkStatusChange(function (res) {
      that.dealNetworkData(res);
    });
  },
  getNetworkType: function (cb) {
    var that = this;
    wx.getNetworkType({
      success: function (res) {
        typeof cb == "function" ? cb(that.globalData.networkType) : that.dealNetworkData(res)
      }
    });
    return that.globalData.networkType;
  },
  globalData: {
    userInfo: null,
    networkType: 'none',
    systemInfo: null,
    openid: null
  },
  func: {
    req: http.req,
    share: share.share,
    imageUtil: img.imageUtil,
    info: info.equipment.windowWidth,
    pay: pay.pay,
    config: config,
    upload_file: upload_file.upload_file
  },
})
