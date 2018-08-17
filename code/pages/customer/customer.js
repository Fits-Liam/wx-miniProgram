// 获取应用实例
const app = getApp()

Page({
    data: {
        pageId: 'customer', // 页面路径
        userRole: '', // 用户角色
        userToken: '', // 用户TOKEN
        tabType: 1, // 标签类型
        todayAnalysis: '', // 今日分析
        todayVisitor: '', // 今日访客
        todayConsult: '', // 今日咨询
        viewHistroy: '', // 浏览记录
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
        this.accessAuthority();
        this.loadMsgCount();
    },
    // 下拉刷新
    onPullDownRefresh(){
        this.init();
    },
    // 访问权限
    accessAuthority() {
        if (this.data.userRole == 'customer') {
            wx.redirectTo({
                url: '../index/index'
            })
        } else {
            this.getTodayAnalysis();

            if (this.data.tabType == 1) {
                this.getTodayVisitor();
            }
            if (this.data.tabType == 2) {
                this.getTodayConsult();
            }
            if (this.data.tabType == 3) {
                this.getViewHistroy();
            }
        }
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
    // 获得消息未读总数
    loadMsgCount() {
        wx.http({
            url: wx.api.unReadMessage,
            token: this.data.userToken,
            method: 'GET'
        }).then(res => {
            let code = res.status_code;
            if (code == 0) {
                if (res.data.unread_count > 0) {
                    this.setData({
                        msgTips: true
                    });
                }
            }
        }).catch(error => {
            console.log('请求错误：', error);
        });
    },
    switchArtical(e) {
        const tabType = e.currentTarget.dataset.type;
        if (tabType == this.data.tabType) {
            return false
        };
        this.setData({
            tabType
        });
        if (tabType == 1) {
            this.getTodayVisitor();
        }
        if (tabType == 2) {
            this.getTodayConsult();
        }
        if (tabType == 3) {
            this.getViewHistroy();
        }
    },
    // 今日统计
    getTodayAnalysis() {
        wx.http({
            url: wx.api.consultantAnalysis,
            token: this.data.userToken,
            method: 'GET'
        }).then(res => {
            if (res.status_code == 0) {
                // 更新数据
                this.setData({
                    todayAnalysis: res.data,
                })
                // 加载完成
                wx.hideLoading();
                wx.stopPullDownRefresh();
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 获取今日访客
    getTodayVisitor(type) {
        let todayVisitor = this.data.todayVisitor;
        // 默认参数
        let curParams = {};
        // 判断加载方式
        if (type == 'add') {
            curParams['page'] = todayVisitor.current_page + 1
        }

        wx.http({
            url: wx.api.consultantTodayVisitor,
            token: this.data.userToken,
            method: 'GET',
            data: curParams
        }).then(res => {
            if (res.status_code == 0) {
                let curData = res.data.viewers;
                if (type == 'add') {
                    // 添加：追加数据
                    this.setData({
                        todayVisitor: curData,
                        ['todayVisitor.data']: todayVisitor.data.concat(curData.data)
                    })
                    // 下拉加载提示
                    this.bindDownLoadTips(curData.current_page, curData.last_page);
                } else {
                    // 默认：重置数据
                    this.setData({
                        todayVisitor: curData
                    })
                }
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 获取今日咨询
    getTodayConsult(type) {
        let todayConsult = this.data.todayConsult;
        // 默认参数
        let curParams = {
            today: 1
        };
        // 判断加载方式
        if (type == 'add') {
            curParams['page'] = todayConsult.current_page + 1
        }

        wx.http({
            url: wx.api.consultantTodayConsult,
            token: this.data.userToken,
            method: 'GET',
            data: curParams
        }).then(res => {
            if (res.status_code == 0) {
                let curData = res.data.consulting;
                if (type == 'add') {
                    // 添加：追加数据
                    this.setData({
                        todayConsult: curData,
                        ['todayConsult.data']: todayConsult.data.concat(curData.data)
                    })
                    // 下拉加载提示
                    this.bindDownLoadTips(curData.current_page, curData.last_page);
                } else {
                    // 默认：重置数据
                    this.setData({
                        todayConsult: curData
                    })
                }
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 获取浏览记录
    getViewHistroy(type) {
        let viewHistroy = this.data.viewHistroy;
        // 默认参数
        let curParams = {};
        // 判断加载方式
        if (type == 'add') {
            curParams['page'] = viewHistroy.current_page + 1
        }

        wx.http({
            url: wx.api.consultantViewHistroy,
            token: this.data.userToken,
            method: 'GET',
            data: curParams
        }).then(res => {
            if (res.status_code == 0) {
                let curData = res.data.view_history;
                if (type == 'add') {
                    // 添加：追加数据
                    this.setData({
                        viewHistroy: curData,
                        ['viewHistroy.data']: viewHistroy.data.concat(curData.data)
                    })
                    // 下拉加载提示
                    this.bindDownLoadTips(curData.current_page, curData.last_page);
                } else {
                    // 默认：重置数据
                    this.setData({
                        viewHistroy: curData
                    })
                }
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 触底加载
    onReachBottom() {
        let curData = '';
        if (this.data.tabType == 1) {
            curData = this.data.todayVisitor;
            if (curData.current_page != curData.last_page) {
                this.getTodayVisitor('add');
            }
        }
        if (this.data.tabType == 2) {
            curData = this.data.todayConsult;
            if (curData.current_page != curData.last_page) {
                this.getTodayConsult('add');
            }
        }
        if (this.data.tabType == 3) {
            curData = this.data.viewHistroy;
            if (curData.current_page != curData.last_page) {
                this.getViewHistroy('add');
            }
        }
    },
    // 触底加载提示
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