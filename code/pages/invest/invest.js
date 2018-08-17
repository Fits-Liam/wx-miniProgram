const app = getApp();

Page({

	data: {
		userRole: 'customer',
		pageId: 'index',
		active_tag: '',
		articalList: '',
		userToken: '',
		forbidLoad: false,
		scroll_top: 0,
		invest_item: '',
		current_page: 0,
		last_page: 0
	},

	onLoad(opt) {
		this.setData({
			active_tag: opt.area_id
		});
	},

	onShow() {
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
		this.getAllArea();
	},

	// 获得区域
	getAllArea() {
		wx.showLoading({
			title: 'Loading...'
		});
		wx.http({
			url: wx.api.tag_sub,
			method: 'get',
			data: { top_level_name: '投资置业' }
		})
		.then(res => {
			wx.hideLoading();
			let code = res.status_code;
			if (code == 0) {
				let copy_item = res.data.tags;
				for (let item of copy_item) {
					if (item.tag_name.indexOf('亚洲') > -1) {
						item.img_url = 'http://static.leapoon.com/web_front/TouZiZhiYe/Asia.png';
						item.tag_name = '亚洲';
					} else if (item.tag_name.indexOf('北美') > -1) {
						item.img_url = 'http://static.leapoon.com/web_front/TouZiZhiYe/NorthAmerica.png';
						item.tag_name = '北美';
					} else if (item.tag_name.indexOf('欧洲') > -1) {
						item.img_url = 'http://static.leapoon.com/web_front/TouZiZhiYe/Europe.png';
						item.tag_name = '欧洲';
					} else {
						item.img_url = 'http://static.leapoon.com/web_front/TouZiZhiYe/Oceania.png';
						item.tag_name = '大洋洲';
					}
				}

				this.setData({
					invest_item: copy_item,
					active_tag: this.data.active_tag || copy_item[0].id
				});
				this.getAreaArticle(this.data.active_tag);
			}
		})
		.catch(error => {
			console.log(error);
		});
	},

	// 获取区域文章
	getAreaArticle(tag) {

		wx.showLoading({
			title: 'Loading...'
		});
		wx.http({
			url: wx.api.articalsubs,
			method: 'get',
			token: this.data.userToken,
			data: { tag_id: tag }
		})
		.then(res => {
			if (res.status_code == 0) {
				let art_item = res.data.tag_articles.data;
				this.setData({
					articalList: art_item,
					current_page: res.data.tag_articles.current_page,
					last_page: res.data.tag_articles.last_page
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

	switchCity(e) {
		let id = e.currentTarget.dataset.id;
		this.setData({
			articalList: '',
			active_tag: id,
			forbidLoad: false,
		}); 

		this.getAreaArticle(this.data.active_tag);
	},

	collect_artical(e) {

		let tag = e.target.dataset.index;
		let select_id = e.target.dataset.id;
		let oringin_project = this.data.articalList;

		wx.http({
			url: wx.api.collectArtical,
			method: 'post',
			token: this.data.userToken,
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
					articalList: oringin_project
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

	onReachBottom() {

		let cur_page = this.data.current_page;
		let last_page = this.data.last_page;

		if ( !this.data.forbidLoad && cur_page == last_page) {
			wx.showToast({
				icon: 'none',
				title: '加载到底啦'
			});

			this.setData({
				forbidLoad: true
			});
			return false;
		} 

		if (!this.data.forbidLoad && cur_page != last_page ) {
			wx.showLoading({
				title: 'Loading...'
			});
			wx.http({
				url: wx.api.articalsubs,
				method: 'get',
				token: this.data.userToken,
				data: { 
					tag_id: this.data.active_tag,
					page: this.data.current_page++
				}
			})
			.then(res => {
				if (res.status_code == 0) {
					let art_item = res.data.tag_articles.data;
					this.setData({
						articalList: this.data.articalList.concat(art_item),
						current_page: res.data.tag_articles.current_page,
						last_page: res.data.tag_articles.last_page
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
		}

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
	}

})