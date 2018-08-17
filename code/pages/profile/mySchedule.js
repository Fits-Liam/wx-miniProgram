// 获取应用实例
const app = getApp()

Page({
    data: {
        userid: '', // 用户ID
        userRole: '', // 用户角色
        userToken: '', // 用户TOKEN
        mySchedule: '', // 我的进度
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
    init() {
        this.getMySchedule();
        // 清除缓存
        wx.removeStorageSync('my_schedule');
    },
    // 打电话
    callPhone(e) {
        wx.common.callPhone(e);
    },
    // 开始聊天
    startChat(e) {
        wx.common.startChat(e);
    },
    // 去子页
    toSubpage(e) {
        const index = e.currentTarget.dataset.index;
        wx.setStorageSync('my_schedule', this.data.mySchedule[index]);
        wx.common.toSubpage(e);
    },
    // 页面跳转
    toPage(e) {
        const id = e.currentTarget.dataset.id;
        if ( id ) {
            wx.common.toPage(e);
        }
    },
    // 获取我的进度
    getMySchedule() {
        wx.http({
            url: wx.api.profileSchedule,
            token: this.data.userToken,
            method: 'GET',
            data: {
                crm_code: 1
            }
        }).then(res => {
            console.log(res)
            if (res.status_code == 0 && res.data) {
                if (res.data.result == 1201) {
                    this.setData({
                        mySchedule: res.data.data
                    })
                }
                // 加载完成
                wx.hideLoading();
            }else{
                // 返回提示信息
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 2000
                });
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    }
})