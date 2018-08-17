const app = getApp();

Page({
	data: {

		userRole: '',
		pageId: 'index',
		articalType: 1,
		token: '',
		banner_url: '',
		banner_tips: 'Loading...',
		oversea_url: '',
		oversea_tips: 'Loading...',
		artical_act: '',
		artical_act_tips: 'Loading...',
		artical_info: '',
		artical_tips: 'Loading...',
		msgTips: false,
		invest_item: [],

		//banner滑动配置
		indicatorDots: true,
		autoplay: true,
		interval: 5000,
		duration: 1000
	},

	onLoad() {
        
	},

	onShow() {
		const _that = this;
		if (app.globalData.token) {
			// 正常
			_that.setData({
				// userid: app.globalData.userInfo.wx_id,
				userRole: app.globalData.userInfo.role,
				token: app.globalData.token
			})
			
			_that.init();
			console.log('%c 同步：token ' + _that.data.token, 'color:red;');
		} else {
			// 异步
			app.tokenCallback = () => {
				_that.setData({
					// userid: app.globalData.userInfo.wx_id,
					userRole: app.globalData.userInfo.role,
					token: app.globalData.token
				})
				_that.init();

				console.log('%c 异步：token ' + _that.data.token, 'color:red;');
			}
		}
	},
	init() {
		this.loadBannerInfo();
		this.loadOverseaInfo();
		this.loadArticalAct();
		this.loadArticalInfo();
		this.loadInvestInfo();
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
	//获取banner信息
	loadBannerInfo() {
		let _that = this;
		wx.http({
			url: wx.api.banneInfo,
			method: 'get',
			token: _that.data.token
		})
		.then(res => {
			let code = res.status_code;
			if ( code == 0 ) {
				_that.setData({
					banner_url: res.data.banner_articles
				});
				wx.stopPullDownRefresh();
			}
		})
		.catch(error => {
			_that.setData({
				banner_tips: error.data.message
			});
		});
	},

	//获取海外移民信息
	loadOverseaInfo() {
		let _that = this;
		wx.http({
			url: wx.api.overseaInfo,
			method: 'get',
			data: { is_hot: 1 }
		})
		.then(res => {
			let code = res.status_code;
			let cry_list = res.data.countries;
			if (code == 0) {
				_that.setData({
					oversea_url: cry_list
				});
			}
			app.globalData.oversea_cry = cry_list; 
		})
		.catch(error => {
			_that.setData({
				oversea_tips: error.data.message
			});
		});
	},

	//获取最新活动文章
	loadArticalAct() {
		let _that = this;
		wx.http({
			url: wx.api.articlesAct,
			method: 'get',
			token: _that.data.token
		})
		.then(res => {
			let code = res.status_code;
			if (code == 0) {
				_that.setData({
					artical_act: res.data.activity_articles
				});
			}
		})
		.catch(error => {
			_that.setData({
				artical_act_tips: error.data.message
			});
		});
	},

	//获取资讯文章
	loadArticalInfo(tag = { is_newest: 1 }) {

		// const hot_tag = { is_hot: 1 };
		// const new_tag = { is_newest: 1 };
		let _that = this;
		wx.http({
			url: wx.api.information,
			method: 'get',
			token: _that.data.token,
			data: tag
		})
		.then(res => {
			let code = res.status_code;
			if (code == 0) {
				let info_articles = res.data.information_articles;
				if( info_articles.length == 0 ) {
					_that.setData({
						artical_tips: '暂无敬请期待哦~'
					});
				}
				_that.setData({
					artical_info: res.data.information_articles
				});
			}
		})
		.catch(error => {
			_that.setData({
				artical_tips: error.data.message
			});
		});
	},

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
				if (res.data.unread_count > 0 ) {
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

	//获取投资移民资讯
	loadInvestInfo() {
		wx.http({
			url: wx.api.tag_sub,
			method: 'get',
			token: this.data.token,
			data: { top_level_name: '投资置业' }
		})
		.then(res => {
			let code = res.status_code;
			if (code == 0) {
				
				let copy_item = res.data.tags;
				for (let item of copy_item) {
					if(item.tag_name.indexOf('亚洲') > -1) {
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
					invest_item: copy_item
				});
			}
		})
		.catch(error => {
			console.log(error);
		});
	},

	switchArtical(e) {
		var type = e.currentTarget.dataset.type;

		this.setData({
			articalType: type
		});

		if( type == 2 ) {
			this.loadArticalInfo({ is_hot: 1 });
		} else {
			this.loadArticalInfo();
		}
	},

	skipToChild(e) {
		let country = e.currentTarget.dataset.id;

		wx.navigateTo({
			url: '../oversea/oversea?country_id=' + country
		})
	},

	linkToInvest(e) {
		let id = e.currentTarget.dataset.id;

		wx.navigateTo({
			url: '../invest/invest?area_id=' + id
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

	// 去子页
	toPage(e) {
		wx.common.toPage(e);
	},

})