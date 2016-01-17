ext.modules.badge = {
  name: 'badge',
  dText: 'Badges',
  pages: [{
    path_name: '/my.php',
    params: {
      action: 'badge'
    },
  }],
  loaded: false,
  prepared: false,
  badges: [{
    name: 'birthday',
    b: [{
      name: 'Minime',
      threshold: 1,
      img: 'https://phxbit.com/static/images/badges/birthday1.png',
      hover: '1 mois déjà, encore un petit nouveau',
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/birthday2.png',
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/birthday3.png',
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/birthday4.png',
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/birthday5.png',
      hover: false,
    }],
    val: false,
    data: false
  }, {
    name: 'uploads',
    b: [{
      name: false,
      threshold: 1,
      img: 'https://phxbit.com/static/images/badges/ul1.png',
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/ul2.png',
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/ul3.png',
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/ul4.png',
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/ul5.png',
      hover: false,
    }],
    val: false,
    data: false
  }, {
    name: 'downloads',
    b: [{
      name: 'Micro SD',
      threshold: 1,
      img: 'https://phxbit.com/static/images/badges/dl1.png',
      hover: '1 torrent téléchargé dans la boite',
    }, {
      name: 'Clef Usb',
      threshold: 10,
      img: 'https://phxbit.com/static/images/badges/dl2.png',
      hover: '10 torrents téléchargés on devient vite accro attention !',
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/dl3.png',
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/dl4.png',
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/dl5.png',
      hover: false,
    }],
    val: false,
    data: false
  }, {
    name: 'invitations',
    b: [{
      name: false,
      threshold: 1,
      img: 'https://phxbit.com/static/images/badges/invite1.png',
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/invite2.png',
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/invite3.png',
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/invite4.png',
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/invite5.png',
      hover: false,
    }],
    val: false,
    data: false
  }, {
    name: 'topics',
    b: [{
      name: 'Journaliste',
      threshold: 1,
      img: 'https://phxbit.com/static/images/badges/ftopic1.png',
      hover: '1 topic commencé sur le forum !',
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/ftopic2.png',
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/ftopic3.png',
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/ftopic4.png',
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/ftopic5.png',
      hover: false,
    }],
    val: false,
    data: false
  }, {
    name: 'posts',
    b: [{
      name: 'Timide',
      threshold: 1,
      img: 'https://phxbit.com/static/images/badges/fpost1.png',
      hover: '1er post sur le forum !',
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/fpost2.png',
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/fpost3.png',
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/fpost4.png',
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: 'https://phxbit.com/static/images/badges/fpost5.png',
      hover: false,
    }],
    val: false,
    data: false
  }, {
    name: 'requests',
    b: [{
      name: false,
      threshold: 1,
      img: false,
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: false,
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: false,
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: false,
      hover: false,
    }, {
      name: false,
      threshold: false,
      img: false,
      hover: false,
    }],
    val: false,
    data: false
  }],
  defaultImg: 'https://phxbit.com/static/images/badges/soon.png',

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

    if (opt.get(module.name, 'reveal')) {
      module.reveal();
    }
    if (opt.get(module.name, 'progress')) {
      if (gData.isDataUsable(module.name)) {
        module.addProgress();
      } else {
        module.fetchProgress();
      }
    }

    module.dbg('loadModule : Ready');
  },

  reveal: function() {
    var module = this;
    module.dbg('reveal : Started');
    $('#contenu table').each(function(i) {
      $(this).find('tr:nth-child(2) td:not(:first)').each(function(bI) {
        var b = module.badges[i].b[bI];
        var $img = $(this).find('img').first();
        if ($img.attr('src') != module.defaultImg) {
          return;
        }

        if (b.name) {
          $(this).find('small center').text(b.name);
        }
        if (b.img) {
          $img.attr('src', b.img).css('opacity', 0.3);
        }
        if (b.hover) {
          $img.attr('title', b.hover);
        }
      });
    });
    module.dbg('reveal : Done');
  },

  addProgress: function() {
    var module = this;
    module.dbg('addProgress : Started');
    $('#contenu table').each(function(i) {
      var bBlock = module.badges[i];
      if (bBlock.val === false) {
        return;
      }

      $(this).find('tr:nth-child(2) td:not(:first)').each(function(bI) {
        var b = bBlock.b[bI];
        if (b.threshold === false) {
          return;
        }
        $(this).append(
          $('<div>', {
            class: 'ext_badge_progress'
          }).append(
            $('<div>', {
              class: 'ext_badge_area'
            }).append(
              $('<div>', {
                class: 'ext_badge_bar' + (bBlock.val >= b.threshold ? ' ext_badge_valid' : '')
              })
              .css('width', ((bBlock.val >= b.threshold ? b.threshold : bBlock.val) / b.threshold * 100) +
                '%'), $('<div>', {
                class: 'ext_badge_num',
                text: (bBlock.val >= b.threshold ? b.threshold : Math.round(bBlock.val)) + '/' + b.threshold
              })
            )
          )
        );
      });
    });
    module.dbg('addProgress : Done');
  },

  fetchProgress: function() {
    var module = this;
    //gData.setFresh(module.name);
  },
};
