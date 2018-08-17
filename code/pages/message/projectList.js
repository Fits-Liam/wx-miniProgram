// 获取应用实例
const app = getApp()

Page({
	data: {
		userRole: '', // 用户角色
		userToken: '', // 用户TOKEN
		intentionList: []
	},
	onLoad(opt) {
		const _that = this;
		if (app.globalData.token) {
			// 正常
			_that.setData({
				userid: app.globalData.userInfo.wx_id,
				userRole: app.globalData.userInfo.role,
				userToken: app.globalData.token
			})
			_that.loadIntentionsList();
		} else {
			// 异步
			app.tokenCallback = () => {
				_that.setData({
					userid: app.globalData.userInfo.wx_id,
					userRole: app.globalData.userInfo.role,
					userToken: app.globalData.token
				})
				_that.loadIntentionsList();
			}
		}
	},

	loadIntentionsList() {
		const _that = this;
		wx.showLoading({
			title: 'Loading...'
		});
		wx.http({
			url: wx.api.submit_project,
			method: 'get',
			token: _that.data.userToken
		})
		.then(res => {
			let code = res.status_code;
			let intention_list = res.data.intentions.data;
			if (code == 0) {
				_that.setData({
					intentionList: intention_list
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
	// 分享
	onShareAppMessage(res) {
		return {
			title: '外联在线',
			imageUrl: '../../images/logo.jpg',
			path: '/pages/index/index',
		}
	}
	
})