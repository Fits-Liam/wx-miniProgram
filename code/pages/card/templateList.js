const app = getApp(); 

Page({
    data: {
        userRole: '', // 用户角色
        userToken: '', // 用户TOKEN
        templateInfo: '',
        clickDelay: false,
        scrollHeight: 0,
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
        })

        this.getTemplates();
    },
    // 获取模板列表
    getTemplates(type){
        let templateInfo = this.data.templateInfo;
        // 默认参数
        let curParams = {};
        // 判断加载方式
        if (type == 'add') {
            curParams['page'] = templateInfo.current_page + 1
        }

        wx.http({
            url:wx.api.templates,
            token: this.data.userToken,
            method: 'GET',
            data: curParams
        }).then(res => {
            if(res.status_code == 0){
                let curData = res.data.templates;
                if (type == 'add') {
                    // 添加：追加数据
                    this.setData({
                        templateInfo: curData,
                        ['templateInfo.data']: templateInfo.data.concat(curData.data)
                    })
                    // 下拉加载提示
                    this.bindDownLoadTips(curData.current_page, curData.last_page);
                } else {
                    // 默认：重置数据
                    this.setData({
                        templateInfo: curData
                    })
                    // 关闭提示
                    wx.hideLoading();
                }
            }
        }).catch(error => {
            console.log('请求错误:',error);
        })
    },
    // 创建模板
    creatTemplates(){
        const _that = this;
         // 防止重复点击
        if ( this.data.clickDelay ) {
            return false;
        }else{
            _that.setData({
                clickDelay: true
            })
            setTimeout(function() {
                _that.setData({
                    clickDelay: false
                })
            }, 1500)
        }
        wx.http({
            url:wx.api.templates,
            token: this.data.userToken,
            method: 'POST',
            data:{
                name: '名片模板'+(this.data.templateInfo.total+1)
            }
        }).then(res => {
            console.log(res)
            if(res.status_code == 0){
                wx.showToast({
                    title: '创建成功',
                    icon:'none',
                    duration:1500
                })
                this.getTemplates();
            }
        }).catch(error => {
            console.log('请求错误:',error);
        })
    },
    // 进入模板
    goTemplateDetails(e){
        wx.navigateTo({
            url: '../card/templateDetails?templated_id='+e.currentTarget.dataset.id
        })
    },
    // 下拉加载
    bindDownLoad() {
        const curData = this.data.templateInfo;
        if (curData.current_page != curData.last_page) {
            this.getTemplates('add');
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
});