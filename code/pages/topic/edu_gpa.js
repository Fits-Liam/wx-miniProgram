const app = getApp();

Page({
	data: {
		userid: '',                         // 用户ID
		userRole: '',                     // 用户角色
		userToken: '',                  // 用户TOKEN
		tabType: 1,                      // 标签类型
		artical_info: '',
		winHeight: 0,
		scrollTop: 0,
		pageCount: 2,
		forbidLoad: false
	},
	onLoad() {
		const _that = this;
		wx.getSystemInfo({
			success: (res) => {
				_that.setData({
					winHeight: res.windowHeight
				});
			}
		});
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
	init() {

	},
	// 去子页
	toPage(e) {
		wx.common.toPage(e);
	},
	// 标签切换
	switchArtical(e) {
		const type = e.currentTarget.dataset.type;
		if (type == this.data.tabType) {
			return false
		};
		this.setData({
			tabType: type,
			forbidLoad: false,
			scrollTop: 0,
		});
		if (type == 2) {
			this.loadArticalInfo();
		}
	},
	// 获取资讯文章
	loadArticalInfo() {

		wx.http({
			url: wx.api.edu_child_type,
			method: 'get',
			token: this.data.token,
			data: { edu_type_code: 2 }
		}).then(res => {
			let code = res.status_code;
			if (code == 0) {
				let info_articles = res.data.type_articles.data;
				this.setData({
					artical_info: info_articles
				});
				wx.hideLoading();
			}
		}).catch(error => {
			wx.showToast({
				icon: 'none',
				title: error.data.message,
				duration: 1000
			});
		});
	},

	bindDownLoad: function (e) {
		let _that = this;
		let forbid = this.data.forbidLoad;

		if (forbid) {
			return false;
		}

		setTimeout(function () {
			_that.downLoadMore();
		}, 500);
	},

	scroll: function (evt) {
		this.setData({
			scrollTop: evt.detail.scrollTop
		});
	},

	downLoadMore() {
		wx.http({
			url: wx.api.edu_child_type,
			method: 'get',
			token: this.data.token,
			data: { edu_type_code: 2, page: this.data.pageCount }
		})
		.then(res => {
			let code = res.status_code;
			if (code == 0) {
				if (res.data.type_articles.current_page >= res.data.type_articles.last_page) {
					this.setData({
						forbidLoad: true,
						pageCount: 1
					});
					wx.showToast({
						icon: 'none',
						title: '已经没有资讯啦~',
						duration: 2000
					});
					return false;
				}
				this.setData({
					pageCount: [pageCount] + 1
				})
				let info_articles = res.data.type_articles.data;
				this.setData({
					artical_info: [artical_info].concat(info_articles),
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

	collect_artical(e) {

		let tag = e.target.dataset.index;
		let select_id = e.target.dataset.id;
		let oringin_project = this.data.artical_info;

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
				if (oringin_project[tag].favorite_id == null) {
					oringin_project[tag].favorite_id = 1;
				} else {
					oringin_project[tag].favorite_id = null;
				}
				wx.showToast({
					icon: 'none',
					title: res.message,
					duration: 1000
				});
				this.setData({
					artical_info: oringin_project
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