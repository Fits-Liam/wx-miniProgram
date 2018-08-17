const app = getApp();
let ListTimeInterval;

Page({
	data: {
		userRole: '',
		pageId: 'message',
		token: '',
		userid:'',
		msgOrConsult: true,
		chatData: '',
		chatList: [],
        loadingMore: true,
        loadingEnd: true,
		msgEmpty: false
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
                token: app.globalData.token
            })
            _that.init();
        } else {
            // 异步
            app.tokenCallback = () => {
                _that.setData({
                    userid: app.globalData.userInfo.wx_id,
                    userRole: app.globalData.userInfo.role,
                    token: app.globalData.token
                })
                _that.init();
            }
        }
    },
	init(){
		this.loadChatList();
		this.loadMsgCount();
		// this.timePickonMsg();
	},
    // 下拉刷新
    onPullDownRefresh(){
        this.init();
    },
	// 获取对话列表
	loadChatList() {
		wx.http({
			url: wx.api.messageList,
			method: 'GET',
			token: this.data.token,
		}).then(res => {
			let code = res.status_code;
			wx.hideLoading();
			if (code == 0) {
				//无消息显示状态
				if( res.data.data.length == 0 ) {
					this.setData({
						msgEmpty: true
					});
					return false;
				}
				this.setData({
					chatData: res.data,
					chatList: res.data.data
				});
                if ( res.data.current_page == res.data.last_page) {
                    this.setData({
                        loadingEnd: false
                    })
                }
			} else {
				if (this.data.userRole == 'customer') {
					this.loadMyConsults();
					return false;
				} 
			}
            wx.stopPullDownRefresh();
		}).catch(error => {
			wx.showToast({
				icon: 'none',
				title: error.data.message,
				duration: 1000
			});
		});
	},
    // 更新对话列表
    getChatListUpdate() {
        console.log( this.data.chatData )
        let chatList = this.data.chatList;
		wx.http({
			url: wx.api.messageList,
			method: 'GET',
			token: this.data.token,
			// token: 'Bearer 1234567890',
            data: {
                page: this.data.chatData.current_page+1,
            }
        }).then(res => {
            console.log(res)
			this.setData({
				chatData: res.data,
				chatList: chatList.concat(res.data.data)
			});
        }).catch(error => {
            console.log('请求错误:', error);
        })
    },
    // 获取我的顾问
	loadMyConsults() {
		this.setData({
			msgOrConsult: false
		});
		wx.http({
			url: wx.api.customerMyConsults,
			method: 'GET',
			token: this.data.token
		})
		.then(res => {
			let code = res.status_code;
			if (code == 0) {
				this.setData({
					chatList: res.data.consults.data
				});
				wx.hideLoading();
			}
		})
		.catch(error => {
			wx.showToast({
				icon: 'none',
				title: error.data.message,
				duration: 1000
			});
		});
	},
	// 进入聊天
	chat_with(e) {
		if (this.data.msgOrConsult) {
			let id = e.currentTarget.dataset.wxid;
			let name = e.currentTarget.dataset.name;
			wx.navigateTo({
				url: 'messageChat?wx_id=' + id + '&user_name=' + name
			})
		}
	},
	goWebview(e) {
		app.goWebview(e);
	},
    // 触底加载
    onReachBottom() {
        const curData = this.data.chatData;
        if (curData.current_page != curData.last_page) {
            this.getChatListUpdate();
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
    },
	// 分享
	onShareAppMessage(res) {
		return {
			title: '外联在线',
			imageUrl: '../../images/logo.jpg',
			path: '/pages/index/index',
		}
	},
	// //页面隐藏
	// onHide: function () {
	// 	clearInterval(ListTimeInterval);
	// },
	// // 页面卸载
	// onUnload: function () {
	// 	clearInterval(ListTimeInterval);
	// },
	// // 定时加载
	// timePickonMsg() {
	// 	var that = this;
	// 	ListTimeInterval = setInterval(function () {
	// 		// wx.vibrateLong();
	// 		that.loadChatList();
	// 	}, 10000);
	// },
	//获得消息未读总数
	loadMsgCount() {
		wx.http({
			url: wx.api.unReadMessage,
			method: 'get',
			token: this.data.token,
		})
		.then(res => {
			let code = res.status_code;
			if (code == 0) {
				if (res.data.unread_count > 0) {
					this.setData({
						msgTips: true
					});
				} else {
					this.setData({
						msgTips: false
					});
				}
			}
		})
		.catch(error => {
			console.log(error);
		});
	}
})