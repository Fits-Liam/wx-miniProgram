const app = getApp();

Page({
    data: {
        userid: '', // 用户ID
        userRole: '', // 用户角色
        userToken: '', // 用户TOKEN
        consultInfo: '', // 顾问信息
        showMore: false,
        consultId: '', // 顾问ID
        templateId: '', // 模板ID
        templateArticle: '', // 模板文章
        onlineStatus: 1, // 在线状态：1在线、2下线
        isTouchMove: false,
        touches: {},
		sort_array: []
    },
    onLoad(opts) {
		console.log(opts);
        this.setData({
            templateId: opts.templated_id
        });
    },
    onShow() {
        // 加载提示
        wx.showLoading({
            title: 'Loading...'
        });
        
        const _that = this;
        if (app.globalData.token) {
            // 正常
            _that.setData({
                userid: app.globalData.userInfo.wx_id,
                userRole: app.globalData.userInfo.role,
                userToken: app.globalData.token
            })
            _that.init();
        } else {
            // 异步
            app.tokenCallback = () => {
                _that.setData({
                    userid: app.globalData.userInfo.wx_id,
                    userRole: app.globalData.userInfo.role,
                    userToken: app.globalData.token
                })
                _that.init();
            }
        }
    },
    init() {
        this.getCard();
        this.getArticle();
    },
    // 名片
    getCard() {
        wx.http({
            url: wx.api.consultantCard,
            token: this.data.userToken,
            method: 'GET',
            data: {
                wx_id: this.data.userid,
                template_id: 1
            }
        }).then(res => {
            if (res.status_code == 0) {
                this.setData({
                    consultInfo: res.data
                })
                // 关闭提示
                wx.hideLoading();
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    getMoreInfo(){
        this.setData({
            showMore: !this.data.showMore
        })
    },
    // 获取模板文章
    getArticle() {
        wx.http({
            url: wx.api.templatesArticles,
            token: this.data.userToken,
            method: 'GET',
            data: {
                template_id: this.data.templateId,
            }
        }).then(res => {
            console.log(res)
            if (res.status_code == 0) {
                if (res.message != '暂无文章') {
                    let templateArticle = res.data.template_articles;
                    templateArticle.forEach((v,i) => {
                        templateArticle[i].touchmove = false;
                    })
                    this.setData({
                        templateArticle
                    })

					let sort_ary = [];
					for (let item of templateArticle) {
						sort_ary.push(item.id);
					}
					this.setData({
						sort_array: sort_ary
					});
                }
                wx.setNavigationBarTitle({
                    title: res.data.template_name
                });
            }
        }).catch(error => {
            console.log('请求错误:', error);
        })
    },
    // 模板文字搜索/标题修改
    toTemplateSearch(e) {
        const type = e.currentTarget.dataset.type;
        wx.navigateTo({
            url: '../card/templateSearch?type=' + type + '&templated_id=' + this.data.templateId
        })
    },
    // 分享
    onShareAppMessage(res) {
        console.log(this.data.templateId)
        // 统计
        if (this.data.userRole != 'customer') {
            wx.http({
                url: wx.api.share,
                token: this.data.userToken,
                method: 'POST',
                data: {
                    object_type: 'visiting_card'
                }
            }).then(res => {
                console.log(res.message);
            }).catch(error => {
                console.log('请求错误：', error);
            });
        }
        return {
            title: this.data.consultInfo.mg_name + '的名片',
            imageUrl: this.data.consultInfo.headimgurl.replace(/([^/]*)$/, '0'), // 转换成640x640头像尺寸
            path: '/pages/card/card?id=' + this.data.userid + '&templated_id=' + this.data.templateId
        }
    },
    // 删除事件：点击
    bindDelTouchStart(e) {
        let templateArticle = this.data.templateArticle;
        // 开始触摸时 重置所有删除
        templateArticle.forEach((v, i) => {
            // 只操作为true的
            if (v.touchmove) {
                v.touchmove = false;
            }
        })
        this.setData({
            touches: e.changedTouches[0],
            templateArticle
        })
    },
    // 删除事件：滑动
    bindDelTouchMove(e) {
        let index = e.currentTarget.dataset.index;
        let startTouch = this.data.touches;
        let moveTouch = e.changedTouches[0];
        let templateArticle = this.data.templateArticle;

        // 判断滑动方向
        if (Math.abs(moveTouch.clientX - startTouch.clientX) < Math.abs(moveTouch.clientY - startTouch.clientY)) {
            // 纵向滑动
            return false;
        } else {
            // 横向滑动
            templateArticle.forEach((v, i) => {
                v.touchmove = false;
                if (i == index) {
                    if (moveTouch.clientX > startTouch.clientX) {
                        v.touchmove = false;
                    } else {
                        v.touchmove = true;
                    }
                }
            })
            this.setData({
                templateArticle
            })
        }
    },
    // 删除操作
    bindDel(e) {
        let curDataset = e.currentTarget.dataset;
        wx.http({
            url: wx.api.templatesArticlesDel,
            token: this.data.userToken,
            content: 'application/json',
            method: 'POST',
            data: {
                template_id: this.data.templateId,
                article_ids: [curDataset.id]
            }
        }).then(res => {
            console.log( res )
            if (res.status_code == 0) {
                this.data.templateArticle.splice(curDataset.index, 1)
                this.setData({
                    templateArticle: this.data.templateArticle
                })
                console.log( this.data.templateArticle )
            }
        }).catch(error => {
            console.log('请求错误:', error);
        })
    },

	//顾问推荐文章置顶
	move_artical(e) {

		let fixed_id = e.target.dataset.id;
		let sort_ary = this.data.sort_array;
		let filter_tag = sort_ary.indexOf(fixed_id);

		sort_ary.splice(filter_tag, 1);
		sort_ary.unshift(fixed_id);

		let params = {
			template_id: this.data.templateId,
			article_ids: sort_ary
		};

		wx.http({
			url: wx.api.updateTemArticalSort,
			token: this.data.userToken,
			method: 'POST',
			content: 'application/json',
			data: params
		})
		.then(res => {
			console.log(res)
			if (res.status_code == 0) {
				this.getArticle();
			}
		})
		.catch(error => {
			console.log('请求错误:', error);
		})

	}

});