const app = getApp();

Page({
    data: {
        pageId: 'assess',
        userRole: '', // 用户角色
        userToken: '', // 用户TOKEN
        assessData: '',
        loadingMore: true,
        loadingEnd: true,
        msgTips: false,
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
        this.getAssessArtical();
		this.loadMsgCount();
    },
    // 下拉刷新
    onPullDownRefresh(){
        this.init();
    },
    // 页面跳转
    toPage(e) {
        wx.common.toPage(e);
    },
    // 获取评测列表
    getAssessArtical(type) {
        let assessData = this.data.assessData;
        // 默认参数
        let curParams = {};
        // 判断加载方式
        if (type == 'add') {
            curParams['page'] = assessData.current_page + 1
        }

        wx.http({
            url: wx.api.assessArticle,
            method: 'GET',
            token: this.data.userToken
        }).then(res => {
            console.log(res)
            if (res.status_code == 0) {
                let curData = res.data.assess_articles;
                if (type == 'add') {
                    // 添加：追加数据
                    this.setData({
                        assessData: curData,
                        ['assessData.data']: assessData.data.concat(curData.data)
                    })
                    // 下拉加载提示
                    this.bindDownLoadTips(curData.current_page, curData.last_page);
                } else {
                    // 默认：重置数据
                    this.setData({
                        assessData: curData
                    })
                    // 加载完成
                    wx.hideLoading();
                    wx.stopPullDownRefresh();
                }
            }
        }).catch(error => {
            console.log('请求错误:', error);
        });
    },
    goWebview(e) {
        app.goWebview(e);
    },
    // 分享
    onShareAppMessage(res) {
        return {
            title: '外联在线',
            imageUrl: '../../images/logo.jpg',
            path: '/pages/index/index',
        }
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
    // 触底加载
    onReachBottom() {
        const curData = this.data.assessData;
        if (curData.current_page != curData.last_page) {
            this.getAssessArtical('add');
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