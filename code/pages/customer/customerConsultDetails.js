// 获取应用实例
const app = getApp()

Page({
    data: {
        userid: '', // 用户ID
        userRole: '', // 用户角色
        userToken: '', // 用户TOKEN
        consultData: '', // 咨询详情
        queryId: '', // 页面传参
    },
    onLoad(opts) {
        this.setData({
            queryId: opts.id
        });
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
        this.getConsultData();
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
        wx.common.toSubpage(e);
    },
    // 获取咨询数据
    getConsultData() {
        wx.http({
            url: wx.api.consultantConsultDetail,
            token: this.data.userToken,
            method: 'GET',
            data: {
                id: this.data.queryId
            }
        }).then(res => {
            console.log(res.data);
            // 更新数据
            if (res.status_code == 0) {
                this.setData({
                    consultData: res.data.consulting_detail,
                })
                // 加载完成
                wx.hideLoading();
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
})