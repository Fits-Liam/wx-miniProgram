// 获取应用实例
const app = getApp()

Page({
    data: {
        baseUserInfo: '', // 基础信息
        query: '', // 页面来源参数,
        queryPath: '', // 页面来源地址,
        registerWay: '', // 注册访问形式
        showAuthorize: true, // 授权按钮显示、隐藏
        channelCode: '', // 渠道码
    },
    // 生命周期 - 监听页面加载
    onLoad(opts) {
        console.log( opts )

        this.setData({
            query: opts,
            queryPath: opts.from
        });

        // 获取渠道码
        if ( opts.scene ) {
            let scene = decodeURIComponent(decodeURIComponent(opts.scene));
            this.setData({
                channelCode: scene.substring(scene.lastIndexOf('=')+1, scene.length)
            });
            console.log(this.data.channelCode)
        }

        // 判断通过文章、名片访问
        if ( opts.from == '/pages/webview/webview' && opts.mid || opts.from == '/pages/card/card' ) {
            this.setData({
                registerWay: 2
            });
        }
        console.log('注册页访问形式：' + this.data.registerWay);

        wx.removeStorageSync('token');
        wx.removeStorageSync('userInfo');
    },
    // 授权事件
    getUserInfo(e) {
        if (!e.detail.userInfo) {
            console.log('拒绝授权')
            return;
        } else {
            console.log('同意授权')
            this.loginValidate();
        }
    },
    // 开始验证登陆信息
    loginValidate() {
        const _that = this;
        wx.login({
            success: (res) => {
                // 用 code 登录
                console.log(res)
                if (res.code) {
                    wx.http({
                        url: wx.api.accountsLogin,
                        method: 'POST',
                        data: {
                            code: res.code,
                            register_way: this.data.registerWay,
                            channel_code: this.data.channelCode
                        }
                    }).then(res => {
                        if (res.status_code == 0) {
                            // 默认授权
                            console.log('默认授权')

                            // 缓存 Token
                            wx.setStorageSync('userInfo', res.data);
                            wx.setStorageSync('token', 'Bearer ' + res.data.token);

                            // 更新全局变量
                            app.globalData.userInfo = res.data;
                            app.globalData.token = 'Bearer ' + res.data.token;

                            // 获取用户信息
                            wx.getUserInfo({
                                success: (res) => {
                                    _that.setData({
                                        baseUserInfo: res
                                    });
                                    _that.oldUserRegister();
                                }
                            })
                        } else if ( res.status_code == 4301 ) {
                            // 新人授权（未在营销平台注册过）
                            console.log('新人授权')

                            const _sessionKey = res.data.session_key;
                            wx.getUserInfo({
                                success: (res) => {
                                    _that.setData({
                                        baseUserInfo: res
                                    });
                                    _that.newUserRegister(_sessionKey);
                                }
                            })
                        } else if ( res.status_code == 401 ){
                            // 返回提示信息
                            wx.showToast({
                                title: '注册 - 权限不足',
                                icon: 'none',
                                duration: 2000
                            });
                        } else if ( res.status_code == 1 ){
                            wx.showToast({
                                title: res.message,
                                icon: 'none',
                                duration: 2000
                            });
                        }
                    }).catch(error => {
                        console.log('请求错误：', error);
                    })
                } else {
                    wx.showToast({
                        title: '登录失败，请重新尝试。',
                        icon: 'none',
                        duration: 2000
                    });
                }
            }
        })
    },
    // 新用户注册（获取 UnionID）
    newUserRegister(sessionKey) {
        wx.http({
            url: wx.api.accountsSession,
            method: 'POST',
            data: {
                sessionKey: sessionKey,
                encryptedData: this.data.baseUserInfo.encryptedData,
                iv: this.data.baseUserInfo.iv,
                register_way: this.data.registerWay,
                channel_code: this.data.channelCode
            }
        }).then(res => {
            console.log(res)
            if (res.status_code == 0) {
                const _token = 'Bearer ' + res.data.token;

                // 缓存 Token
                wx.setStorageSync('userInfo', res.data);
                wx.setStorageSync('token', 'Bearer ' + res.data.token);

                // 更新全局变量
                app.globalData.userInfo = res.data;
                app.globalData.token = 'Bearer ' + res.data.token;

                this.goToBack();
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 老用户注册（更新信息）
    oldUserRegister() {
        wx.http({
            url: wx.api.accountUpdateInfo,
            token: wx.getStorageSync('token'),
            method: 'POST',
            data: {
                nickname: this.data.baseUserInfo.userInfo.nickName,
                headimgurl: this.data.baseUserInfo.userInfo.avatarUrl
            }
        }).then(res => {
            console.log(res)
            if (res.status_code == 0) {
                this.goToBack();
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 回到原来的页面
    goToBack() {
        let obj = this.data.query;
        delete obj['from'];

        // 拼接参数
        let params = Object.keys(obj).map((k) => {
            return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
        }).join('&');

        wx.redirectTo({
            url: this.data.queryPath + '?' + params
        })
    },
})