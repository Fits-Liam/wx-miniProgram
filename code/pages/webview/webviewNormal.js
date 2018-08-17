const app = getApp();

Page({
    data: {
        url: '', // H5链接
    },
    onLoad(opts) {
        if ( opts.type == 'assess' ) {
            this.setData({
                url: opts.domian + '?c=' + opts.c + '&customer_id=' + opts.customer_id
            });
        }else{
            this.setData({
                url: opts.domian
            });
        }
    },
})