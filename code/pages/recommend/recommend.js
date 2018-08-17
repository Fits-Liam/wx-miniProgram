const app = getApp();

Page({
    data: {
        userRole: '', // 用户角色
        userToken: '', // 用户TOKEN
        customersData: '', // 客户数据
        newCustomersData: [], // 推荐客户的数组
        introConsultant: '',
        selectAll: false,
        isAssess: false,
        isPartner: false,
        articleDetail: '',
        queryId: '',
        inputVal: '',
        filterDataset: {}, // 筛选条件数据集
        loadingMore: true,
        loadingEnd: true,
    },
    onLoad(opts) {
        console.log(opts)
        if ( opts.type == 'assess' ) {
            this.setData({
                isAssess: true
            });
        }
        if ( opts.type == 'partner' ) {
            this.setData({
                isPartner: true
            });
        }
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
        if ( this.data.isPartner ) {
            // 合作伙伴身份
            this.getPartnerConsultant();
        }else{
            // 非合作伙伴身份
            this.getArticleDetail();
            this.getMyCustomers();
        }
    },
    // 页面跳转
    toPage(e) {
        wx.common.toPage(e);
    },
    // 去Webview
    goWebview(e) {
        app.goWebview(e);
    },
    // 监听输入框
    inputTyping(e) {
        this.setData({
            inputVal: e.detail.value,
        });
    },
    // 搜索用户
    bindSearch() {
        this.getMyCustomers();
    },
    // 获取文章详情
    getArticleDetail() {
        wx.http({
            url: wx.api.articleSearch,
            token: this.data.userToken,
            method: 'GET',
            data: {
                id: this.data.queryId
            }
        }).then(res => {
            if (res.status_code == 0) {
                // 更新数据
                this.setData({
                    articleDetail: res.data.article,
                })
                // 加载完成
                wx.hideLoading();
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 获取客户列表
    getMyCustomers(type) {
        let customersData = this.data.customersData;
        // 默认参数
        let curParams = {};
        // 判断加载方式
        if (type == 'add') {
            curParams['page'] = customersData.current_page + 1
        }
        // 判断是否有值
        if (this.data.inputVal) {
            curParams['name'] = this.data.inputVal
        }
        
        wx.http({
            url: wx.api.consultantMyCustomers,
            token: this.data.userToken,
            method: 'GET',
            data: curParams
        }).then(res => {
            if (res.status_code == 0) {
                let curData = res.data.customers;
                if (type == 'add') {
                    // 添加：追加数据
                    this.setData({
                        customersData: curData,
                        ['customersData.data']: customersData.data.concat(curData.data)
                    })
                    // 下拉加载提示
                    this.bindDownLoadTips(curData.current_page, curData.last_page);
                } else {
                    // 默认：重置数据
                    this.setData({
                        customersData: curData
                    })
                    // 加载完成
                    wx.hideLoading();
                }
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 多选
    bindMultipleChoice(e) {
        let newCustomersData = [];
        let index = e.currentTarget.dataset.index;
        let customersData = this.data.customersData.data;
        customersData[index].checked = !customersData[index].checked;
        // 插入新数据
        for (let i = 0; i < customersData.length; i++) {
            if (customersData[i].checked) {
                newCustomersData.push(customersData[i].wx_id)
            }
        };
        // 更新数据
        this.setData({
            ['customersData.data']: customersData,
            newCustomersData: newCustomersData
        })
    },
    // 全选
    bindSelectAll() {
        let newCustomersData = [];
        let customersData = this.data.customersData.data;
        this.setData({
            selectAll: !this.data.selectAll
        })
        if (this.data.selectAll) {
            for (let i = 0; i < customersData.length; i++) {
                if (customersData[i].checked == true) {
                    newCustomersData.push(customersData[i].wx_id);
                } else {
                    customersData[i].checked = true;
                    newCustomersData.push(customersData[i].wx_id);
                }
            }
        } else {
            for (let i = 0; i < customersData.length; i++) {
                customersData[i].checked = false;
                newCustomersData == [];
            }
        }
        // 更新数据
        this.setData({
            ['customersData.data']: customersData,
            newCustomersData: newCustomersData
        })
    },
    // 推荐文章给客户
    bindRecommend() {
        if ( this.data.newCustomersData != '' ) {
            wx.http({
                url: wx.api.consultantRecommend,
                token: this.data.userToken,
                content: 'application/json',
                method: 'POST',
                data: {
                    customer_ids: this.data.newCustomersData,
                    article_id: this.data.queryId
                }
            }).then(res => {
                if (res.status_code == 0) {
                    let customersData = this.data.customersData.data;
                    let newCustomersData = [];
                    for (let i = 0; i < customersData.length; i++) {
                        customersData[i].checked = false;
                        newCustomersData == [];
                    }
                    this.setData({
                        ['customersData.data']: customersData,
                        newCustomersData: newCustomersData
                    })

                    wx.showToast({
                        title: res.message,
                        icon: 'none',
                        duration: 1500
                    })
                } else {
                    wx.showToast({
                        title: res.message,
                        icon: 'none',
                        duration: 1500
                    })
                }
            }).catch(error => {
                console.log('请求错误：', error);
            })
        }else{
            wx.showToast({
                title: '请先选择客户',
                icon: 'none',
                duration: 1500
            })
        }
    },
    // 推荐客户获取合作伙伴所在渠道绑定的顾问
    getPartnerConsultant() {
        wx.http({
            url: wx.api.partnerConsultant,
            token: this.data.userToken,
            method: 'GET'
        }).then(res => {
            if (res.status_code == 0) {
                this.setData({
                    customersData: res.data.channel_consults
                })
                // 加载完成
                wx.hideLoading();
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 推荐客户单选
    bindSingleChoice(e){
        this.setData({
            introConsultant: e.detail.value
        })
    },
    // 推荐客户给顾问
    bindIntroCustomer() {
        if ( this.data.introConsultant ) {
            wx.http({
                url: wx.api.partnerIntroCustomer,
                token: this.data.userToken,
                content: 'application/json',
                method: 'POST',
                data: {
                    consult_wx_id: this.data.introConsultant,
                    customer_wx_id: this.data.queryId
                }
            }).then(res => {
                console.log(res)
                if (res.status_code == 0) {
                    let customersData = this.data.customersData;
                    let newCustomersData = [];
                    for (let i = 0; i < customersData.length; i++) {
                        customersData[i].checked = false;
                        newCustomersData == [];
                    }
                    this.setData({
                        ['customersData']: customersData,
                        newCustomersData: newCustomersData
                    })
                }  
				wx.showToast({
					title: res.message,
					icon: 'none',
					duration: 1500,
					success: function() {
						setTimeout(function(){
							wx.navigateBack({
								delta: 1
							})
						},1000);
					}
				});
            }).catch(error => {
                console.log('请求错误：', error);
            })
        }else{
            wx.showToast({
                title: '请先选择顾问',
                icon: 'none',
                duration: 1500
            })
        }
    },
    // 触底加载
    onReachBottom() {
        if (this.data.isPartner) {
            return false
        } else {
            const curData = this.data.customersData;
            if (curData.current_page != curData.last_page) {
                this.getMyCustomers('add');
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