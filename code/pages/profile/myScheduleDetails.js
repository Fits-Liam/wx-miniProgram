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
    },
    // 打电话
    callPhone(e) {
        wx.common.callPhone(e);
    },
    // 开始聊天
    startChat(e) {
        wx.common.startChat(e);
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
        this.setData({
            mySchedule: wx.getStorageSync('my_schedule')
        })
        console.log(this.data.mySchedule)
    }
})