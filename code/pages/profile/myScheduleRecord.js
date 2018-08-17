// 获取应用实例
const app = getApp()

Page({
    data: {
        userid: '', // 用户ID
        userRole: '', // 用户角色
        userToken: '', // 用户TOKEN
        myConsults: '' // 专属顾问
    },
    onLoad(opts) {
        
    },
    onShow() {
        // // 加载提示
        // wx.showLoading({
        //     title: 'Loading...'
        // });

        const _that = this;
        if (app.globalData.token) {
            // 正常
            _that.setData({
                userid: app.globalData.userInfo.wx_id,
                userRole: app.globalData.userInfo.role,
                userToken: app.globalData.token
            })
            // 后续操作
            // _that.getMyConsults();
        } else {
            // 异步
            app.tokenCallback = () => {
                _that.setData({
                    userid: app.globalData.userInfo.wx_id,
                    userRole: app.globalData.userInfo.role,
                    userToken: app.globalData.token
                })
                // 后续操作
                // _that.getMyConsults();
            }
        }
    },
})