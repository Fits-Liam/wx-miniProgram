var serverUrl = 'https://we.leapoon.com';

const api = { 
    // 全局：获取验证码
    getMobileCode: serverUrl + '/api/accounts/send_mobile_code',
    // 全局：转发文章/名片
    share: serverUrl + '/api/transmits',
    // 全局：开始计时/累计停留时间
    stayTimes: serverUrl + '/api/stay_times',
    
    // 认证：登录 (code)
    accountsLogin: serverUrl + '/api/accounts/login',
    // 认证：登录 (session_key)
    accountsSession: serverUrl + '/api/accounts/session_key_login',
    // 认证：更新昵称和头像信息
    accountUpdateInfo: serverUrl + '/api/accounts/update_wx_info',

    // 顾问：获取顾问名片信息
    consultantCard: serverUrl + '/api/consults/visiting_card',
    // 顾问：更新名片基础信息
    consultantCardUpdate: serverUrl + '/api/consults/update_base_info',
    // 顾问：数据统计
    consultantAnalysis: serverUrl + '/api/consults/analysis',
    // 顾问：今日访客
    consultantTodayVisitor: serverUrl + '/api/consults/today_viewers',
    // 顾问：今日咨询
    consultantTodayConsult: serverUrl + '/api/consults/consulting',
    // 顾问：咨询详情
    consultantConsultDetail: serverUrl + '/api/consults/consulting_detail',
    // 顾问：客户浏览记录
    consultantViewHistroy: serverUrl + '/api/consults/view_history', 
    // 顾问：周期内访问量最高的10篇文章
    consultantArticlesTtop: serverUrl + '/api/consults/articles_top',
    // 顾问：周期内访问我最高10个顾客
    consultantCustomersTop: serverUrl + '/api/consults/customers_top',
    // 顾问：全部客户
    consultantAllCustomers: serverUrl + '/api/consults/my_all_customers',
    // 顾问：更新拨打客户手机号次数
    consultantCallCount: serverUrl + '/api/customer_ships/update_call_times',
    // 顾问：我的客户
    consultantMyCustomers: serverUrl + '/api/consults/customers',
    // 顾问：已咨询/未咨询/所有客户数
    consultantConsultAmount: serverUrl + '/api/consults/consulting_count',
    // 顾问：已读/未读/全部咨询数
    consultantReadAmount: serverUrl + '/api/consults/read_consulting_count',
    // 顾问：客户详情
    consultantDetail: serverUrl + '/api/consults/customer_detail',
    // 顾问：录入客户到CRM
    consultantSubmitCrm: serverUrl + '/api/consults/submit_customer',
    // 顾问：查询客户向我提交的信息列表
    consultantSearchRecord: serverUrl + '/api/consults/submit_info_records',
    // 顾问：推荐文章给客户
    consultantRecommend: serverUrl + '/api/messages/consult_recommend',
    // 顾问：客户姓名和手机号
    consultantSearchBaseInfo: serverUrl + '/api/consults/customer_base_info',

    // 合作伙伴：所在渠道绑定的顾问列表
    partnerConsultant: serverUrl + '/api/user_channel_consults',
    // 合作伙伴：推荐客户给顾问
    partnerIntroCustomer: serverUrl + '/api/partners/intro_customer',
    // 合作伙伴：获取某客户是否被推荐
    partnerIntroCheck: serverUrl + '/api/partners/check_customer_is_recommend',

    // 模版：文章列表、创建
    templates: serverUrl + '/api/templates',
    // 模版：文章列表、添加
    templatesArticles: serverUrl + '/api/template_articles',
    // 模版：文章批量删除
    templatesArticlesDel: serverUrl + '/api/template_articles/batch_destroy',

    // 文章：搜索
    searchArticle: serverUrl + '/api/articles/search',
    // 文章：评估
    assessArticle: serverUrl +'/api/articles/assess',
    // 文章：咨询分类
    articleType: serverUrl + '/api/tool_types',
    // 文章：根据文章ID获取文章详情
    articleSearch: serverUrl + '/api/articles/detail',

    // 客服：更新在线状态
    servicesOnlineStatus: serverUrl + '/api/customer_services/update_online_status',

    // 我的：专属顾问
    profileMyConsults: serverUrl + '/api/customers/my_consults',
    // 我的：获取微信基本信息
    profileWxInfo: serverUrl + '/api/customers/get_wx_info',
    // 我的：更新手机号和姓名
    profileUpdateInfo: serverUrl + '/api/customers/update_mobile_username',
    // 我的：自测评估列表
    profileAssessList: serverUrl + '/api/customers/my_assess_articles',
    // 我的：服务进度
    profileSchedule: serverUrl + '/api/customers/server_progress',

    // 客户：我的专属顾问
    customerMyConsults: serverUrl + '/api/customers/my_consults',
    // 客户：获取微信基本信息
    customerWxInfo: serverUrl + '/api/customers/get_wx_info',
    // 客户：更新手机号和姓名
    customerUpdateInfo: serverUrl + '/api/customers/update_mobile_username',


    //首页banner
    banneInfo: serverUrl + '/api/articles/banner',
    //海外移民
    overseaInfo: serverUrl + '/api/countries',
    //海外移民 - 国家项目
    overseaEvents: serverUrl + '/api/events',
    //海外移民 - 项目列表
    overseaEveDeatial: serverUrl + '/api/event_types',
    //海外移民 - 项目文章
    overseaProjectArt: serverUrl + '/api/articles/type',
    //海外移民 - 筛选
    overseaProjecFilter: serverUrl + '/api/articles/tool_types',
    //文章类型 - 活动
    articlesAct: serverUrl + '/api/articles/activity',
    //标签 - 二级标签
    tag_sub: serverUrl + '/api/tags/sub',
    //标签 - 筛选文章
    articalsubs: serverUrl + '/api/articles/tag',
    //区域城市
    areas: serverUrl + '/api/areas',
    //文章类型 - 资讯
    information: serverUrl + '/api/articles/information',
    //消息列表
    messageList: serverUrl + '/api/messages',
    //与某人消息列表
    someOneList: serverUrl + '/api/messages/someone_list',
    //专属顾问
    myConsults: serverUrl + 'api/customers/my_consults',
    //意向项目
    projectList: serverUrl + '/api/projects',
    //提交意向
    submit_project: serverUrl + '/api/intentions',
    //浏览记录
    browsing_history: serverUrl + '/api/visit_records',
    //某一级标签的文章列表
    parent_tag: serverUrl + '/api/articles/parent_tag',
    //留学教育对应子类文章
    edu_child_type: serverUrl + '/api/articles/two_tool_type',
    //检测未读消息
    unReadMessage: serverUrl + '/api/messages/unread_count',
    //七牛上传附件
    uploadQiNiuFile: serverUrl + '/api/qiniu/uptoken',
    //收藏/取消收藏文章
    collectArtical: serverUrl + '/api/favorites',
    //更新某个模版内所有文章的排序
    updateTemArticalSort: serverUrl + '/api/template_articles/update_articles_sort',
    //更新某个模版内单篇的排序
    updateSingleTemArticalSort: serverUrl +  '/api/template_articles/update_info',
	//搜索标签列表
	searchTags: serverUrl + '/api/tags/search_tags',
	//搜索标签列表
	articalTags: serverUrl + '/api/articles/tags',
	//资讯文章(新)
	infomation_total_articles: serverUrl + '/api/articles/tags_information'
}

module.exports = api;