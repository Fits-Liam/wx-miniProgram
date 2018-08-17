
const app = getApp();

Page({
	data: {
		userRole: '',
		pageId: 'index',
		searchtag: '',
		token: '',
		artical_item: '',
		none_state: false,
		winHeight: 0,
		scrollTop: 0,
		pageCount: 2,
		forbidLoad: false
	},

	onLoad(opt) {

	},

	onShow() {
		let _that = this;
		if (app.globalData.token) {
			// 正常
			_that.setData({
				// userid: app.globalData.userInfo.wx_id,
				userRole: app.globalData.userInfo.role,
				token: app.globalData.token
			})
			console.log('%c 同步：token ' + _that.data.token, 'color:red;');
			_that.loadBrowingHistory();
		} else {
			// 异步
			app.tokenCallback = () => {
				_that.setData({
					// userid: app.globalData.userInfo.wx_id,
					userRole: app.globalData.userInfo.role,
					token: app.globalData.token
				})
				console.log('%c 异步：token ' + _that.data.token, 'color:red;');
				_that.loadBrowingHistory();
			}
		}
	},
	
	loadBrowingHistory() {
		wx.showLoading({
			title: '加载中'
		});
		wx.http({
			url: wx.api.browsing_history,
			method: 'get',
			token: this.data.token,
			data: { 
				'type': this.data.searchtag,
			}
		})
		.then(res => {
			wx.hideLoading()
			let code = res.status_code;
			if (code == 0) {
				let articles = res.data.articles.data;
				this.setData({
					artical_item: articles
				});
			}
		})
		.catch(error => {
			console.log(error);
		});
	},

	switchNav(e) {
		let tag_name = e.target.dataset.type;
		this.setData({
			searchtag: tag_name,
			scrollTop: 0,
			forbidLoad: false,
			pageCount: 2,
			artical_item: ''
		});
		this.loadBrowingHistory();
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

	onReachBottom: function (e) {
		let _that = this;
		let forbid = this.data.forbidLoad;

		if (forbid) {
			return false;
		}

		setTimeout(function () {
			_that.downLoadMore();
		}, 500);
	},

	downLoadMore() {

		this.setData({
			forbidLoad: true
		});

		wx.showLoading({
			title: 'Loading...'
		});

		wx.http({
			url: wx.api.browsing_history,
			method: 'get',
			token: this.data.token,
			data: {
				'type': this.data.searchtag,
				'page': this.data.pageCount
			}
		})
		.then(res => {
			let code = res.status_code;
			if (code == 0) {
				wx.hideLoading();		
				if (res.data.articles.current_page > res.data.articles.last_page) {
					this.setData({
						pageCount: 2
					});
					wx.showToast({
						icon: 'none',
						title: '已经没有更多记录啦~',
						duration: 2000
					});
				} else {
					let item_arts = res.data.articles.data;
					this.setData({
						artical_item: this.data.artical_item.concat(item_arts),
						pageCount: this.data.pageCount + 1,
						forbidLoad: false,
					});
				}
			}
		})
		.catch(error => {
			wx.showToast({
				icon: 'none',
				title: error.data.message,
				duration: 1000
			});
		});
	}

})