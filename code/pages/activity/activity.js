const app = getApp();

Page({
	data: {
		userRole: 'customer',
		pageId: 'index',
		active_tag: '',
		articalList: '',
		token: '',
		country: '中国',
		city: '',
		areas: '',
		filterState: false,
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
		})	

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
	init() {
		this.getDesignatedArea();
		this.getAllArea();
	},
	// 获取指定区域城市
	getDesignatedArea(type) {
		wx.showLoading({
			title: 'Loading...'
		});
		wx.http({
			url: wx.api.areas,
			method: 'get',
			token: this.data.token,
			data: {
				country_name: this.data.country
			}
		}).then(res => {
			if (res.status_code == 0) {
				let activeTag;
				let curArea = res.data.areas[0];
				if (type == 'city') {
					activeTag = this.data.active_tag
				} else {
					activeTag = ''
				}
				this.setData({
					country: curArea.country_name,
					city: curArea.cities,
					active_tag: activeTag
				});
				if (type == 'city') {
					this.getAreaArticle('city');
				} else {
					this.getAreaArticle('country');
				}
			}
		}).catch(error => {
			wx.showToast({
				icon: 'none',
				title: error.data.message,
				duration: 1000
			});
		});
	},
	// 获取区域文章
	getAreaArticle(type) {
		let nowData;
		if (type == 'city') {
			nowData = {
				city_id: this.data.active_tag
			}
		} else {
			nowData = {
				country_name: this.data.country
			}
		}
		wx.http({
			url: wx.api.articlesAct,
			method: 'get',
			token: this.data.token,
			data: nowData
		}).then(res => {
			if (res.status_code == 0) {
				let art_item = res.data.activity_articles.data;
				this.setData({
					articalList: art_item,
					filterState: false
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
	// 获取所有区域城市
	getAllArea() {
		wx.http({
			url: wx.api.areas,
			method: 'get',
			token: this.data.token,
			data: {
				country_name: ''
			}
		}).then(res => {
			console.log(res)
			if (res.status_code == 0) {
				this.setData({
					areas: res.data.areas
				});
			}
		}).catch(error => {
			wx.showToast({
				icon: 'none',
				title: error.data.message,
				duration: 1000
			});
		});
	},
	// 切换国家
	switchCountry(e) {
		let country = e.target.dataset.country;
		this.setData({
			country: country,
			active_tag: '',
			scrollTop: 0,
			forbidLoad: false,
			pageCount: 2
		});
		this.getDesignatedArea('country');
	},
	// 切换城市
	switchCity(e) {
		let id = e.currentTarget.dataset.id;
		this.setData({
			active_tag: id,
			scrollTop: 0,
			forbidLoad: false
		});
		this.getDesignatedArea('city');
	},
	// 跳转到webview
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
	// 筛选框状态
	bindFilterState() {
		this.setData({
			filterState: !this.data.filterState
		})
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

	downLoadMore() {

		this.setData({
			forbidLoad: true
		});

		wx.showLoading({
			title: 'Loading...'
		});

		let type = this.data.active_tag;

		let nowData;
		if (type == '') {
			nowData = {
				country_name: this.data.country,
				page: this.data.pageCount
			}
		} else {
			nowData = {
				city_id: this.data.active_tag,
				page: this.data.pageCount
			}
		}
		wx.http({
			url: wx.api.articlesAct,
			method: 'get',
			token: this.data.token,
			data: nowData
		}).then(res => {
			if (res.status_code == 0) {
				wx.hideLoading();
				if (res.data.activity_articles.current_page > res.data.activity_articles.last_page) {
					this.setData({
						pageCount: 2
					});
					wx.showToast({
						icon: 'none',
						title: '已经没有更多活动啦~',
						duration: 2000
					});
				} else {
					let art_item = res.data.activity_articles.data;
					this.setData({
						articalList: this.data.articalList.concat(art_item),
						filterState: false,
						pageCount: this.data.pageCount + 1,
						forbidLoad: false
					});
				}
			}
		}).catch(error => {
			wx.showToast({
				icon: 'none',
				title: error.data.message,
				duration: 1000
			});
		});		
	}

})