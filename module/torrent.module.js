ext.modules.torrent = {
  name: 'torrent',
  dText: 'Fiche torrent',
  pages: [{
    path_name: '/torrent.php',
    params: {
      id: '*'
    },
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

    var name = $('#contenu .separate:first').text().trim();
    if (name.indexOf('Erreur : 404') == -1) {
      module.torrentName = name;
      module.torrentId = ext.url.params.id;
      module.prepared = true;
    }
  },

  loadModule: function() {
    var module = this;
    module.loaded = true;

    module.dbg('loadModule : Starting');
    // Execute functions

    module.addBookmarkStar(module.torrentId);
    module.dupeCheck();

    module.dbg('loadModule : Ready');
  },

  addBookmarkStar: function(torrentId) {
    var bookmarkedTorrents = gData.get('bookmarks', 'torrents');
    if (bookmarkedTorrents.indexOf(torrentId) != -1) {
      $('#contenu .separate:first').prepend('<img src="' + utils.getExtensionUrl('images/bookmark.png') +
        '" />');
    }
  },

  dupeCheck: function() {
    var module = this;
    if (!opt.get(module.name, 'dupecheck') || !module.torrentName) {
      return;
    }
    utils.grabPage({path: '/dupe.php', params: {q: module.torrentName, action: 'search'}}, function(aj) {
      var line = $(aj).find('#dupe_list tr:nth(1) .dates');
      if (line && line.length) {
        var pretime = line.text().trim();
        var $posttime = $('img[alt="Ajouté le"]').parent();
        var posttime = $posttime.html().trim();
        $posttime.html(posttime + ' - ' + utils.shortDurationFormat(pretime, posttime) +
        ' after pre (' + pretime + ')');
        $('#contenu .separate:first').prepend('<img src="https://phxbit.com/static/images/torrents/dupe.png" />');
      }
    });
  },
};
