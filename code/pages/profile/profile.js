// 获取应用实例
const app = getApp()

Page({
    data: {
        pageId: 'profile', // 页面路径
        userid: '', // 用户ID
        userRole: '', // 用户角色
        userToken: '', // 用户TOKEN
        userWechatInfo: '', // 用户信息
        userWechatInfoTips: false, // 个人信息不全提示
        myConsults: '', // 专属顾问
		msgTips: false
    },
    onLoad(opts) {
        
    },
    onShow() {
        // 加载提示
        wx.showLoading({
            title: 'Loading...'
        });

        const _that = this;
        if (app.globalData.token) {
            // 正常
            _that.setData({
                userid: app.globalData.userInfo.wx_id,
                userRole: app.globalData.userInfo.role,
                userToken: app.globalData.token
            })
            _that.init();
        } else {
            // 异步
            app.tokenCallback = () => {
                _that.setData({
                    userid: app.globalData.userInfo.wx_id,
                    userRole: app.globalData.userInfo.role,
                    userToken: app.globalData.token
                })
                _that.init();
            }
        }
    },
    init(){
		this.loadMsgCount();
        this.accessAuthority();
    },
    // 下拉刷新
    onPullDownRefresh(){
        this.init();
    },
    // 访问权限
    accessAuthority() {
        if (this.data.userRole != 'customer') {
            wx.redirectTo({
                url: '../index/index'
            })
        }else{
            this.getWechatInfo();
            this.getMyConsults();
        }
    },
    // 打电话
    callPhone(e) {
        wx.common.callPhone(e);
    },
    // 去子页
    toSubpage(e) {
        wx.common.toSubpage(e);
    },
    // 获取微信基本信息
    getWechatInfo() {
        wx.http({
            url: wx.api.profileWxInfo,
            token: this.data.userToken,
            method: 'GET',
        }).then(res => {
            if (res.status_code == 0) {
                // 更新数据
                if ( res.data.mobile ) {
                    this.setData({
                        userWechatInfo: res.data,
                        ['userWechatInfo.mobile']: res.data.mobile.replace(/^(\d{3})\d{4}(\d{4})$/,'$1****$2')
                    })
                }else{
                    this.setData({
                        userWechatInfo: res.data
                    })
                }
                // 真实姓名和手机号不全时，显示提示
                if (!res.data.username || !res.data.mobile) {
                    this.setData({
                        userWechatInfoTips: true,
                    })
                }
                // 加载完成
                wx.hideLoading();
                wx.stopPullDownRefresh();
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 获取专属顾问
    getMyConsults() {
        wx.http({
            url: wx.api.profileMyConsults,
            token: this.data.userToken,
            method: 'GET',
        }).then(res => {
            if (res.status_code == 0) {
                // 更新数据
                this.setData({
                    myConsults: res.data.consults.data.slice(0,3),
                })
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 去服务意向
    toProject() {
        wx.navigateTo({
            url: '../message/messageProject'
        })
    },
    // 去服务进度
    toSchedule() {
        wx.http({
            url: wx.api.profileWxInfo,
            token: this.data.userToken,
            method: 'GET',
        }).then(res => {
            if (res.status_code == 0) {
                if ( !res.data.username || !res.data.mobile ) {
                    // 信息不完整，先填写信息
                    wx.showModal({
                        title: '提示',
                        content: '请先完善您的信息',
                        showCancel: false,
                        success: (res) => {
                            if (res.confirm) {
                                wx.navigateTo({
                                    url: '../profile/profileInfo'
                                })
                            }
                        }
                    })
                }else{
                    // 信息完整，直接查看服务进度
                    wx.navigateTo({
                        url: '../profile/mySchedule'
                    })
                }
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 去浏览记录
    toBrowsingHistory() {
        wx.navigateTo({
            url: '../browsingHistory/browsingHistory'
        })
    },
	loadMsgCount() {
		wx.http({
			url: wx.api.unReadMessage,
			method: 'get',
			token: this.data.userToken,
		})
		.then(res => {
			let code = res.status_code;
			if (code == 0) {
				if (res.data.unread_count > 0) {
					this.setData({
						msgTips: true
					});
				}
			}
		})
		.catch(error => {
			console.log(error);
		});
	},
})