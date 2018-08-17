// 打电话
const callPhone = e => {
    const number = e.target.dataset.number;
    wx.makePhoneCall({
        phoneNumber: number,
        successs: (res) => {
            console.log(res);
        }
    })
}
// 开始聊天
const startChat = e => {
    const id = e.target.dataset.id;
    const name = e.target.dataset.name;
    const role = e.target.dataset.role;
    if ( role && role != 'customer' ) {
        wx.navigateTo({
            url: '../message/message'
        })
    }else{
        wx.navigateTo({
            url: '../message/messageChat?wx_id=' + id + '&user_name=' + name
        })
    }
}
// 去子页
const toSubpage = e => {
    const pages = getCurrentPages();
    const curPath = pages[pages.length-1].route.split('/')[1];
    const path = e.currentTarget.dataset.path;
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
        url: '../'  + curPath + '/' + path + '?id=' + id
    })
}
// 去其他页面
const toPage = e => {
    const path = e.currentTarget.dataset.path;
    const id = e.currentTarget.dataset.id;
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({
        url: '../'  + path + '?id=' + id + '&type=' + type
    })
}

// 显示消息提示框
const showToast = text => wx.showToast({
    title: text,
    icon: 'none',
    duration: 1500
});

module.exports = {
    callPhone,
    startChat,
    toSubpage,
    toPage,
    showToast,
}