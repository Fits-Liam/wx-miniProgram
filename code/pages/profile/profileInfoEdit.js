// 获取应用实例
const app = getApp()

Page({
    data: {
        userid: '', // 用户ID
        userRole: '', // 用户角色
        userToken: '', // 用户TOKEN
        queryType: '', // 页面类型
        mobileValue: '', // 手机号
        codeValue: '获取验证码', // 按钮文字
        codeCountdown: 60, // 倒计时
        codeCountdownStart: false, // 是否开始倒计时
    },
    onLoad(opts) {
        if (opts.type == 'username') {
            wx.setNavigationBarTitle({
                title: '姓名'
            });
        }
        if (opts.type == 'mobile') {
            wx.setNavigationBarTitle({
                title: '手机号'
            });
        }
        this.setData({
            queryType: opts.type
        });
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
        } else {
            // 异步
            app.tokenCallback = () => {
                _that.setData({
                    userid: app.globalData.userInfo.wx_id,
                    userRole: app.globalData.userInfo.role,
                    userToken: app.globalData.token
                })
            }
        }
    },
    // 输入框监听
    inputTyping(e) {
        this.setData({
            mobileValue: e.detail.value,
        });
    },
    // 验证码倒计时
    getVerificationCode(){
        const _that = this;
        if ( !_that.data.codeCountdownStart ) {
            wx.http({
                url: wx.api.getMobileCode,
                method: 'POST',
                data:{
                    mobile: this.data.mobileValue,
                    type: 'update_mobile'
                }
            }).then(res => {
                if (res.status_code == 0) {
                    _that.sendCountdown();
                }else{
                    wx.showToast({
                        title: res.message,
                        icon: 'none',
                        duration: 1500
                    }) 
                }
            }).catch(error => {
                console.log('请求错误:', error);
            });
        }
    },
    // 发送倒计时
    sendCountdown(){
        const _that = this;
        let codeCountdown = _that.data.codeCountdown
        let interval = setInterval(function() {
            codeCountdown--;
            _that.setData({
                codeValue: codeCountdown,
                codeCountdownStart: true
            })

            if (codeCountdown <= 0) {
                clearInterval(interval)
                _that.setData({
                    codeValue: '重新发送',
                    codeCountdown: 60,
                    codeCountdownStart: false
                })
            }
        }, 1000)
    },
    // 表单提交
    formSubmit(e){
        wx.http({
            url: wx.api.profileUpdateInfo,
            token: this.data.userToken,
            method: 'POST',
            data: e.detail.value
        }).then(res => {
            if (res.status_code == 0) {
                wx.navigateBack();
            }else{
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 1500
                }) 
            }
        }).catch(error => {
            console.log('请求错误:', error);
        });
    }
})