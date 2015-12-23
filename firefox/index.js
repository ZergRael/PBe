// Import the page-mod API
var pageMod = require("sdk/page-mod");
// Import the self API
var self = require("sdk/self");
// Import simple-storage API
var sstorage = require("sdk/simple-storage");
pageMod.PageMod({
  include: ["*.phxbit.com"],
  contentScriptFile: [
    self.data.url("lib/jquery-2.1.4.min.js"),
    self.data.url("lib/utils.js"),
    self.data.url("options.js"),
    self.data.url("main.js"),
    self.data.url("module/global.module.js"),
    self.data.url("module/endless_scrolling.module.js"),
    self.data.url("module/torrent_list.module.js"),
    self.data.url("module/sphinx.module.js"),
    self.data.url("module/torrent.module.js"),
    self.data.url("module/twits.module.js"),
    self.data.url("module/forums.module.js"),
    self.data.url("module/logs.module.js"),
    self.data.url("module/bookmark.module.js"),
    self.data.url("module/my.module.js"),
    self.data.url("loader.js")
  ],
  contentScriptOptions: {
    "images/loading.gif": self.data.url("images/loading.gif"),
    "images/bookmark.png": self.data.url("images/bookmark.png"),
    "images/rss.png": self.data.url("images/rss.png"),
    "images/nfo.png": self.data.url("images/nfo.png"),
    "images/download.png": self.data.url("images/download.png"),
    "images/watch.png": self.data.url("images/watch.png"),
    "images/watch_new.png": self.data.url("images/watch_new.png"),
    "images/Classic/to_top_small.png": self.data.url("images/Classic/to_top_small.png"),
    "images/Classic/endless_scrolling_active.png": self.data.url("images/Classic/endless_scrolling_active.png"),
    "images/Classic/endless_scrolling_paused.png": self.data.url("images/Classic/endless_scrolling_paused.png"),
    "images/LordVal/to_top_small.png": self.data.url("images/LordVal/to_top_small.png"),
    "images/LordVal/endless_scrolling_active.png": self.data.url("images/LordVal/endless_scrolling_active.png"),
    "images/LordVal/endless_scrolling_paused.png": self.data.url("images/LordVal/endless_scrolling_paused.png"),
    "main.css": self.data.url("main.css")
  },
  contentScriptWhen: "ready",
  onAttach: function(worker) {
    worker.port.on("storageGet", function(key) {
      worker.port.emit("storageGet" + key, sstorage.storage[key]);
    });
    worker.port.on("storageSet", function(obj) {
      sstorage.storage[obj.key] = obj.val;
    });
  }
});