// 网络请求
const http = (arr) => {
	return new Promise((resolve, reject) => {
		wx.request({
			url: arr.url,
			header: {
				'Authorization': arr.token || '',
				'content-type': arr.content || 'application/x-www-form-urlencoded; charset=utf-8', // JSON格式：'application/json'
			},
			method: arr.method || '',
			data: arr.data || '',
			success: (res) => {
				if (res.statusCode === 200) {
					resolve(res.data);
				} else {
					reject(res);
				}
			},
			fail: (error) => {
				reject(error);
			},
			complete: (res) => {
				// if (res.errMsg.indexOf('timeout') > -1 || res.errMsg.indexOf('fail') > -1) {
				// 	wx.showToast({
				// 		icon: 'none',
				// 		title: '网络请求异常，请稍后再试~',
				// 		duration: 10000
				// 	});
				// }
			}
		})
	});
}

module.exports = http;