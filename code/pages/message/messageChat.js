const app = getApp();
let timeInterval;
const qiniuUploader = require("../../utils/qiniuUploader");

Page({
	data: {
		userRole: "",
		token: '' ,
		// user_id: '3382',
		user_name:'',
		user_id: '',
		my_headimg: '',
		some_headimg: '' ,
		chat_list: '',
		msg_text: '',
		pullDown_key:'',
		pageid: 1,
		lastpage:'',
		winHeight: 0,
		scrollTop: 0,
		lastMsgTimeStamp: 0,
		other_role: 0,
		uploadUrl: '',
		uploadToken: '',
		uploadDomain: '',
		images: {},
		origin_img: '',
		origin_img_state: false
	},

	onLoad(opt) {
		const _that = this;

		wx.getSystemInfo({
			success: (res) => {
				_that.setData({
					winHeight: res.windowHeight
				});
			}
		});

		wx.setNavigationBarTitle({
			title: opt.user_name
			// title: '测试花花'
		});
		this.setData({
			user_id: opt.wx_id,
			user_name: opt.user_name || '消息'
		})
		
		if (app.globalData.token) {
			// 正常
			_that.setData({
				userid: app.globalData.userInfo.wx_id,
				userRole: app.globalData.userInfo.role,
				token: app.globalData.token
			})
			_that.requestForMsg();
			_that.getUploadToken();
			console.log('%c 同步：token ' + _that.data.token, 'color:red;');
		} else {
			// 异步
			app.tokenCallback = () => {
				_that.setData({
					userid: app.globalData.userInfo.wx_id,
					userRole: app.globalData.userInfo.role,
					token: app.globalData.token
				})
				_that.requestForMsg();
				_that.getUploadToken();
				console.log('%c 异步：token ' + _that.data.token, 'color:red;');
			}
		}
	},

	onShow() {
		this.timePickonMsg();
	},

	//二分颠倒排列
	msgResverDeal(param) {
		let lg = param.length;
		if (lg.length == 0 ) {
			return false;
		}
		let left = null;
		let right = null;
		let deal_list = param;
		if( lg <= 2 ) {
			return deal_list;
		} else {
			for (left = 0; left < lg / 2; left += 1) {
				right = lg - 1 - left;
				let temporary = deal_list[left];
				deal_list[left] = deal_list[right];
				deal_list[right] = temporary;
			}
			return deal_list;
		}
	},

	//请求接口数据
	requestForMsg(tag) {
		const _that = this;
		wx.http({
			url: wx.api.someOneList,
			method: 'post',
			token: this.data.token,
			data: {
				wx_id: _that.data.user_id,
				page: _that.data.pageid
			}
		})
		.then(res => {
			let code = res.status_code;
			if (code == 0) {
				let origin_msg = res.data.messages.data;
				//取首条消息记录时间
				let timeStamp = origin_msg[0].created_at || 0;
				_that.setData({
					lastMsgTimeStamp: timeStamp,
					other_role: res.data.someone_role
				});
				let result_msg = _that.msgResverDeal(origin_msg);
				console.log('首次加载');
				_that.firstLoadMsg(res, result_msg);
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

	//定时刷新
	timeIntervalForMsg() {
		const _that = this;
		wx.http({
			url: wx.api.someOneList,
			method: 'post',
			token: this.data.token,
			data: {
				wx_id: _that.data.user_id,
				page: _that.data.pageid
			}
		})
		.then(res => {
			let code = res.status_code;
			if (code == 0) {
				let origin_msg = res.data.messages.data;
				let timeStamp = origin_msg[0].created_at || 0;

				//解决IOS不兼容2018-07-19时间的问题
				let copy_timeStamp = timeStamp.replace(/-/g, '/');  
				let copy_lastTimeStamp = _that.data.lastMsgTimeStamp.replace(/-/g, '/'); 

				if (Date.parse(copy_timeStamp) == Date.parse(copy_lastTimeStamp) ) {
					console.log('不更新数据');
					return false;
				} else {
					console.log('更新数据');
					_that.setData({
						lastMsgTimeStamp: timeStamp
					});
					let result_msg = _that.msgResverDeal(origin_msg);
					_that.firstLoadMsg(res, result_msg);
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

	firstLoadMsg(res, result_msg) {
		this.setData({
			chat_list: result_msg,
			lastpage: res.data.messages.last_page,
			my_headimg: res.data.myself_headimgurl,
			some_headimg: res.data.someone_headimgurl,
			toView: 'fucked'
		});
		this.pageScrollToBottom();
	},

	//自动滑动到底部
	pageScrollToBottom() {
		this.setData({
			scrollTop:5000
		})
	},
	
	//发送消息
	sendMsg(e) {

		let _that = this;
		let formid = e.detail.formId;

		wx.http({
			url: wx.api.messageList,
			method: 'post',
			token: this.data.token,
			data: {
				form_id: formid,
				content: _that.data.msg_text,
				receiver: _that.data.user_id
			}
		})
		.then(res => {
			let code = res.status_code;
			if (code == 0) {
				//模拟消息详情
				let current_msg = {
					content: _that.data.msg_text,
					is_sender: 1,
					created_at: ''
				};
				//如果历史消息为空则创建数组连接当前数组
				let total_chat = [];
				let history_chat = _that.data.chat_list;
				if (history_chat == '') {
					total_chat.push(current_msg);
				} else {
					total_chat = history_chat.concat(current_msg);
				}
				_that.setData({
					chat_list: total_chat,
					msg_text: ''
				});
				_that.pageScrollToBottom();
				//如要发送成功继续收取消息则切记定时器生成则要清理否则会出现返回ID不一致导致获得焦点事件失效
				// clearInterval(timeInterval);
				// _that.timePickonMsg();
				// console.log( '发送成功时' + timeInterval);
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

	//每隔10秒拉取消息
	timePickonMsg() {
		var that = this;
		timeInterval = setInterval(function () {
			// wx.vibrateLong();
			that.timeIntervalForMsg();
		}, 10000);
	},

	//获得焦点
	focusDeal(e) {
		clearInterval(timeInterval);
	},

	//失去焦点
	lostFocusDeal(e) {
		this.timePickonMsg();
	},

	inputKeys(e) {
		let text = e.detail.value;
		this.setData({
			msg_text: text
		});
	},

	//页面隐藏
	onHide: function () {
		clearInterval(timeInterval);
	},

	//页面卸载
	onUnload: function () {
		clearInterval(timeInterval);
	},

	// 分享
	onShareAppMessage(res) {
		return {
			title: '外联在线',
			imageUrl: '../../images/logo.jpg',
			path: '/pages/index/index',
		}
	},

	goWebview(e) {
		app.goWebview(e);
	},

	//跳转名片
	linkToCard(e) {
		console.log(e.currentTarget.dateset);
		wx.common.toPage(e);
	},

	getUploadToken() {
		wx.http({
			url: wx.api.uploadQiNiuFile,
			method: 'get',
			token: this.data.token,
		})
		.then(res => {
			let code = res.status_code;
			if (code == 0) {
				this.setData({
					uploadToken: res.data.uptoken,
					uploadDomain: res.data.domain
				});
			}
		})
		.catch(error => {
			console.log(error);
		});
	},

	// 初始化七牛相关参数
	initQiniu() {
		var options = {
			region: 'ECN', 
			uptokenURL: 'https://up.qiniup.com',
			uptoken: this.data.uploadToken,
			domain: this.data.domain,
			shouldUseQiniuFileName: true
		};
		qiniuUploader.init(options);
	},

	buildGUID(){
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
		return  'message/' + app.globalData.userInfo.wx_id + '/' + uuid;
	},

	uploadFile(e) {
		let _that = this;
		let formid = e.detail.formId;

		_that.initQiniu();
		// 微信 API 选文件
		wx.chooseImage({
			count: 1,
			sizeType: ['original'],
			sourceType: ['album', 'camera'],
			success: function (res) {
				var filePath = res.tempFilePaths[0];
				if (res.tempFilePaths.length == 0) {
					wx.showToast({ 
						title: '请拍照后上传',
						icon: 'none'
					});
					return false;
				}
				// 交给七牛上传
				qiniuUploader.upload(filePath, (res) => {
					_that.setData({
						'uploadUrl': _that.data.uploadDomain + '/' + res.key
					});
					_that.sendImageMsg({
						formid: formid,
						imgUrl: _that.data.uploadDomain + '/' + res.key
					});
				}, 
				(error) => {
					console.error('error: ' + JSON.stringify(error));
				},
				{
					region: 'ECN', 
					key: _that.buildGUID()
				},
				(res) => {

					if (res.progress == 100 ) {
						wx.hideLoading();
					} else {
						wx.showLoading({
							title: '上传 ' + res.progress + '%'
						});
					}
					// console.log('上传中' + res.progress);
					// console.log('上传进度', res.progress)
					// console.log('已经上传的数据长度', res.totalBytesSent)
					// console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
				}
				);
			}	
		});	
	},


	//发送图片消息
	sendImageMsg(param) {

		let _that = this;
		let formid = param.formid;

		wx.http({
			url: wx.api.messageList,
			method: 'post',
			token: this.data.token,
			data: {
				form_id: formid,
				content: 'You have received a image message',
				receiver: _that.data.user_id,
				src_link: param.imgUrl,
				type: 4
			}
		})
		.then(res => {
			let code = res.status_code;
			if (code == 0) {
				//模拟消息详情
				let current_msg = {
					content: 'You have received a image message',
					is_sender: 1,
					created_at: '',
					src_link: param.imgUrl,
					type: 4
				}; 	
				//如果历史消息为空则创建数组连接当前数组
				let total_chat = [];
				let history_chat = _that.data.chat_list;
				if (history_chat == '') {
					total_chat.push(current_msg);
				} else {
					total_chat = history_chat.concat(current_msg);
				}
				_that.setData({
					chat_list: total_chat,
					msg_text: ''
				});

				_that.pageScrollToBottom();
				//如要发送成功继续收取消息则切记定时器生成则要清理否则会出现返回ID不一致导致获得焦点事件失效
				// clearInterval(timeInterval);
				// _that.timePickonMsg();
				// console.log( '发送成功时' + timeInterval);
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

	checkHdImg(e) {
		let res = e.target.dataset;


		this.setData({
			origin_img: res.url,
			origin_img_state: true
		});
		
	},

	//图片生命周期加载完毕设置自定义属性
	loadImgInfo(e) {
		var image = this.data.images; 
		image[e.target.dataset.index] = {
			width: e.detail.width,
			height: e.detail.height
		}
		this.setData({
			images: image
		})
	},

	//关闭大图
	close_originImg() {
		this.setData({
			origin_img_state: false
		});
	}

})