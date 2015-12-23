ext.modules.twits = {
  name: 'twits',
  dText: 'Twits',
  pages: [{
    path_name: '/forums.php',
    params: {
      action: 'viewtopic'
    },
    options: {
      twitColor: '.comment',
      twitAutocomplete: '#quickpost, .comment textarea',
    }
  }, {
    path_name: '/forums.php',
    params: {
      action: 'new'
    },
    options: {
      twitAutocomplete: '#content_message, div.wysibb-text-editor',
      wysiwyg: '#content_message',
    }
  }, {
    path_name: '/blog.php',
    params: {
      id: '*'
    },
    options: {
      twitColor: '.blog_comment',
      twitAutocomplete: '.blog_responde textarea',
    }
  }, {
    path_name: '/torrent.php',
    params: {
      id: '*'
    },
    options: {
      twitColor: '.com_text',
      twitAutocomplete: '#content_message, div.wysibb-text-editor',
      wysiwyg: '#content_message',
    }
  }, {
    path_name: '/shoutbox.php',
    options: {
      twitAutocomplete: '#message',
      twitColorAjaxed: '#shoutbox_contain',
    }
  }],
  loaded: false,
  prepared: false,
  autoCKey: 9,
  iPseudo: false,
  pseudoMatches: [],
  pseudos: {},
  eventCallbacks: [],

  dbg: function() {
    utils.dbg(this.name, arguments);
  },

  prepare: function(mOptions) {
    var module = this;
    module.options = mOptions;
    module.prepared = true;

    if (module.options.wysiwyg) {
      module.insertWysiwygScript();
    }
  },

  loadModule: function() {
    var module = this;
    module.loaded = true;

    // Twit autocomplete
    if (module.options.twitAutocomplete) {
      $(document).on('keydown', module.options.twitAutocomplete, function(e) {
        module.checkAutoCompletion(e, $(this));
      });
    }

    // Building pseudos hashmap
    module.buildPseudosHashmap();

    // Twit colorization
    if (module.options.twitColor) {
      $(document).on('recolor_twits', function() {
        module.colorizeTwits();
      });
      module.colorizeTwits();
    }

    $(document).on('endless_scrolling_insertion_done', function() {
      module.buildPseudosHashmap();
    });

    module.dbg('loadModule : Ready');
  },

  checkAutoCompletion: function(e, $e) {
    var module = this;

    if (module.options.wysiwyg && $e.is('div')) {
      var wysiwyg = module.options.wysiwyg;
    }
    if (opt.get(module.name, 'twit_auto_complete') && e.which == module.autoCKey) {
      module.dbg('autoComplete : Trying to autoc');
      if (wysiwyg) {
        module.sendWysiwygCommand(wysiwyg, 'getbbcode', function(bbcode) {
          module.autoComplete(e, $e, wysiwyg, bbcode);
        }, null);
      } else {
        module.autoComplete(e, $e, wysiwyg);
      }
    } else {
      module.iPseudo = false;
    }
  },

  autoComplete: function(e, $e, wysiwyg, bbcode) {
    var module = this;

    if (wysiwyg) {
      var text = bbcode;
      var selStart = bbcode.length - 4;
      var selEnd = bbcode.lastIndexOf('   ');
    } else {
      var text = $e.val();
      var selStart = $e.get(0).selectionStart;
      var selEnd = $e.get(0).selectionEnd;
    }

    var matchingAts = text.match(/\B@\w+/g);
    if (!matchingAts || selStart != selEnd) {
      return;
    }

    // Find out if the cursor is near a matching at
    var matchingAtToAuto = -1;
    var lastMatchEnd = 0;
    var matchStart = 0;
    $.each(matchingAts, function(i, atPseudo) {
      matchStart = text.indexOf(atPseudo, lastMatchEnd);
      module.dbg('autoComplete : Finding the right match [%s] %d <= %d <= %d', atPseudo, matchStart, selStart,
        matchStart + (atPseudo.length + 1));
      if (matchStart <= selStart && selStart <= matchStart + (atPseudo.length + 1)) {
        matchingAtToAuto = i;
        module.dbg('autoComplete : Got it !');
        return false;
      }
      // Avoid matching the same occurence multiple times and force cycling
      lastMatchEnd = matchStart + (atPseudo.length + 1);
    });
    // Cursor is too far away, end it
    if (matchingAtToAuto == -1) {
      return;
    }

    e.preventDefault();
    var textToAutoc = matchingAts[matchingAtToAuto]; // Take match we found
    if (module.iPseudo === false) {
      module.dbg('autoComplete : First tab - Build array');
      var lowerOriginalText = textToAutoc.substring(1).toLowerCase(); // Pre lowerCase - Avoid it in loop
      module.iPseudo = 0; // Reset pos in array - Indicates we're actively rotating through the array
      module.pseudosMatches = [];
      $.each(module.pseudos, function(lowerPseudo, userData) {
        if (lowerPseudo.indexOf(lowerOriginalText) === 0) {
          module.pseudosMatches.push('@' + userData.pseudo); // Simple array, easier to loop
        }
      });
      module.pseudosMatches.sort(); // Alphabetical sort
      module.pseudosMatches.unshift(textToAutoc); // Insert original text at 0
    }

    if (module.pseudosMatches.length == 1) {
      return;
    }

    module.iPseudo = module.iPseudo >= module.pseudosMatches.length - 1 ? 0 : module.iPseudo + 1;
    module.dbg('autoComplete : Found a match : [%s] > %s', textToAutoc, module.pseudosMatches[module.iPseudo]);
    var content = text.substr(0, matchStart) + module.pseudosMatches[module.iPseudo] +
      (module.iPseudo === 0 || wysiwyg ? '' : ' ') +
      text.substr(matchStart + textToAutoc.length + (wysiwyg ? 4 : 0) + (module.iPseudo == 1 ? 0 : 1));
    if (wysiwyg) {
      module.sendWysiwygCommand(wysiwyg, 'setbbcode', null, content);
    } else {
      $e.val(content);
    }
  },

  insertWysiwygScript: function() {
    var module = this;
    utils.insertScript('ext_wysiwyg', function() {
      window.addEventListener('message', function(e) {
        if (e.data.type == 'ext_to_wysiwyg') {
          switch (e.data.command) {
            case 'getbbcode':
              window.postMessage({
                type: 'ext_from_wysiwyg',
                command: 'getbbcode',
                content: $(e.data.el).bbcode(),
              }, '*');
              break;
            case 'setbbcode':
              //$(e.data.el).bbcode(e.data.content);
              $(e.data.el).data('wbb').$body.html($(e.data.el).data('wbb').getHTML(e.data.content, true));
              break;
          }
        }
      }, false);
    });

    window.addEventListener('message', function(e) {
      if (e.data.type == 'ext_from_wysiwyg') {
        switch (e.data.command) {
          case 'getbbcode':
            if (module.eventCallbacks[e.data.command]) {
              module.eventCallbacks[e.data.command](e.data.content);
            }
            break;
        }
      }
    });
  },

  sendWysiwygCommand: function(el, command, cb, content) {
    var module = this;
    if (cb) {
      module.eventCallbacks[command] = cb;
    }
    window.postMessage({
      type: 'ext_to_wysiwyg',
      el: el,
      command: command,
      content: content,
    }, '*');
  },

  colorizeTwits: function(postId) {
    var module = this;
    if (!opt.get(module.name, 'twit_color')) {
      return;
    }
    var postArea = $(module.options.twitColor);
    if (arguments.length) {
      postArea = $('#content' + postId);
    }
    module.dbg('colorizeTwits : Colorization start');
    postArea.each(function() {
      var post = $(this);
      post.html(post.html().replace(/\B@([\w]+)/gi, function(match, m1) {
        var user = module.pseudos[m1.toLowerCase()];
        if (user) {
          module.dbg('colorizeTwits : Found a match [%s]', m1);
          return '@<a href="' + user.url + '"><span class="' + user.class + '">' + m1 +
            '</span></a>';
        } else {
          return match;
        }
      }));
    });
    module.dbg('colorizeTwits : Colorization ended');
  },

  ajaxColorizeTwits: function() {
    var module = this;
    if (!opt.get(module.name, 'twit_color')) {
      return;
    }

    var postArea = $(module.options.twitColorAjaxed);
    postArea.each(function() {
      var post = $(this);
      post.html(post.html().replace(/([^'])@([\w]+)/gi, function(match, m1, m2) {
        var user = module.pseudos[m2.toLowerCase()];
        if (user) {
          return m1 + '@<a href="' + user.url + '"><span class="' + user.class + '">' + m2 +
            '</span></a>';
        } else {
          return match;
        }
      }).replace(/ &nbsp;/g, ' ').replace(/&nbsp; /g, '&nbsp;'));
    });
  },

  delayedColor: function() {
    this.appendPseudosHashmap();
    this.ajaxColorizeTwits();
  },

  buildPseudosHashmap: function() {
    this.pseudos = {};
    this.appendPseudosHashmap();
  },

  appendPseudosHashmap: function() {
    var module = this;
    $('span[class^=userclass]').each(function() {
      module.pseudos[$(this).text().trim().toLowerCase()] = {
        pseudo: $(this).text().trim(),
        class: $(this).attr('class'),
        url: $(this).parent().attr('href')
      };
    });
  },
};
