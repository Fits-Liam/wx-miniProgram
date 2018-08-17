const app = getApp();

Page({
	data: {
		userRole: 'customer',
		pageId: 'index',
		token: '',
		active_tag: '',
		country: '',
		project_list: '',
		subs_project: '',
		tips: '',
		filterState: false,
	},
	onLoad(opt) {
		const _that = this;
		if (app.globalData.token) {
			// 正常
			_that.setData({
				// userid: app.globalData.userInfo.wx_id,
				userRole: app.globalData.userInfo.role,
				token: app.globalData.token
			})
			_that.init(opt);
		} else {
			// 异步
			app.tokenCallback = () => {
				_that.setData({
					// userid: app.globalData.userInfo.wx_id,
					userRole: app.globalData.userInfo.role,
					token: app.globalData.token
				})
				_that.init(opt);
			}
		}
	},
	init(opt){
		this.loaddefaultCry(opt);
	},
	loaddefaultCry(opt) {
		let _that = this;
		wx.http({
			url: wx.api.overseaInfo,
			method: 'get'
		}).then(res => {
			let code = res.status_code;
			let cry_list = res.data.countries;
			if (code == 0) {
				//首页点击某一国家url接收参数
				let url_param = opt.country_id;
				if (!url_param) {
					_that.setData({
						country: cry_list,
						active_tag: cry_list[0].id
					});
				} else {
					_that.setData({
						country: cry_list,
						active_tag: url_param
					});
				}
				_that.loadCountryInfo();
			}
		}).catch(error => {
			_that.setData({
				tips: error.data.message
			});
		});
	},
	loadCountryInfo(e) {
		let type;
		if (!e) {
			type = this.data.active_tag;
		} else {
			type = e.currentTarget.dataset.id;
		}

		this.setData({
			active_tag: type,
			filterState: false,
		});

		wx.showLoading({
			title: 'Loading...'
		});

		wx.http({
			url: wx.api.overseaEvents,
			method: 'get',
			token: this.data.token,
			data: {
				country_id: type
			}
		}).then(res => {
			wx.hideLoading();
			let code = res.status_code;
			let sus_artical = res.data.assess_articles;
			if (code == 0) {
				if (sus_artical) {
					this.setData({
						subs_project: sus_artical
					});
				}
				this.setData({
					project_list: res.data.events
				});
			}
		}).catch(error => {
			wx.hideLoading();
			this.setData({
				tips: error.data.message
			})
		});
	},
	skipProject(e) {
		let id = e.currentTarget.dataset.eventid;
		wx.navigateTo({
			url: '../oversea/overseaProject?event_id=' + id
		})
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
	// 筛选框状态
	bindFilterState(){
		this.setData({
			filterState: !this.data.filterState
		})
	},
})