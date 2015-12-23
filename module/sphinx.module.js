ext.modules.sphinx = {
  name: 'sphinx',
  dText: 'Sphinx',
  pages: [{
    path_name: '/sphinx.php',
    options: {}
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

    module.fixEmptySearch();
  },

  loadModule: function() {
    var module = this;
    module.loaded = true;

    module.dbg('loadModule : Starting');

    if (opt.get(ext.modules.torrent_list.name, 'imdb_suggest')) {
      module.suggestMore();
    }

    module.dbg('loadModule : Ready');
  },

  suggestMore: function() {
    var module = this;
    var searchQuery = $('#sphinxinput').val();
    if (searchQuery) {
      module.dbg('suggestMore : Query [%s]', searchQuery);
      loadingHtml = '<center><img src="' + utils.getExtensionUrl('images/loading.gif') +
        '" /><br />Analyse des entrailles d\'IMDB</center>';
      utils.appendFrame({
        title: ext.displayName + ' IMDB Suggestions',
        data: loadingHtml,
        id: 'suggest',
        relativeToObj: $('.categories_list'),
        top: -14,
        left: 840
      });

      // Try to get some results from IMDB: 4 + 4 max
      utils.grabPage({
        host: 'https://api.thetabx.net',
        path: '/imdb/translate/3/' + encodeURIComponent(searchQuery)
      }, function(imdb) {
        module.dbg('suggestMore : Got data back');
        if (!imdb.results || imdb.results.length === 0) {
          $('#ext_suggest_data').html('Désolé, rien trouvé !');
          return;
        }
        var suggestions = [];
        $.each(imdb.results, function(imdbId, movie) {
          module.dbg('suggestMore : IMDB [%s]', imdbId);
          $.each(movie, function(titleType, title) {
            suggestions.push(title);
          });
        });
        var suggestionsHtml = '';
        $.map(suggestions, function(movieName, i) {
          if ($.inArray(movieName, suggestions) === i) {
            suggestionsHtml += '<a href="' + utils.craftUrl({
              host: ext.url.host,
              path: ext.url.path,
              params: {
                q: encodeURIComponent(movieName)
              }
            }) + '">' + movieName + '</a><br />';
          }
        });
        // { id, classes, title, header, data, relativeToId, relativeToObj, relativeToWindow, top, left, css,
        // buttons = [ /* close is by default */ { b_id, b_text, b_callback} ], underButtonsText }
        $('#ext_suggest_data').html(suggestionsHtml);
      });
    }
  },

  fixEmptySearch: function() {
    $('#form.search').submit(function(e) {
      if ($(this).find('#sphinxinput').val() == '') {
        $(this).find('select[name=exact]').val(0);
      }
    });
  },
};
