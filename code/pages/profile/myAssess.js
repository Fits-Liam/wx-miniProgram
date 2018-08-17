// 获取应用实例
const app = getApp()

Page({
    data: {
        userRole: '', // 用户角色
        userToken: '', // 用户TOKEN
        assessData: '', // 评估列表
        loadingMore: true,
        loadingEnd: true,
    },
    onLoad(opts) {
        
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
        this.getAssessList();
    },
    // 获取专属顾问
    getAssessList(type) {
        let assessData = this.data.assessData;
        // 默认参数
        let curParams = {};
        // 判断加载方式
        if (type == 'add') {
            curParams['page'] = assessData.current_page + 1
        }

        wx.http({
            url: wx.api.profileAssessList,
            token: this.data.userToken,
            method: 'GET',
            data: curParams
        }).then(res => {
            console.log(res.data)
            if (res.status_code == 0) {
                let curData = res.data.assess_articles;
                if (type == 'add') {
                    // 添加：追加数据
                    this.setData({
                        assessData: curData,
                        ['assessData.data']: assessData.data.concat(curData.data)
                    })
                    // 下拉加载提示
                    this.bindDownLoadTips(curData.current_page, curData.last_page);
                } else {
                    // 默认：重置数据
                    this.setData({
                        assessData: curData
                    })
                    // 加载完成
                    wx.hideLoading();
                }
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 查看结果
    toWebviewNormal(e) {
        let url = e.currentTarget.dataset.url;
        let domian = url.split('?')[0];
        let query = url.split('?')[1];

        wx.navigateTo({
            url: '../webview/webviewNormal?type=assess&domian=' + domian + '&' + query
        })
    },
    // 下拉加载
    bindDownLoad() {
        const curData = this.data.assessData;
        if (curData.current_page != curData.last_page) {
            this.getAssessList('add');
        }
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
    }
})