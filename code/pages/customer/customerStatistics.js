// 获取应用实例
const app = getApp()

Page({
    data: {
        userid: '', // 用户ID
        userRole: '', // 用户角色
        userToken: '', // 用户TOKEN
        tabType: 1, // 标签类型
        dateStart: '', // 开始日期
        dateEnd: '', // 结束日期
        dateStartLimit: '2000-01-01', // 有效日期范围的开始
        dateEndLimit: '', // 有效日期范围的结束
        todayAnalysis: '', // 今日分析
        topArticle: '', // 文章数据
        topCustomer: '', // 顾客数据
    },
    onLoad(opts) {
        const time = wx.util.formatTime(new Date()).substring(0, 10);
        this.setData({
            dateStart: time,
            dateEnd: time,
            dateEndLimit: time,
        })
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
        this.getTodayAnalysis();
    },
    // 去子页
    toSubpage(e) {
        wx.common.toSubpage(e);
    },
    // 标签切换
    switchArtical(e) {
        var type = e.currentTarget.dataset.type;
        this.setData({
            tabType: type
        });
        if (type == 1) {
            this.getTopArticle();
        }
        if (type == 2) {
            this.getTopCustomer();
        }
    },
    // 获取开始时间
    bindDateStart(e) {
        this.setData({
            dateStart: e.detail.value
        })
    },
    // 获取结束时间
    bindDateEnd(e) {
        this.setData({
            dateEnd: e.detail.value
        })
    },
    // 今日统计
    getTodayAnalysis() {
        if (this.data.tabType == 1) {
            this.getTopArticle();
        }
        if (this.data.tabType == 2) {
            this.getTopCustomer();
        }
        wx.http({
            url: wx.api.consultantAnalysis,
            token: this.data.userToken,
            method: 'GET',
            data:{
                start_date: this.data.dateStart,
                end_date: this.data.dateEnd
            }
        }).then(res => {
            console.log(res.data);
            if (res.status_code == 0) {
                // 更新数据
                this.setData({
                    todayAnalysis: res.data,
                })
                // 加载完成
                wx.hideLoading();
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 文章TOP
    getTopArticle() {
        wx.http({
            url: wx.api.consultantArticlesTtop,
            token: this.data.userToken,
            method: 'GET',
            data:{
                start_date: this.data.dateStart,
                end_date: this.data.dateEnd
            }
        }).then(res => {
            console.log(res.data);
            // 更新数据
            if (res.status_code == 0) {
                this.setData({
                    topArticle: res.data.articles,
                })
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 顾客TOP
    getTopCustomer() {
        wx.http({
            url: wx.api.consultantCustomersTop,
            token: this.data.userToken,
            method: 'GET',
            data:{
                start_date: this.data.dateStart,
                end_date: this.data.dateEnd
            }
        }).then(res => {
            console.log(res.data);
            // 更新数据
            if (res.status_code == 0) {
                this.setData({
                    topCustomer: res.data.customers,
                })
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 打电话
    callPhone(e) {
        const number = e.target.dataset.number;
        wx.makePhoneCall({
            phoneNumber: number,
            successs: (res) => {
                console.log(res);
            }
        })
    },
    // 开始聊天
    startChat(e) {
        const id = e.target.dataset.id;
        const name = e.target.dataset.name;
        wx.navigateTo({
            url: '../message/messageChat?wx_id=' + id + '&user_name=' + name
        })
    },
    // 查看文章
    toWebview(e) {
        let title = e.currentTarget.dataset.title;
        let img = e.currentTarget.dataset.img;
        let id = e.currentTarget.dataset.id;
        let url = e.currentTarget.dataset.url;
        let domian = url.split('?')[0];
        let query = url.split('?')[1];
        let v = query.split('&')[0];
        let mid = query.split('&')[2];

        wx.navigateTo({
            url: '../webview/webview?domian=' + domian + '&' + query + '&title=' + title + '&img=' + img + '&id=' + id + '&' + v + '&=' + mid
        })
    },
})