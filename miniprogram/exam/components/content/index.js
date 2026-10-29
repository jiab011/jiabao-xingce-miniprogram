Component({
  properties: {
    parts: {
      type: Array,
      value: []
    },
    fontPx: {
      type: Number,
      value: 18
    },
    optionLabel: {
      type: String,
      value: ""
    }
  },
  methods: {
    tapImage: function (t) {
      if (!(Date.now() < (this._skipImageTap || 0))) {
        if (this.data.optionLabel) {
          this.triggerEvent("optiontap", {
            label: this.data.optionLabel
          });
          return;
        }
        this.preview(t);
      }
    },
    longImage: function (t) {
      this._skipImageTap = Date.now() + 700, this.preview(t);
    },
    preview: function (t) {
      var e = t.currentTarget.dataset.src;
      if (e) {
        this.triggerEvent("previewing");
        var i = this.data.parts.filter(function (t) {
          return "image" === t.type && t.src;
        }).map(function (t) {
          return t.src;
        });
        wx.previewImage({
          current: e,
          urls: i
        });
      }
    },
    loaded: function () {
      this.triggerEvent("mediaload");
    }
  }
});
