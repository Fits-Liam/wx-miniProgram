// 获取应用实例
const app = getApp()

Page({
    data: {
        userRole: '', // 用户角色
        userToken: '', // 用户TOKEN
        myConsults: '', // 专属顾问
        loadingMore: true,
        loadingEnd: true,
        msgTips: false,
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
                userRole: app.globalData.userInfo.role,
                userToken: app.globalData.token
            })
            _that.init();
        } else {
            // 异步
            app.tokenCallback = () => {
                _that.setData({
                    userRole: app.globalData.userInfo.role,
                    userToken: app.globalData.token
                })
                _that.init();
            }
        }
    },
    init() {
        const that = this;
        // 获取系统信息
        wx.getSystemInfo({
            success: (res) => {
                wx.createSelectorQuery().selectAll('.m-bottom-nav').boundingClientRect((rects) => {
                    rects.forEach((rect) => {
                        that.setData({
                            scrollHeight: res.windowHeight - rect.height
                        })
                    })  
                }).exec()
            }
        })

        this.getMyConsults();
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
        wx.common.toPage(e);
    },
    // 获取专属顾问
    getMyConsults(type) {
        let myConsults = this.data.myConsults;
        // 默认参数
        let curParams = {};
        // 判断加载方式
        if (type == 'add') {
            curParams['page'] = myConsults.current_page + 1
        }

        wx.http({
            url: wx.api.profileMyConsults,
            token: this.data.userToken,
            method: 'GET',
            data: curParams
        }).then(res => {
            console.log(res)
            if (res.status_code == 0) {
                let curData = res.data.consults;
                if (type == 'add') {
                    // 添加：追加数据
                    this.setData({
                        myConsults: curData,
                        ['myConsults.data']: myConsults.data.concat(curData.data)
                    })
                    // 下拉加载提示
                    this.bindDownLoadTips(curData.current_page, curData.last_page);
                } else {
                    // 默认：重置数据
                    this.setData({
                        myConsults: curData
                    })
                    // 加载完成
                    wx.hideLoading();
                }
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    //获得消息未读总数
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
    // 下拉加载
    bindDownLoad() {
        const curData = this.data.myConsults;
        if (curData.current_page != curData.last_page) {
            this.getMyConsults('add');
        }
    },
    // 下拉加载提示
    bindDownLoadTips(cur, last) {
        if (cur == last) {
            this.setData({
                loadingMore: true,
                loadingEnd: false,
            })
        } else {
            this.setData({
                loadingMore: false,
                loadingEnd: true,
            })
        }
    }
})