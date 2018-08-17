const app = getApp();

Page({
	data: {
		userRole: 'customer',
		pageId: 'index',
		active_tag: 1,
		artical_info: '',
		filterState: false,
		articleType: '',
		curChoose: [],
		winHeight: 0,
		scrollTop: 0,
		curt_page: 1,
		last_page: 1,
		forbidLoad: false
	},

	onLoad(opt) {
		
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
		} else {
			// 异步
			app.tokenCallback = () => {
				_that.setData({
					// userid: app.globalData.userInfo.wx_id,
					userRole: app.globalData.userInfo.role,
					token: app.globalData.token
				})
				_that.init();
			}
		}
	},
	
	init(){
		this.loadArticleType();
		this.getArticleType();
	},

	//切换菜单
	switchNav(e) {
		var type = e.target.dataset.tag;

		this.setData({
			active_tag: type,
			forbidLoad: false,
			curt_page: 1,
			last_page: 1,
			artical_info: [],
			curChoose: []
		});

		if ( type == 3 ) {
			this.setData({
				filterState: !this.data.filterState
			});
		} else {
			this.setData({
				filterState: false,
			});
			this.loadArticleType();
		}
	},

	// 获取文章判断
	loadArticleType() {

		let param;
		let active_tag = this.data.active_tag;

		if (active_tag == 0) {
			this.article_total();
		} else if (active_tag == 1) {
			
			this.article_hotNew('update','is_newest');
		} else if (active_tag == 2) {
			
			this.article_hotNew('update','is_hot');
		}
		
	},

	// 导航 - 全部
	article_total(subs) {
		let param = {};

		if (subs == 'loadMore') {
			param = { page: this.data.curt_page };
		}

		wx.showLoading({
			title: 'Loading...'
		});

		wx.http({
			url: wx.api.infomation_total_articles,
			method: 'get',
			token: this.data.token,
			data: param
		})
		.then(res => {
			let code = res.status_code;
			if (code == 0) {
				wx.hideLoading();
				let info_articles = res.data.information_articles;
				this.setData({
					curt_page: info_articles.current_page,
					last_page: info_articles.last_page
				});
				if (subs == 'loadMore') {
					if ( this.data.curt_page == this.data.last_page ) {
						wx.showToast({
							icon: 'none',
							title: '已经加载到底啦~',
						})
						return false;
					}

					this.setData({
						curt_page: this.data.curt_page + 1,
						artical_info: this.data.artical_info.concat(info_articles.data),
					});
				} else {
					this.setData({
						artical_info: info_articles.data,
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

	// 导航 - 热门&最新
	article_hotNew(subs,tag) {

		let param = {};

		param[tag] = 1;
		param['per_page'] = 15

		if (subs == 'loadMore') {
			param['page'] = this.data.curt_page;
		}

		wx.showLoading({
			title: 'Loading...'
		});

		wx.http({
			url: wx.api.information,
			method: 'get',
			token: this.data.token,
			data: param
		})
		.then(res => {
			let code = res.status_code;
			if (code == 0) {
				wx.hideLoading();
				let info_articles = res.data.information_articles;
				this.setData({
					curt_page: info_articles.current_page,
					last_page: info_articles.last_page
				});
				if (subs == 'loadMore') {
					if (this.data.curt_page == this.data.last_page) {
						wx.showToast({
							icon: 'none',
							title: '已经加载到底啦~',
						})
						return false;
					}
					this.setData({
						curt_page: this.data.curt_page + 1,
						artical_info: this.data.artical_info.concat(info_articles.data),
					});
				} else {
					this.setData({
						artical_info: info_articles.data,
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

	// 导航 - 文章标签
	article_articleTag(subs) {

		let param_page = {};
		if ( this.data.curChoose.length == 0 ) {
			wx.showToast({
				icon: 'none',
				title: '请选择',
				duration: 1000
			});
			return false;
		}

		if (subs == 'loadMore') {
			param_page = { page: this.data.curt_page };
		}

		wx.showLoading({
			title: 'Loading...'
		});
	
		const arr = this.data.curChoose;
		let params = '';
		arr.forEach((value, index, array) => {
			let curVal = 'tag_ids[]=' + value + '&'
			params += curVal
		});
		// 该接口请求写法特殊处理
		wx.http({
			url: wx.api.articalTags + '?' + params,
			token: this.data.token,
			method: 'GET',
			data: param_page
		})
		.then(res => {
			if (res.status_code == 0) {
				wx.hideLoading();
				let info_articles = res.data.tag_articles;
				this.setData({
					curt_page: info_articles.current_page,
					last_page: info_articles.last_page,
				});
				if (subs == 'loadMore') {
					if (this.data.curt_page == this.data.last_page) {
						wx.showToast({
							icon: 'none',
							title: '已经加载到底啦~',
						})
						return false;
					}
					this.setData({
						curt_page: this.data.curt_page + 1,
						artical_info: this.data.artical_info.concat(info_articles.data),
					});
				} else {
					this.setData({
						artical_info: info_articles.data,
						filterState: !this.data.filterState
					});
				}

			}
		})
		.catch(error => {
			console.log('请求错误：', error);
		})
	},	
	
    // 获取咨询筛选分类
    getArticleType() {
        wx.http({
			url: wx.api.searchTags,
            token: this.data.userToken,
            method: 'GET'
        }).then(res => {
            if (res.status_code == 0) {
                // 更新数据
                this.setData({
                    articleType: res.data.tags,
                })
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },

	// 收取筛选选项
	checkboxChange(e) {
		const id = e.currentTarget.dataset.id;
		const curChoose = this.data.curChoose;
		const idIndex = curChoose.indexOf(id);

        if (idIndex >= 0) {
            curChoose.splice(idIndex, 1)
        } else {
            curChoose.push(id)
        }

		this.setData({
			curChoose: curChoose
		})
	},

	//下拉到底加载
	onReachBottom: function (e) {
		let type = this.data.active_tag;

		if (type == 0 ) {
			//默认 - 全部
			this.article_total('loadMore');
		} else if (type == 1 ) {
			//参数 - 最新
			this.article_hotNew('loadMore','is_newest');
		} else if ( type == 2 ) {
			//参数 - 热门
			this.article_hotNew('loadMore','is_hot');
		} else if( type == 3 ) {
			//参数 - 文章标签
			this.article_articleTag('loadMore');
		}
	},

	//文章收藏
	collect_artical(e) {

		let tag = e.target.dataset.index;
		let select_id = e.target.dataset.id;
		let oringin_project = this.data.artical_info;

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
					artical_info: oringin_project
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

})