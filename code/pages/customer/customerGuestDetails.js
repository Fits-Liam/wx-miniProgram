// 获取应用实例
const app = getApp()

Page({
    data: {
        userid: '', // 用户ID
        userRole: '', // 用户角色
        userToken: '', // 用户TOKEN
        queryId: '', // URL参数：ID
        customerInfo: '', // 客户详情
        customerAssess: '', // 客户评估数
        customerView: '', // 客户阅读数
        customerSubmitList: '', // 客户提交列表
        customerAssessList: false, // 客户评估列表
        customerArticleList: false, // 客户阅读列表
    },
    onLoad(opts) {
        if (opts.id) {
            this.setData({
                queryId: opts.id
            });
        }
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
        this.getCustomersData();
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
    // 去子页
    toSubpage(e) {
        wx.common.toSubpage(e);
    },
    // 获取客户详情
    getCustomersData() {
        wx.http({
            url: wx.api.consultantDetail,
            token: this.data.userToken,
            method: 'GET',
            data:{
                customer_wx_id: this.data.queryId
            }
        }).then(res => {
            console.log(res);
            if (res.status_code == 0) {
                // 更新数据
                this.setData({
                    customerInfo: res.data.customer_info,
                    customerAssess: res.data.assess_articles,
                    customerView: res.data.view_articles
                })
                // 加载完成
                wx.hideLoading();
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 提交列表
    getSubmitList() {
        if (this.data.customerSubmitList) {
            this.setData({
                customerSubmitList: '',
            })
        } else {
            // 加载提示
            wx.showLoading({
                title: 'Loading...'
            });

            wx.http({
                url: wx.api.consultantSearchRecord,
                token: this.data.userToken,
                method: 'GET',
                data:{
                    customer_wx_id: this.data.queryId
                }
            }).then(res => {
                if (res.status_code == 0) {
					// 加载完成
					wx.hideLoading();	
					if (res.message == '没有提交信息') {
						wx.showToast({
							icon: 'none',
							title: res.message
						})
						return false;
					}
					let arr = res.data.data;
                    arr = arr.map((item) => {
                        return {
                            ...item,
                            mobile: item.mobile.replace(/^(\d{3})\d{4}(\d{4})$/,'$1****$2')
                        }
                    });
                    // 更新数据
                    this.setData({
                        customerSubmitList: arr,
                    })
                   
                }
            }).catch(error => {
                console.log('请求错误：', error);
            })
        }
    },
    // 评估列表
    getAssessList() {
        if (this.data.customerAssessList) {
            this.setData({
                customerAssessList: false
            })
        } else {
            this.setData({
                customerAssessList: !this.data.customerAssessList
            })
        }
    },
    // 阅读列表
    getArticleList() {
        if (this.data.customerArticleList) {
            this.setData({
                customerArticleList: false
            })
        } else {
            this.setData({
                customerArticleList: !this.data.customerArticleList
            })
        }
    },
})