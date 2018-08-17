Component({
	properties: {
		pageTag: {
			type: String,
			value: '',
		},
		roleTag: {
			type: String,
			value: '',
		},
		msgTips: {
			type: Boolean,
			value: false
		},
	},
	data: {},
	methods: {
		toPage(e) {
			const _toPath = e.currentTarget.dataset.path;
			const _selfPath = e.currentTarget.dataset.self;
			if (_toPath == _selfPath) return false;
			wx.redirectTo({
				url: '../../pages/' + _toPath + '/' + _toPath
			})
		}
	}
})