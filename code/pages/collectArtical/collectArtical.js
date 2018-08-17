const app = getApp();

Page({
	data: {
		userRole: 'customer',
		pageId: 'index',
		token: '',
		active_tag: '',
		eventid: '',
		project_title: '',
		project_item: '',
		http_tips: false,
		pageCount: 2,
		forbidLoad: false
	},

	onLoad(opt) {

	},

	onShow() {
		const _that = this;

		if (app.globalData.token) {
			// 正常
			_that.setData({
				// userid: app.globalData.userInfo.wx_id,
				userRole: app.globalData.userInfo.role,
				token: app.globalData.token,
			})
			this.loadCollectArtcial();
		} else {
			// 异步
			app.tokenCallback = () => {
				_that.setData({
					// userid: app.globalData.userInfo.wx_id,
					userRole: app.globalData.userInfo.role,
					token: app.globalData.token,
				})
				this.loadCollectArtcial();
			}
		}
	},

	loadCollectArtcial() {
		wx.showLoading({
			title: 'Loading...'
		});
		wx.http({
			url: wx.api.collectArtical,
			method: 'get',
			token: this.data.token,
		})
		.then(res => {
			wx.hideLoading();
			let code = res.status_code;
			if (code == 0) {
				let item_arts = res.data.articles.data;
				if (item_arts.length == 0 ) {
					this.setData({
						http_tips: true
					})
				} 
				this.setData({
					project_item: item_arts
				});				
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
			url: wx.api.collectArtical,
			method: 'get',
			token: this.data.token,
			data: {
				page: this.data.pageCount
			}
		})
		.then(res => {
			let code = res.status_code;
			if (code == 0) {
				wx.hideLoading();
				this.setData({
					pageCount: this.data.pageCount + 1
				})
				if (res.data.articles.current_page > res.data.articles.last_page) {
					this.setData({
						pageCount: 2
					});
					wx.showToast({
						icon: 'none',
						title: '已经加载到底啦~',
						duration: 2000
					});
				} else {
					let item_arts = res.data.articles.data;
					this.setData({
						project_item: this.data.project_item.concat(item_arts),
						forbidLoad: false
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
	},


	delete_artical(e) {

		let tag = e.target.dataset.index;
		let select_id = e.target.dataset.id;
		let oringin_project = this.data.project_item;

		wx.http({
			url: wx.api.collectArtical,
			method: 'post',
			token: this.data.token,
			data: {
				article_id: select_id
			}
		})
		.then(res => {
			let code = res.status_code;
			if (code == 0) {
				//获取下表直接修改原数组
				oringin_project.splice(tag, 1);
				wx.showToast({
					icon: 'none',
					title: res.message,
					duration: 1000
				});
				this.setData({
					project_item: oringin_project
				});	
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