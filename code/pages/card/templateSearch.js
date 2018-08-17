const app = getApp();

Page({
    data: {
        userRole: '', // 用户角色
        userToken: '', // 用户TOKEN
        type: '', // 页面类型
        templateId: '', //模板ID
        inputVal: '',
        article: '',
        articleChoice: [],
        scrollHeight: 0,
        loadingMore: true,
        loadingEnd: true,
		isCollect: true,
		searchText: '搜索'
    },
    onLoad(opts) {
        this.setData({
            type: opts.type,
            templateId: opts.templated_id
        });

        if (opts.type == 'editor') {
            wx.setNavigationBarTitle({
                title: '修改模板名称'
            });
        }else if (opts.type == 'add') {
            wx.setNavigationBarTitle({
                title: '添加文章'
            });
        }
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
    init(){
        const that = this;
        // 获取系统信息
        wx.getSystemInfo({
            success: (res) => {
                wx.createSelectorQuery().selectAll('.m-bottom-bar').boundingClientRect((rects) => {
                    rects.forEach((rect) => {
                        that.setData({
                            scrollHeight: res.windowHeight - rect.height
                        })
                    })  
                }).exec()
            }
        });

		//默认首次进入加载已收藏文章
		this.loadCollectArtcial();
    },
    // 监听输入框
    inputTyping(e) {
        this.setData({
            inputVal: e.detail.value,
			searchText: '搜索'
        });
    },
    // 选择
    clickChoose(e) {
        const id = e.currentTarget.dataset.id;
        const index = e.currentTarget.dataset.index;
        const article = this.data.article;
        const articleChoice = this.data.articleChoice;
        const idIndex = articleChoice.indexOf(id);

        if (idIndex >= 0) {
            articleChoice.splice(idIndex, 1)
            article.data[index].checked = false;
        } else {
            articleChoice.push(id)
            article.data[index].checked = true;
        }
        this.setData({
            article: article
        })
		console.log(this.data.article)
    },

    // 搜索
    clickSearch(type) {
		if ( this.data.searchText == '搜索' ){

			if (this.data.inputVal) {
				let article = this.data.article;
				// 默认参数
				let curParams = {
					key: this.data.inputVal
				};
				// 判断加载方式
				if (type == 'add') {
					curParams['page'] = article.current_page + 1
				} else {
					// 加载提示
					wx.showLoading({
						title: 'Loading...'
					});
				}

				wx.http({
					url: wx.api.searchArticle,
					token: this.data.userToken,
					method: 'GET',
					data: curParams
				}).then(res => {
					if (res.status_code == 0) {
						let curData = res.data.articles;

						//请求成功则改变文字状态
						this.setData({
							searchText: '取消'
						})

						if (type == 'add') {
							// 添加：追加数据
							this.setData({
								article: curData,
								['article.data']: article.data.concat(curData.data),
								isCollect: false
							})
							// 下拉加载提示
							this.bindDownLoadTips(curData.current_page, curData.last_page);
						} else {
							// 默认：重置数据
							this.setData({
								article: curData,
								isCollect: false
							})
							// 关闭提示
							wx.hideLoading();
						}

					}
				}).catch(error => {
					console.log('请求错误:', error);
				});
			} else {
				wx.common.showToast('请输入搜索内容');
			}

		} else {

			//执行加载收藏文章
			this.setData({
				inputVal: '',
			})
			this.loadCollectArtcial();

		}
    },

	//无搜索时加载顾问收藏文章列表
	loadCollectArtcial(type) {

		let article = this.data.article;
		// 默认参数
		let curParams = {};
		// 判断加载方式
		if (type == 'add') {
			curParams['page'] = article.current_page + 1
		} else {
			// 加载提示
			wx.showLoading({
				title: 'Loading...'
			});
		}
		wx.http({
			url: wx.api.collectArtical,
			method: 'get',
			token: this.data.userToken,
			data: curParams
		})
		.then(res => {
			if (res.status_code == 0) {

				this.setData({
					searchText: '搜索'
				})

				let curData = res.data.articles;
				if (type == 'add') {
					// 添加：追加数据
					this.setData({
						article: curData,
						['article.data']: article.data.concat(curData.data),
						isCollect: true
					})
					// 下拉加载提示
					this.bindDownLoadTips(curData.current_page, curData.last_page);
				} else {
					// 默认：重置数据
					this.setData({
						article: curData,
						isCollect: true
					})
					// 关闭提示
					wx.hideLoading();
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


	// 下拉加载
	bindDownLoad() {
		const curData = this.data.article;
		if (curData.current_page != curData.last_page) {
			if (this.data.isCollect) {
				this.pullDownLoadMore('collect');
			} else {
				this.pullDownLoadMore('search');
			}
		}
	},

	// 下拉加载函数
	pullDownLoadMore(tag) {

		let article = this.data.article;
		let curParams = {
			key: this.data.inputVal
		};
		curParams['page'] = article.current_page + 1

		wx.showLoading({
			title: 'Loading...'
		});

		if( tag == 'collect' ) {
			//下拉加载收藏文章
			wx.http({
				url: wx.api.collectArtical, 
				method: 'get',
				token: this.data.userToken,
				data: curParams
			})
			.then(res => {
				if (res.status_code == 0) {
					wx.hideLoading();
					let curData = res.data.articles;
					// 添加：追加数据
					this.setData({
						article: curData,
						['article.data']: article.data.concat(curData.data),
					})
					// 下拉加载提示
					this.bindDownLoadTips(curData.current_page, curData.last_page);
				}
			})
			.catch(error => {
				wx.showToast({
					icon: 'none',
					title: error.data.message,
					duration: 1000
				});
			});
			
		} else {
			//下拉加载搜索文章
			wx.http({
				url: wx.api.searchArticle,
				method: 'get',
				token: this.data.userToken,
				data: curParams
			})
			.then(res => {
				if (res.status_code == 0) {
					wx.hideLoading();
					let curData = res.data.articles;
					// 添加：追加数据
					this.setData({
						article: curData,
						['article.data']: article.data.concat(curData.data),
					})
					// 下拉加载提示
					this.bindDownLoadTips(curData.current_page, curData.last_page);
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

    // 保存文章
    clickSaveArticle() {
        wx.http({
            url: wx.api.templatesArticles,
            token: this.data.userToken,
            content: 'application/json',
            method: 'POST',
            data: {
                template_id: this.data.templateId,
                article_ids: this.data.articleChoice
            }
        }).then(res => {
            console.log(res)
            if (res.status_code == 0) {
                wx.navigateBack()
            }else{
                wx.common.showToast(res.message);
            }
        }).catch(error => {
            if ( error.data.status_code == 400 ) {
                wx.common.showToast(error.data.message);
            }
            console.log('请求错误：', error);
        })
    },

    // 保存标题
    clickSaveTitle() {
        wx.http({
            url: wx.api.templates + '/' + this.data.templateId,
            token: this.data.userToken,
            method: 'PUT',
            data: {
                name: this.data.inputVal,
            }
        }).then(res => {
            if (res.status_code == 0) {
                console.log(res)
                wx.navigateBack()
            }else{
                wx.common.showToast(res.message);
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },

    // 下拉加载提示
    bindDownLoadTips(cur, last) {
        if (cur == last) {
            this.setData({
                loadingMore: true,
                loadingEnd: false,
            })
        } else {
            this.setData({
                loadingMore: false,
                loadingEnd: true,
            })
        }
    },
	
});