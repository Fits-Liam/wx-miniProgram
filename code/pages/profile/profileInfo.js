// 获取应用实例
const app = getApp()

Page({
    data: {
        userid: '', // 用户ID
        userRole: '', // 用户角色
        userToken: '', // 用户TOKEN
        userWechatInfo: '', // 用户信息
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
            // 后续操作
            _that.getWechatInfo();
        } else {
            // 异步
            app.tokenCallback = () => {
                _that.setData({
                    userid: app.globalData.userInfo.wx_id,
                    userRole: app.globalData.userInfo.role,
                    userToken: app.globalData.token
                })
                // 后续操作
                _that.getWechatInfo();
            }
        }
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
                // 加载完成
                wx.hideLoading();
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 去修改姓名
    toEdit(e) {
        wx.navigateTo({
            url: '../profile/profileInfoEdit?type=' + e.currentTarget.dataset.type
        })
    },
})