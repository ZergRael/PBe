// Options array, getters and setters
var opt = {
  options: {
    global: {
      form_validation: {
        defaultVal: true,
        showInOptions: true,
        dispText: 'Validation des formulaires avec ctrl+entrée',
      },
      options_section: {
        defaultVal: false,
        showInOptions: false,
      },
    },
    endless_scrolling: {
      endless_scrolling: {
        defaultVal: true,
        showInOptions: true,
        dispText: 'Endless scrolling sur les pages compatibles',
      },
      adapt_url: {
        defaultVal: true,
        showInOptions: true,
        dispText: 'Adapter l\'url en fonction de la page vue avec l\'ES',
        parentDeep: 1,
        parent: 'endless_scrolling',
      },
      pagination_rewrite: {
        defaultVal: false,
        showInOptions: true,
        dispText: 'Adapter la pagination en fonction de la page vue avec l\'ES',
        parentDeep: 2,
        parent: 'adapt_url',
      },

      main: {
        defaultVal: true,
        showInOptions: true,
        dispText: 'Page d\'accueil',
        tooltip: '/',
        parent: 'endless_scrolling',
        parentDeep: 1,
      },
      sphinx: {
        defaultVal: true,
        showInOptions: true,
        dispText: 'Torrents : Parcourir / Recherche',
        tooltip: '/sphinx.php',
        parent: 'endless_scrolling',
        parentDeep: 1,
      },
      viewforum: {
        defaultVal: true,
        showInOptions: true,
        dispText: 'Forums : Liste des topics',
        tooltip: '/forums.php?action=viewforum',
        parent: 'endless_scrolling',
        parentDeep: 1,
      },
      viewtopic: {
        defaultVal: true,
        showInOptions: true,
        dispText: 'Forums : Lecture de topic',
        tooltip: '/forums.php?action=viewtopic',
        parent: 'endless_scrolling',
        parentDeep: 1,
      },
      logs: {
        defaultVal: true,
        showInOptions: true,
        dispText: 'Logs',
        tooltip: '/logs.php',
        parent: 'endless_scrolling',
        parentDeep: 1,
      },
      req: {
        defaultVal: true,
        showInOptions: true,
        dispText: 'Requests',
        tooltip: '/req.php',
        parent: 'endless_scrolling',
        parentDeep: 1,
      },
      series: {
        defaultVal: true,
        showInOptions: true,
        dispText: 'Mes Séries',
        tooltip: '/series.php',
        parent: 'endless_scrolling',
        parentDeep: 1,
      },
      activity: {
        defaultVal: true,
        showInOptions: true,
        dispText: 'Mon activité',
        tooltip: '/my.php?action=activity',
        parent: 'endless_scrolling',
        parentDeep: 1,
      },
      pause_scrolling: {
        defaultVal: false,
        showInOptions: true,
        dispText: 'Pauser l\'ES lorsqu\'arrivé en fond de page',
        parent: 'endless_scrolling',
        parentDeep: 1,
      },
      button_style: {
        defaultVal: 'LordVal',
        showInOptions: true,
        type: 'select',
        choices: ['LordVal', 'Classic'],
        dispText: 'Style des icônes',
      },

    },
    torrent_list: {
      imdb_suggest: {
        defaultVal: true,
        showInOptions: true,
        dispText: 'Suggestions de recherche grâce à IMDB',
      },
      filter_freeleech: {
        defaultVal: 0,
        showInOptions: false
      },
      filter_nuked: {
        defaultVal: 0,
        showInOptions: false
      },
      auto_refresh: {
        defaultVal: false,
        showInOptions: false
      },
      auto_refresh_color: {
        defaultVal: '#ffa500',
        showInOptions: true,
        type: 'text',
        width: 5,
        regex: /^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$/,
        dispText: 'Couleur (hexa) de la mise en avant des lignes lors de l\'auto-refresh',
      },
      age_column: {
        defaultVal: false,
        showInOptions: true,
        dispText: 'Ajout d\'une colonne d\'age du torrent',
      },
      autoget_column: {
        defaultVal: false,
        showInOptions: true,
        dispText: 'Colonne de boutons d\'ajout direct à l\'autoget',
      },
      bookmark_column: {
        defaultVal: false,
        showInOptions: true,
        dispText: 'Colonne de boutons d\'ajout direct aux bookmarks',
      },
      direct_comments: {
        defaultVal: false,
        showInOptions: true,
        dispText: 'Afficher les commentaires au survol',
      },
      preview: {
        defaultVal: false,
        showInOptions: true,
        dispText: 'Afficher un apercu de la fiche torrent au survol',
      },
      filter_string: {
        defaultVal: true,
        showInOptions: true,
        dispText: 'Afficher un champ de filtrage par chaîne de caractères',
      },
    },
    twits: {
      twit_auto_complete: {
        defaultVal: true,
        showInOptions: true,
        dispText: 'Auto-complétion des twits',
      },
      twit_color: {
        defaultVal: true,
        showInOptions: true,
        dispText: 'Coloration et lien automatique sur les twits',
      }
    },
    twits: {
      twit_auto_complete: {
        defaultVal: true,
        showInOptions: true,
        dispText: 'Auto-complétion des twits',
      },
      twit_color: {
        defaultVal: true,
        showInOptions: true,
        dispText: 'Coloration et lien automatique sur les twits',
      }
    },
    forums: {
      hidable_sigs: {
        defaultVal: false,
        showInOptions: false,
        dispText: 'Rendre les signatures masquables',
      },
      hide_signatures: {
        defaultVal: false,
        showInOptions: false,
        dispText: 'Cacher les signatures par défaut',
        parent: 'hidable_sigs',
        parentDeep: 1,
      },
    },
    torrent: {
      dupecheck: {
        defaultVal: true,
        showInOptions: true,
        dispText: 'Dupecheck & pretime dans la description',
      }
    },
    logs: {
      auto_refresh: {
        defaultVal: false,
        showInOptions: false
      },
      uploads_filter: {
        defaultVal: false,
        showInOptions: false
      },
      delete_filter: {
        defaultVal: false,
        showInOptions: false
      },
      edit_filter: {
        defaultVal: false,
        showInOptions: false
      },
      request_filter: {
        defaultVal: false,
        showInOptions: false
      },
      request_fill_filter: {
        defaultVal: false,
        showInOptions: false
      },
      summary_edit_filter: {
        defaultVal: false,
        showInOptions: false
      },
      summary_new_filter: {
        defaultVal: false,
        showInOptions: false
      }
    },
    shoutbox: {
      no_sound: {
        defaultVal: false,
        showInOptions: true,
        dispText: 'Retirer le son de manière permanente',
      },
      no_avatar: {
        defaultVal: false,
        showInOptions: true,
        dispText: 'Cacher les avatars',
      },
    },
    badge: {
      reveal: {
        defaultVal: false,
        showInOptions: true,
        dispText: 'Afficher les badges manquants',
      },
      progress: {
        defaultVal: true,
        showInOptions: true,
        dispText: 'Afficher la progression',
      }
    }
  },
  // Returns value for module(m) & option(o)
  get: function(m, o) {
    return this.options[m][o].val;
  },
  // Sets value(v) for module(m) & option(o)
  set: function(m, o, v) {
    this.options[m][o].val = v;
    this.save(m);
  },
  // Sets on change callback(c) for module(m) & option(o)
  setCallback: function(m, o, c) {
    this.options[m][o].callback = c;
  },
  // Appends pure nammed(name) data to module(m) & option(o)
  setData: function(m, o, name, data) {
    this.options[m][o][name] = data;
  },
  // Sends to storage
  save: function(m) {
    utils.storage.set(m, this.options[m]);
  },
  // Populate all options values by extracting from storage or default value
  load: function(callback) {
    var requiredCallbacks = 0;
    $.each(this.options, function(m, opts) {
      requiredCallbacks++;
    });
    $.each(this.options, function(m, opts) {
      utils.storage.get(m, function(obj) {
        var values = obj[m];
        $.each(opts, function(o, v) {
          opt.options[m][o].val = (values && values[o] !==
            undefined ? values[o] : v.defaultVal);
        });
        if (--requiredCallbacks === 0) {
          callback();
        }
      });
    });
  },
  exportAll: function() {
    var tempStore = {};
    $.each(this.options, function(m, opts) {
      tempStore[m] = {};
      $.each(opts, function(o, v) {
        tempStore[m][o] = v.val;
      });
    });
    return tempStore;
  },
  importAll: function(obj) {
    $.each(this.options, function(m, opts) {
      $.each(opts, function(o, v) {
        opt.options[m][o].val = (obj[m] && obj[m][o] !== undefined ?
          obj[m][o] : v.defaultVal);
      });
      opt.save(m);
    });
  }
};

var gData = {
  data: {
    bookmarks: {
      torrents: [],
      age: 0
    },
    global: {
      ak: false,
      age: 0,
    }
  },
  threshold: {
    bookmarks: 24 * 60 * 60 * 1000,
  }
    global: 4 * 7 * 24 * 60 * 60 * 1000,
  },
  setFresh: function(m) {
    this.set(m, 'age', new Date().getTime());
  },
  isDataUsable: function(m) {
    return new Date().getTime() < (this.get(m, 'age') + this.threshold[m]);
  },
  set: function(m, o, v) {
    this.data[m][o] = v;
    this.save(m);
  },
  get: function(m, o) {
    return this.data[m][o];
  },
  save: function(m) {
    utils.storage.data_set(m, this.data[m]);
  },
  load: function(callback) {
    var requiredCallbacks = 0;
    $.each(this.data, function(m, data) {
      requiredCallbacks++;
    });
    $.each(this.data, function(m, data) {
      utils.storage.data_get(m, function(obj) {
        var values = obj[m];
        $.each(data, function(o, v) {
          gData.data[m][o] = (values && values[o] !== undefined ?
            values[o] : v);
        });
        if (--requiredCallbacks === 0) {
          callback();
        }
      });
    });
  },
  exportAll: function() {
    return this.data;
  },
  importAll: function(obj) {
    $.each(this.data, function(m, data) {
      $.each(data, function(o, v) {
        gData.data[m][o] = (obj[m] && obj[m][o] !== undefined ? obj[
          m][o] : v);
      });
      gData.save(m);
    });
  }
};
