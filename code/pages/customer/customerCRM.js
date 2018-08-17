// 获取应用实例
const app = getApp()

Page({
    data: {
        userRole: '', // 用户角色
        userToken: '', // 用户TOKEN
        queryId: '', // 页面参数ID
        baseInfo: '', // 用户基本信息
        modalDisplay: false, // 显示弹框
        modalMsg: '', // 弹框提示
        contactObject: [{
            id: 0,
            name: '手机号',
            value: 'mobile'
        }, {
            id: 1,
            name: '微信号',
            value: 'wechat'
        }, {
            id: 2,
            name: '邮箱',
            value: 'email'
        }],
        contactIndex: 0,
        typeObject: [
            '请选择 客户分类',
            'A', 'B', 'C', 'D'
        ],
        typeIndex: 0,
        countryObject: [
            '请选择 意向国家',
            '美国', '加拿大', '新加坡', '香港', '英国', '葡萄牙', '西班牙', '圣基茨和尼维斯', '安提瓜和巴布达', '匈牙利', '格林纳达', '多米尼克', '马来西亚', '格林纳达', '塞浦路斯', '希腊', '澳大利亚', '新西兰', '马耳他', '瓦努阿图'
        ],
        countryIndex: 0,
        consultantObject: [{
            id: 0,
            name: '请选择 顾问',
            value: ''
        }],
        consultantIndex: 0
    },
    onLoad(opts) {
        const time = wx.util.formatTime(new Date()).substring(0, 10);
        this.setData({
            dateStart: time,
            dateEnd: time,
            dateEndLimit: time,
            queryId: opts.id
        })
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
        this.bindBaseInfo();
        if (this.data.userRole == 'partner') {
            this.bindIntroCheck();
        }
    },
    bindPickerContact(e) {
        this.setData({
            contactIndex: e.detail.value
        })
    },
    bindPickerType(e) {
        this.setData({
            typeIndex: e.detail.value
        })
    },
    bindPickerCountry(e) {
        this.setData({
            countryIndex: e.detail.value
        })
    },
    bindPickerConsultant(e) {
        this.setData({
            consultantIndex: e.detail.value
        })
    },
    closeModal() {
        wx.navigateBack();
    },
    bindSubmitCrm(e) {
        const curVal = e.detail.value;
        let validateRegExp = {
            mobile: /^[1][0-9][0-9]{9}$/,
            email: /\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/
        }
        let nowData;
        let contact_value = this.data.contactObject[this.data.contactIndex].value // 联系方式

        curVal['crm_code'] = 1; // 传递类型
        curVal[contact_value] = curVal.contact_value; // 手机、邮箱、微信
        if (this.data.typeIndex == 0) {
            curVal['customer_type'] = '';
        } else {
            curVal['customer_type'] = this.data.typeObject[this.data.typeIndex]
        }
        if (this.data.countryIndex == 0) {
            curVal['intention_countries'] = '';
        } else {
            curVal['intention_countries'] = this.data.countryObject[this.data.countryIndex]
        }
        // 合作伙伴下显示顾问
        if ( this.data.userRole == 'partner' ) {
            if (this.data.consultantIndex == 0) {
                curVal['customer_wx_id'] = '';
            } else {
                curVal['customer_wx_id'] = this.data.consultantObject[this.data.consultantIndex].value
            }
        }

        // 表单完整性判断
        for (var k in curVal) {
            if ( curVal[k] == '' || curVal[k] == undefined ) {
                wx.showToast({
                    title: '请填写完整',
                    icon: 'none'
                });
                return false;
            }
        }

        // 隐私手机号转真实手机号
        if ( curVal.contact_value == this.data.baseInfo.mobile ) {
            curVal['mobile'] = this.data.baseInfo.real_mobile
        }
       // 验证手机号码
       if ( contact_value == 'mobile' && !validateRegExp.mobile.test(curVal.mobile)) {
            wx.showToast({
                title: '请输入正确的手机号',
                icon: 'none'
            });
            return false;
        }
        // 验证邮箱
        if ( contact_value == 'email' && !validateRegExp.email.test(curVal.contact_value)) {
            wx.showToast({
                title: '请输入正确的邮箱',
                icon: 'none'
            });
            return false;
        }

        wx.http({
            url: wx.api.consultantSubmitCrm,
            token: this.data.userToken,
            method: 'POST',
            data: curVal
        }).then(res => {
            console.log(res)
            // 判断接口请求状态 和 判断CRM请求状态
            if (res.status_code == 0 && res.data) {
                console.log(res)
                this.setData({
                    modalDisplay: true,
                    modalMsg: res.message
                })
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 2000
                });
            }
        }).catch(error => {
            console.log('请求错误：', error);
        })
    },
    // 绑定基础信息
    bindBaseInfo() {
        wx.http({
            url: wx.api.consultantSearchBaseInfo,
            token: this.data.userToken,
            method: 'GET',
            data:{
                wx_id: this.data.queryId
            }
        }).then(res => {
            if (res.status_code == 0) {
                 if ( res.data.mobile ) {
                    this.setData({
                        baseInfo: res.data,
                        ['baseInfo.mobile']: res.data.mobile.replace(/^(\d{3})\d{4}(\d{4})$/,'$1****$2'),
                        ['baseInfo.real_mobile']: res.data.mobile
                    });
                }else{
                    this.setData({
                        baseInfo: res.data
                    });
                }
                // 加载完成
                wx.hideLoading();
            }
        }).catch(error => {
            console.log('请求错误：', error);
        });
    },
    // 检测某客户是否已被推荐
    bindIntroCheck(e) {
        wx.http({
            url: wx.api.partnerIntroCheck,
            token: this.data.userToken,
            method: 'GET',
            data:{
                customer_wx_id: this.data.queryId
            }
        }).then(res => {
            let consultantObject = this.data.consultantObject;
            if (res.data.recommend_consult) {
                let curData = res.data.recommend_consult;
                let newOption = {
                    id: 1,
                    name: curData.nickname,
                    value: curData.consult_wx_id
                }
                consultantObject.push(newOption);
            }else{
                let curData = res.data.channel_consults;
                curData.forEach((v,i) => {
                    let newOption = {
                        id: i,
                        name: v.nickname,
                        value: v.wx_id
                    };
                    consultantObject.push(newOption);
                })
            }
            this.setData({
                consultantObject: consultantObject
            })
        }).catch(error => {
            console.log('请求错误：', error);
        })
    }
})