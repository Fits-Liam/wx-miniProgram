// 获取应用实例
const app = getApp()

Page({
	data: {
		userid: '', // 用户ID
		userRole: '', // 用户角色
		userToken: '', // 用户TOKEN
		userName: '', //姓名
		mobileValue: '', // 手机号
		code: '',//验证码,
		leaveMsg: '',
		codeValue: '获取验证码', // 按钮文字
		codeCountdown: 60, // 倒计时
		codeCountdownStart: false, // 是否开始倒计时
		projects: [],
		user_prejects: '',
		adv_items: [],
		singleConsult: '',
		repeatSubmit: false,
		select_tag: 0,
		crm_code: '',
		consult_name: ''
	},
	onLoad(opt) {

		//重复提交开启专属顾问栏目以选择顾问
		if (!opt.id) {
			this.setData({
				repeatSubmit: true
			});
		} else {
		//首次提交则带入顾问id和姓名
			this.setData({
				singleConsult: opt.id,
				consult_name: opt.name
			});
		}

		const _that = this;
		if (app.globalData.token) {
			// 正常
			_that.setData({
				userid: app.globalData.userInfo.wx_id,
				userRole: app.globalData.userInfo.role,
				userToken: app.globalData.token
			})
			_that.loadProjects();
			_that.loadMyConsults();
		} else {
			// 异步
			app.tokenCallback = () => {
				_that.setData({
					userid: app.globalData.userInfo.wx_id,
					userRole: app.globalData.userInfo.role,
					userToken: app.globalData.token
				})
				_that.loadProjects();
				_that.loadMyConsults();
			}
		}
	},
	// 验证码倒计时
	getVerificationCode() {
		const _that = this;
		if (!_that.data.codeCountdownStart) {
			wx.http({
				url: wx.api.getMobileCode,
				method: 'POST',
				data: {
					mobile: this.data.mobileValue,
					type: 'submit_intention'
				}
			}).then(res => {
				if (res.status_code == 0) {
					_that.sendCountdown();
				} else {
					wx.showToast({
						title: res.message,
						icon: 'none',
						duration: 1500
					})
				}
			}).catch(error => {
				console.log('请求错误:', error);
			});
		}
	},
	// 发送倒计时
	sendCountdown() {
		const _that = this;
		let codeCountdown = _that.data.codeCountdown
		let interval = setInterval(function () {
			codeCountdown--;
			_that.setData({
				codeValue: codeCountdown,
				codeCountdownStart: true
			})
			if (codeCountdown <= 0) {
				clearInterval(interval)
				_that.setData({
					codeValue: '重新发送',
					codeCountdown: 60,
					codeCountdownStart: false
				})
			}
		}, 1000)
	},

	//加载意向项目
	loadProjects() {
		const _that = this;
		wx.showLoading({
			title: 'Loading...'
		});
		wx.http({
			url: wx.api.projectList,
			method: 'get',
			token: _that.data.userToken
		})
		.then(res => {
			let code = res.status_code;
			let project_list = res.data.projects;
			if (code == 0) {
				_that.setData({
					projects: project_list
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

	//教育与移民只能二选一
	collect_edu(e) {
		console.log('checkbox发生change事件，携带value值为：', e.detail.value);
		let list = e.detail.value;
		if ( list.length > 0 ) {
			this.setData({
				select_tag: 2,
				crm_code: 2
			})
		} else {
			this.setData({
				select_tag: 0,
				crm_code: ''
			})
		}
		this.setData({
			user_prejects: e.detail.value.join(',')
		});
	},

	collect_move(e) {
		console.log('checkbox发生change事件，携带value值为：', e.detail.value)
		let list = e.detail.value;
		if (list.length > 0) {
			this.setData({
				select_tag: 1,
				crm_code: 1
			})
		} else {
			this.setData({
				select_tag: 0,
				crm_code: ''
			})
		}
		this.setData({
			user_prejects: e.detail.value.join(',')
		});
	},
	
	//加载顾问
	loadMyConsults() {
		wx.showLoading({
			title: 'Loading...',
		});
		wx.http({
			url: wx.api.customerMyConsults,
			method: 'get',
			token: this.data.userToken
		})
		.then(res => {
			let code = res.status_code;
			if (code == 0) {
				this.setData({
					adv_items: res.data.consults.data
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

	//表单提交
	submitUserInfo(e) {
		let _that = this;
		let obj = this.data;
		const formid = e.detail.formId;
	
		console.log(obj, formid);

		wx.showLoading({
			title: 'Loading...',
		});

		if (obj.userName == '' ) {
			wx.showToast({
				title: '请填写姓名',
				icon: 'none'
			});
			return false;
		}

		if (obj.mobileValue == '') {
			wx.showToast({
				title: '请填写手机号',
				icon: 'none'
			});
			return false;
		}

		if (obj.code == '') {
			wx.showToast({
				title: '请填写手机验证码',
				icon: 'none'
			});
			return false;
		}

		if (obj.user_prejects == '') {
			wx.showToast({
				title: '请填写您的意向内容',
				icon: 'none'
			});
			return false;
		}

		if (obj.singleConsult == '') {
			wx.showToast({
				title: '请选择您的顾问',
				icon: 'none'
			});
			return false;
		}

		wx.http({
			url: wx.api.submit_project,
			method: 'post',
			token: this.data.userToken,
			data: {
				mobile: obj.mobileValue,
				mobile_code: obj.code,
				username: obj.userName,
				content: obj.user_prejects,
				message: obj.leaveMsg,
				consult_wx_id: obj.singleConsult,
				form_id: formid,
				crm_code: obj.crm_code
			}
		})
		.then(res => {
			let code = res.status_code;
			wx.hideLoading();
			if (code == 0) {
				let id = _that.data.singleConsult;
				let name = _that.data.consult_name;
				//跳转必须带上顾问id与顾问昵称
				wx.navigateTo({
					url: 'messageChat?wx_id=' + id + '&user_name=' + name
				})
			} else {
				wx.showToast({
					icon: 'none',
					title: res.message,
					duration: 1000
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

	//选择顾问
	selectConsult(e) {
		this.setData({
			singleConsult: e.detail.value
		});
	},

	//微信radio暂不知道data自定义属性,所以绑定label上获取顾问昵称
	getConsult(e) {
		let name = e.currentTarget.dataset.name;
		this.setData({
			consult_name: name
		});
	},

	// 输入框监听
	inputName(e) {
		this.setData({
			userName: e.detail.value,
		});
	},
	inputTel(e) {
		this.setData({
			mobileValue: e.detail.value,
		});
	},
	inputCode(e) {
		this.setData({
			code: e.detail.value,
		});
	},
	inputLeaveMsg(e) {
		this.setData({
			leaveMsg: e.detail.value,
		});
	},
	//跳转名片
	linkToCard(e) {
		wx.common.toPage(e);
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