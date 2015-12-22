ext.modules.torrent = {
  name: 'torrent',
  dText: 'Fiche torrent',
  pages: [{
    path_name: '/torrent.php',
    options: {
      loading: '#torrent_comments p:last'
    }
  }],
  loaded: false,
  prepared: false,

  dbg: function() {
    utils.dbg(this.name, arguments);
  },

  prepare: function(mOptions) {
    var module = this;
    module.options = mOptions;
    module.prepared = true;
  },

  loadModule: function() {
    var module = this;
    module.loaded = true;

    module.dbg('loadModule : Starting');
    // Execute functions

    module.addBookmarkStar(ext.url.params.id);

    module.dbg('loadModule : Ready');
  },

  addBookmarkStar: function(torrentId) {
    var bookmarkedTorrents = gData.get('bookmarks', 'torrents');
    if (bookmarkedTorrents.indexOf(torrentId) != -1) {
      $('#contenu .separate:first').prepend('<img src="' + utils.getExtensionUrl('images/bookmark.png') +
        '" />');
    }
  },
};
