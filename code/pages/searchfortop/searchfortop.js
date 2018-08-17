
const app = getApp();

Page({
	data: {
		userRole: 'customer',
		pageId: 'index',
		keywords: '',
		searchtag: '',
		token: '',
		artical_item: '',
		initial_state: false
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
			console.log('%c 同步：token ' + _that.data.token, 'color:red;');
		} else {
			// 异步
			app.tokenCallback = () => {
				_that.setData({
					// userid: app.globalData.userInfo.wx_id,
					userRole: app.globalData.userInfo.role,
					token: app.globalData.token
				})
				console.log('%c 异步：token ' + _that.data.token, 'color:red;');
			}
		}
	},

	switchNav(e) {
		let tag_name = e.target.dataset.type;
		this.setData({
			artical_item: '',
			searchtag: tag_name
		});
		this.searchKey();
	},

	inputKeys(e) {
		let text = e.detail.value;
		this.setData({
			keywords: text
		});
	},

	searchKey(e) {

		let keyword = this.data.keywords;

		if (keyword.trim() == '')  {
			wx.showToast({
				icon: 'none',
				title: '内容不能为空哦~',
				duration: 1000
			});
			return false;
		}

		this.setData({
			initial_state: true
		})

		wx.showLoading({
			title: '加载中'
		})

		wx.http({
			url: wx.api.searchArticle,
			method: 'get',
			token: this.data.token,
			data: { 
				'key': keyword,
				'tag_name': this.data.searchtag,
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