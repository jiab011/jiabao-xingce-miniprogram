Page({
  data: {
    libraries: require("../lib.js").libraries
  },
  open: function (i) {
    require("../_shared/utils/idiom-navigation.js").openLibrary(i.currentTarget.dataset.id);
  }
});
