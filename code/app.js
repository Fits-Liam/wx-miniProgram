// 全局引用工具
wx.util = require('./utils/util');
wx.http = require('./utils/request');
wx.api = require('./utils/router');
wx.common = require('./utils/common');

App({
    onLaunch(res) {
        let query = res.query;
        let params = Object.keys(query).map((k) => {
            return encodeURIComponent(k) + '=' + encodeURIComponent(query[k]);
        }).join('&');

        // 获取当前页面路径
        if ( params ) {
            this.globalData.path = res.path + '&' + params;
        }else{
            this.globalData.path = res.path
        }
        // 获取渠道码
        if ( res.query.scene ) {
            let scene = decodeURIComponent(res.query.scene);
            this.globalData.channelCode = scene.substring(scene.lastIndexOf('=')+1, scene.length);
        }
    },
    onShow() {
        this.bindUpdate();
        this.bindLogin()
    },
    // 小程序更新机制
    bindUpdate(){
        const updateManager = wx.getUpdateManager();
        updateManager.onCheckForUpdate((res) => {
            // 请求完新版本信息的回调
            console.log('%c 是否有新版本：' + res.hasUpdate , 'color:red;');
            // 请求完新版本信息的回调
            if (res.hasUpdate) {
                updateManager.onUpdateReady(() => {
                    wx.showModal({
                        title: '更新提示',
                        content: '新版本已准备完毕，请重新启动',
                        showCancel: false,
                        success: (res) => {
                            if (res.confirm) {
                                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                updateManager.applyUpdate();
                            }
                        }
                    })
                })
                updateManager.onUpdateFailed(() => {
                    // 新的版本下载失败
                    wx.showModal({
                        title: '已经有新版本了哟~',
                        content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
                    })
                })
            }
        })
    },
    // 登陆操作
    bindLogin(){
        const _that = this;
        // 网络及授权判断
        wx.getNetworkType({
            success: (res) => {
                if ( res.networkType == 'none' ) {
                    setTimeout(function(){
                        wx.showToast({
                            title: '请检查网络是否连接',
                            icon: 'none',
                            duration: 10000
                        })
                    }, 1000)
                }else{
                    let registerWay = '';
                    if ( _that.globalData.path.indexOf('pages/webview/webview') == 0 || _that.globalData.path.indexOf('pages/card/card') == 0 ) {
                        registerWay = 2;
                    }
                    console.log('当前路径：' + _that.globalData.path)
                    console.log('页面方式：' + registerWay)
                    wx.login({
                        success: (res) => {
                            if (res.code) {
                                wx.http({
                                    url: wx.api.accountsLogin,
                                    method: 'POST',
                                    data: {
                                        code: res.code,
                                        register_way: registerWay,
                                        channel_code: _that.globalData.channelCode
                                    }
                                }).then(res => {
                                    console.log( res )
                                    if (res.status_code == 0) {
                                        if ( !res.data.nickname || !res.data.headimgurl ) {
                                            // 登录后，返回的 nickname 和 headimgurl 都为空时，为老用户注册
                                            _that.toAuthorize();
                                        }else{
                                            // 缓存 Token
                                            wx.setStorageSync('userInfo', res.data);
                                            wx.setStorageSync('token', 'Bearer ' + res.data.token);

                                            // 更新全局变量
                                            _that.globalData.userInfo = res.data;
                                            _that.globalData.token = 'Bearer ' + res.data.token;

                                            console.log('%c 角色：' + res.data.role , 'color:red;');
                                            console.log('%c Token：' + res.data.token , 'color:red;');

                                            // 由于这里是网络请求，可能会在 Page.onLoad 之后才返回，所以此处加入 callback 以防止这种情况
                                            if (_that.tokenCallback) {
                                                _that.tokenCallback();
                                            }

                                            // 计算用户停留时间
                                            if ( res.data.role == 'customer' ) {
                                                _that.stayTimes();
                                                setInterval(() =>{
                                                    _that.stayTimes(2);
                                                }, 60000);
                                            }
                                        }
                                    } else if (res.status_code == 4301) {
                                        _that.toAuthorize();
                                    }else if(res.status_code == 1){
                                        // 渠道码不存在
                                        _that.toAuthorize();
                                    }
                                }).catch(error => {
                                    console.log('请求错误：', error);
                                })
                            }
                        }
                    })
                }
            }
        })
    },
    // 去授权页
    toAuthorize() {
        setTimeout(() => {
            // 跳转到登陆页，并带上当前页面路径及参数
            wx.redirectTo({
                url: "/pages/authorize/authorize?from=/" + this.globalData.path
            })
        }, 500)
    },
    // 去视图页
    goWebview(e) {
        console.log('url:', e.currentTarget.dataset);
        let title = e.currentTarget.dataset.title;
        let img = e.currentTarget.dataset.img;
        let id = e.currentTarget.dataset.id;
        let url = e.currentTarget.dataset.url;
        let domian = url.split('?')[0];
        let query = url.split('?')[1];
        let v = query.split('&')[0];
        let mid = query.split('&')[2];

        wx.navigateTo({
            url: '../../pages/webview/webview?domian=' + this.globalData.articleUrl + '&' + query + '&title=' + title + '&img=' + img + '&id=' + id + '&' + v + '&=' + mid
        });
    },
     // 计算用户停留时间
    stayTimes(state){
        // 默认参数
        let curParams = {};
        if ( state == 2 ) {
            curParams = {
                id: wx.getStorageSync('stayTimes')
            }
        }

        wx.http({
            url: wx.api.stayTimes,
            token: this.globalData.token,
            method: 'POST',
            data: curParams
        }).then(res => {
            console.log(res)
            if ( res.status_code == 0 ) {
                wx.setStorageSync('stayTimes', res.data.id);
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    globalData: {
        version: '2.0.3', // 版本号
        userInfo: null,
        token: null,
        channelCode: '',
        articleUrl: 'https://marketing.mofi.com.cn/Cms/minappArticle',
        path: null,
    },
})