
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
		winHeight: 0,
		scrollTop: 0,
		pageCount: 2,
		forbidLoad: false
	},

	onLoad(opt) {
		const evt_id = opt.event_id;
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
				token: app.globalData.token,
				eventid: evt_id
			})
			this.loadProjectTitle(evt_id);
		} else {
			// 异步
			app.tokenCallback = () => {
				_that.setData({
					// userid: app.globalData.userInfo.wx_id,
					userRole: app.globalData.userInfo.role,
					token: app.globalData.token,
					eventid: evt_id
				})
				this.loadProjectTitle(evt_id);
			}
		}

	},

	//加载标题
	loadProjectTitle(param) {
		wx.showLoading({
			title: 'Loading...'
		});
		wx.http({
			url: wx.api.overseaEveDeatial,
			method: 'get',
			token: this.data.token,
			data: { event_id: param }
		})
		.then(res => {
			wx.hideLoading();
			if (res.status_code == 0) {
				let pro_item = res.data.event_types;
				if (pro_item.length == 0 ) {
					this.loadTitleNone();
				} else {
					this.setData({
						active_tag: pro_item[0].type_id,
						project_title: pro_item
					});
					//设置标题
					this.setTopBarText(pro_item[0].type_name);
					this.loadProjectArtical();
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

	//根据标题id加载文章
	loadProjectArtical() {
		wx.http({
			url: wx.api.overseaProjectArt,
			method: 'get',
			token: this.data.token,
			data: { 
				event_id: this.data.eventid,
				type_id: this.data.active_tag
			}
		})
		.then(res => {
			let code = res.status_code;
			if (code == 0) {
				let item_arts = res.data.type_articles.data;
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

	switchNav(e) {
		let type_id = e.currentTarget.dataset.id;
		this.setData({
			active_tag: type_id,
			scrollTop: 0,
			forbidLoad: false,
			pageCount: 2
		});	
		this.loadProjectArtical();
	},

	loadTitleNone() {
		wx.showToast({
			icon: 'none',
			title: '暂无数据,敬请期待哦~',
			duration: 2000
		});
		return false;
	},

	setTopBarText(text) {
		wx.setNavigationBarTitle({
			title: text
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

		wx.http({
			url: wx.api.overseaProjectArt,
			method: 'get',
			token: this.data.token,
			data: {
				event_id: this.data.eventid,
				type_id: this.data.active_tag,
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
				if (res.data.type_articles.current_page > res.data.type_articles.last_page) {
					this.setData({
						pageCount: 2
					});
					wx.showToast({
						icon: 'none',
						title: '已经没有资讯啦~',
						duration: 2000
					});
				} else {
					let item_arts = res.data.type_articles.data;
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


	collect_artical(e) {

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