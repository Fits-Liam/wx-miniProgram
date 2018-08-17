// 获取应用实例
const app = getApp()

Page({
    data: {
        userRole: '', // 用户角色
        userToken: '', // 用户TOKEN
        tabType: 1, // 标签类型
        readState: '', // 阅读状态
        readAmount: '', // 阅读数量
        consultData: '', // 咨询数据
        drawerDisplay: false, // 抽屉显示状态
        drawerFilter: false, // 抽屉 - 筛选
        dateStart: '', // 开始日期
        dateEnd: '', // 结束日期
        filterDataset: {}, // 筛选条件数据集
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
    init() {
        this.getReadAmount();
        this.getConsultData();
    },
    // 去子页
    toSubpage(e) {
        wx.common.toSubpage(e);
    },
    // 标签切换
    switchArtical(e) {
        const tabType = e.currentTarget.dataset.type;
        if (tabType == this.data.tabType) {
            return false
        };
        // 全部
        let readState = '';
        // 已读
        if (tabType == 2) {
            readState = '1'
        }
        // 未读
        if (tabType == 3) {
            readState = '0'
        }

        this.setData({
            tabType,
            readState,
            filterDataset: '', // 初始化
        });
        this.getConsultData();
    },
    // 打开抽屉
    openFilterDrawer(e) {
        let type = e.currentTarget.dataset.type;
        let animation = wx.createAnimation({
            duration: 200
        });

        if (type == 'sort') {
            this.setData({
                drawerSort: true,
                drawerFilter: false,
            })
        } else {
            this.setData({
                drawerSort: false,
                drawerFilter: true,
            })
        }

        this.animation = animation;
        animation.translateX('100%').step();
        this.setData({
            animationData: animation.export(),
            drawerDisplay: true
        })

        setTimeout(function() {
            animation.translateX(0).step();
            this.setData({
                animationData: animation
            })
        }.bind(this), 200)
    },
    // 关闭抽屉
    closeFilterDrawer() {
        this.setData({
            drawerDisplay: false,
        })
    },
    // 获取开始时间
    bindDateStart(e) {
        this.setData({
            dateStart: e.detail.value
        })
    },
    // 获取结束时间
    bindDateEnd(e) {
        this.setData({
            dateEnd: e.detail.value
        })
    },
    // 获取咨询数量
    getReadAmount() {
        wx.http({
            url: wx.api.consultantReadAmount,
            token: this.data.userToken,
            method: 'GET',
        }).then(res => {
            if (res.status_code == 0) {
                // 更新数据
                this.setData({
                    readAmount: res.data,
                })
                // 加载完成
                wx.hideLoading();
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 获取咨询数据
    getConsultData(type) {
        let consultData = this.data.consultData;
        // 默认参数
        let curParams = {
            is_read: this.data.readState
        };
        // 合并筛选条件
        let filterDataset = this.data.filterDataset;
        if (filterDataset) {
            curParams = Object.assign(curParams, filterDataset);
        }
        // 判断加载方式
        if (type == 'add') {
            curParams['page'] = consultData.current_page + 1
        }

        wx.http({
            url: wx.api.consultantTodayConsult,
            token: this.data.userToken,
            method: 'GET',
            data: curParams
        }).then(res => {
            if (res.status_code == 0) {
                let curData = res.data.consulting;
                if (type == 'add') {
                    // 添加：追加数据
                    this.setData({
                        consultData: curData,
                        ['consultData.data']: consultData.data.concat(curData.data)
                    })
                    // 下拉加载提示
                    this.bindDownLoadTips(curData.current_page, curData.last_page);
                } else {
                    // 默认：重置数据
                    this.setData({
                        consultData: curData
                    })
                    // 关闭抽屉
                    this.closeFilterDrawer();
                }
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 筛选提交
    bindFilter(e) {
        let curDataset = e.detail.value;
        // 时间参数初始化
        this.setData({
            dateStart: '',
            dateEnd: ''
        })
        // 赋值
        this.setData({
            filterDataset: curDataset
        })
        // 请求接口
        this.getConsultData();
    },
    // 下拉加载
    bindDownLoad() {
        const curData = this.data.consultData;
        if (curData.current_page != curData.last_page) {
            this.getConsultData('add');
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