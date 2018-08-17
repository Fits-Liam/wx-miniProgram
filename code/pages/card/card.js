// 获取应用实例
const app = getApp();

Page({
    data: {
        pageId: 'card', // 页面路径
        userid: '', // 用户ID
        userRole: '', // 用户角色
        userToken: '', // 用户TOKEN
        consultInfo: '', // 顾问信息
        showMore: false,
        templateId: '', // 模板ID
        templateArticle: '', // 模板文章
        onlineStatus: 1, // 在线状态：1在线、2下线
        queryId: '', // URL参数：ID
        msgTips: false,
    },
    onLoad(opts) {
        if (opts.id) {
            this.setData({
                queryId: opts.id
            });
        }
        if (opts.templated_id) {
            this.setData({
                templateId: opts.templated_id
            });
        }
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
        this.loadMsgCount();
    },
    // 下拉刷新
    onPullDownRefresh(){
        this.init();
    },
    // 打电话
    callPhone(e) {
        wx.common.callPhone(e);
    },
    // 页面跳转
    toPage(e) {
        wx.common.toPage(e);
    },
    // 开始聊天
    startChat(e) {
        wx.common.startChat(e);
    },
    // 名片
    getCard() {
        let _cardId = this.data.userid;
        if (this.data.userRole == 'customer') {
            _cardId = this.data.queryId;
        }
        wx.http({
            url: wx.api.consultantCard,
            token: this.data.userToken,
            method: 'GET',
            data: {
                wx_id: _cardId,
                template_id: this.data.templateId
            }
        }).then(res => {
            console.log(res);
            if (res.status_code == 0) {
                // 更新数据
                this.setData({
                    consultInfo: res.data,
                })
                // 有模板ID、切只有客户角色，才进行模板文章赋值
                if (this.data.templateId && this.data.userRole == 'customer') {
                    this.setData({
                        templateArticle: res.data,
                    })
                }
                // 加载完成
                wx.hideLoading();
                wx.stopPullDownRefresh();
            } else {
                wx.common.showToast(res.message);
                // 加载完成
                wx.hideLoading();
                wx.stopPullDownRefresh();
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
    // 查看文章
    toWebview(e) {
        let title = e.currentTarget.dataset.title;
        let img = e.currentTarget.dataset.img;
        let id = e.currentTarget.dataset.id;
        let url = e.currentTarget.dataset.url;
        let domian = url.split('?')[0];
        let query = url.split('?')[1];
        let v = query.split('&')[0];
        let mid = query.split('&')[2];

        wx.navigateTo({
            url: '../webview/webview?domian=' + domian + '&' + query + '&title=' + title + '&img=' + img + '&id=' + id + '&' + v + '&=' + mid
        })
    },
    // 去模板列表
    toTemplateList(e) {
        wx.navigateTo({
            url: '../card/templateList'
        })
    },
    // 更改在线状态
    changeOnlineStatus() {
        wx.http({
            url: wx.api.servicesOnlineStatus,
            token: this.data.userToken,
            method: 'POST'
        }).then(res => {
            // 修改 data 中子对象的属性值
            let status = 'adviser.online_status'
            this.setData({
                [status]: res.data.online_status
            })
            // 返回提示信息
            wx.common.showToast(res.message);
        }).catch(error => {
            console.log('请求错误:', error);
        });
    },
    // 更新资料
    toWebviewNormal(e) {
        if (this.data.userRole == 'customer') return false;
        let domian = 'https://marketing.mofi.com.cn/Admin/Manager/edituser';
        wx.navigateTo({
            url: '../webview/webviewNormal?domian=' + domian
        })
    },
    // 分享
    onShareAppMessage(res) {
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
            path: '/pages/card/card?id=' + this.data.userid,
        }
    },
    // 获得消息未读总数
    loadMsgCount() {
        wx.http({
            url: wx.api.unReadMessage,
            method: 'get',
            token: this.data.userToken,
        })
        .then(res => {
            let code = res.status_code;
            if (code == 0) {
                if (res.data.unread_count > 0) {
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
})