const app = getApp();

Page({
	data: {
		userRole: 'customer',
		token: '',
		pageId: 'index',
		// active_tag: '',
		// articalList: '',
		// art_tag: '',
		// filterState: false,
		tabType: 1,
		artical_info: '',
	},
	onLoad() {
		const _that = this;
		if (app.globalData.token) {
			// 正常
			_that.setData({
				// userid: app.globalData.userInfo.wx_id,
				userRole: app.globalData.userInfo.role,
				token: app.globalData.token
			})
			_that.init();
		} else {
			// 异步
			app.tokenCallback = () => {
				_that.setData({
					// userid: app.globalData.userInfo.wx_id,
					userRole: app.globalData.userInfo.role,
					token: app.globalData.token
				})
				_that.init();
			}
		}
	},
	init(){
		this.loadArticalInfo();
	},
    // 标签切换
    switchArtical(e) {
        const type = e.currentTarget.dataset.type;
        if ( type == this.data.tabType ){
            return false
        };
        this.setData({
            tabType: type
        });
        if( type == 1 ) {
        	this.loadArticalInfo();
        }
        if( type == 2 ) {
			this.loadArticalInfo({
				is_newest: 1,
				parent_tag: '教育'
			});
        }
    },
    // 获取资讯文章
	loadArticalInfo(tag = { is_hot: 1, parent_tag: '教育'}) {
		wx.showLoading({
			title: 'Loading...'
		});

		wx.http({
			url: wx.api.parent_tag,
			method: 'get',
			token: this.data.token,
			data: tag
		})
		.then(res => {
			let code = res.status_code;
			if (code == 0) {
				let info_articles = res.data.parent_tag_articles.data;
				this.setData({
					artical_info: res.data.parent_tag_articles.data,
					// filterState: false
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
	goWebview(e) {
		app.goWebview(e);
	},
    // 页面跳转
    toPage(e) {
        wx.common.toPage(e);
    },
	// 分享
	onShareAppMessage(res) {
		return {
			title: '外联在线',
			imageUrl: '../../images/logo.jpg',
			path: '/pages/index/index',
		}
	},
	// loadArticalTag() {
	// 	let _that = this;
	// 	wx.showLoading({
	// 		title: 'Loading...'
	// 	});

	// 	wx.http({
	// 		url: wx.api.tag_sub,
	// 		method: 'get',
	// 		token: _that.data.token,
	// 		data: { top_level_name: '教育' }
	// 	})
	// 	.then(res => {
	// 		let code = res.status_code;
	// 		if (code == 0) {
	// 			wx.hideLoading();
	// 			let tag_item = res.data.tags;
	// 			_that.setData({
	// 				art_tag: tag_item,
	// 				active_tag: tag_item[0].id
	// 			});
	// 			_that.loadTagArtical();
	// 		}
	// 	})
	// 	.catch(error => {
	// 		wx.showToast({
	// 			icon: 'none',
	// 			title: error.data.message,
	// 			duration: 1000
	// 		});
	// 	});
	// },
	// loadTagArtical() {
	// 	let _that = this;

	// 	wx.http({
	// 		url: wx.api.articalsubs,
	// 		method: 'get',
	// 		token: _that.data.token,
	// 		data: { tag_id: _that.data.active_tag }
	// 	})
	// 	.then(res => {
	// 		let code = res.status_code;
	// 		if (code == 0) {
	// 			let art_list = res.data.tag_articles.data;
	// 			_that.setData({
	// 				articalList: art_list
	// 			});
	// 		}
	// 	})
	// 	.catch(error => {
	// 		wx.showToast({
	// 			icon: 'none',
	// 			title: error.data.message,
	// 			duration: 1000
	// 		});
	// 	});
	// },
})