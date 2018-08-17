// 获取应用实例
const app = getApp()

Page({
	data: {
		userRole: '', // 用户角色
		userToken: '', // 用户TOKEN
		intent_detail: [],
		pro_tag:'',
		consult_wx_id: '',
		read_state: null
	},
	onLoad(opt) {

		const _that = this;
		_that.setData({
			pro_tag: opt.id
		})
		
		if (app.globalData.token) {
			// 正常 
			_that.setData({
				userid: app.globalData.userInfo.wx_id,
				userRole: app.globalData.userInfo.role,
				userToken: app.globalData.token
			})
			_that.loadIntentionsDetail();
		} else {
			// 异步
			app.tokenCallback = () => {
				_that.setData({
					userid: app.globalData.userInfo.wx_id,
					userRole: app.globalData.userInfo.role,
					userToken: app.globalData.token
				})
				_that.loadIntentionsDetail();
			}
		}
	},

	loadIntentionsDetail() {
		const _that = this;
		wx.showLoading({
			title: 'Loading...'
		});
		wx.http({
			url: wx.api.submit_project + '/' + _that.data.pro_tag,
			method: 'get',
			token: _that.data.userToken
		})
			.then(res => {
				let code = res.status_code;
				let detail_data = res.data.intention;
				if (code == 0) {
					_that.setData({
						intent_detail: detail_data,
						consult_wx_id: detail_data.consult_wx_id,
						read_state: detail_data.read_at
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
	},

	//跳转名片
	linkToCard(e) {
		wx.common.toPage(e);
	}	

})