const app = getApp();

Page({
    data: {
        userid: '', // 用户ID
        userRole: '', // 用户角色
        userToken: '', // 用户TOKEN
        url: '', // H5链接
        id: '', // 文章ID
        title: '', // 文章标题
        img: '', // 文章图片
        shareUrl: '', // 分享链接
    },
    onLoad(opts) {
        console.log(opts)
        this.setData({
            url: app.globalData.articleUrl + '?src=' + opts.src + '&mid=' + opts.mid + '&v=' + opts.v,
            id: opts.id,
            title: opts.title,
            img: opts.img,
            shareUrl: '/pages/webview/webview?domian=' + app.globalData.articleUrl + '&src=' + opts.src + '&mid=' + opts.mid + '&v=' + opts.v + '&title=' + opts.title + '&img=' + opts.img
        });
    },
    onShow() {
        const _that = this;
        if (app.globalData.token) {
            // 正常
            _that.setData({
                userid: app.globalData.userInfo.wx_id,
                userRole: app.globalData.userInfo.role,
                userToken: app.globalData.token
            })
        } else {
            // 异步
            app.tokenCallback = () => {
                _that.setData({
                    userid: app.globalData.userInfo.wx_id,
                    userRole: app.globalData.userInfo.role,
                    userToken: app.globalData.token
                })
            }
        }
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
                    object_type: 'article',
                    object_id: this.data.id
                }
            }).then(res => {
                console.log(res.message);
            }).catch(error => {
                console.log('请求错误：', error);
            });
        }
        return {
            title: this.data.title,
            imageUrl: this.data.img,
            path: this.data.shareUrl,
        }
    },
})