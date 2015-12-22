// Here are all functions used across the modules
// Lib functions
var utils = {
  // General debug function
  dbg: function(section, args) {
    if (ext.DEBUG) {
      var dd = new Date();
      var h = dd.getHours();
      var m = dd.getMinutes();
      var s = dd.getSeconds();
      var ms = dd.getMilliseconds();
      var debugPrepend = '[' + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) +
        ':' + (s < 10 ? '0' + s : s) + ':' + (ms < 100 ? '0' +
          (ms < 10 ? '0' + ms : ms) : ms) + '] ' + section;
      // Since we can't concat string and objects, add another line
      if (typeof args[0] == 'string') {
        args[0] = debugPrepend + '.' + args[0];
        console.log.apply(console, args);
      } else {
        var argsArray = $.makeArray(args);
        argsArray.unshift(debugPrepend + ' %o');
        console.log.apply(console, argsArray);
      }
    }
  },

  // Storage functions
  storage: {
    // Inserts a complete module in localStorage
    set: function(module, opts) {
      // This tempStore is used to avoid storage of the whole module, we only need value
      var tempStore = {};
      $.each(opts, function(o, v) {
        tempStore[o] = v.val;
        if (v.subOptions) {
          $.each(v.subOptions, function(subO, subV) {
            tempStore[o + '_' + subO] = subV.val;
          });
        }
      });
      var store = {};
      store[module] = tempStore;
      utils.storage._set(store);
    },
    // Returns a complete module, only used by opt.load()
    get: function(module, callback) {
      try {
        utils.storage._get(module, callback);
      } catch (e) {
        var ret = {};
        callback(ret);
      }
    },
    data_set: function(module, data) {
      var tempStore = {};
      tempStore['data_' + module] = data;
      utils.storage._set(tempStore);
    },
    data_get: function(module, callback) {
      var ret = {};
      try {
        utils.storage._get('data_' + module, function(obj) {
          ret[module] = obj['data_' + module];
          callback(ret);
        });
      } catch (e) {
        callback(ret);
      }
    }
  },

  // Returns an url object from url string - Usable by craftUrl
  parseUrl: function(urlToParse) {
    // No need to parse any external link
    var host = urlToParse.match('^https?:\\/\\/[^/]+');
    var parsedUrl = {};
    if (!host) {
      if (ext.url.host && urlToParse.indexOf('/') === 0) {
        parsedUrl.host = ext.url.host;
      } else {
        return false;
      }
    } else {
      parsedUrl.host = host[0];
    }
    urlToParse = urlToParse.replace(parsedUrl.host, '');

    // Parse the path from the url string (/m/account/)
    var path = urlToParse.match(/[\-\w\.\/]*\/?/);
    parsedUrl.path = (path ? path[0] : path);
    urlToParse = urlToParse.replace(parsedUrl.path, '');

    // The hashtag thingie (#post_121212)
    var hash = urlToParse.match('#.*$');
    if (hash) {
      parsedUrl.hash = (hash ? hash[0] : hash);
      urlToParse = urlToParse.replace(parsedUrl.hash, '');
    }

    // Since the urls have a strange build patern between pages, we continue to parse even if it is malformed
    if (urlToParse.indexOf('?') == -1 && urlToParse.indexOf('&') == -1 && urlToParse.indexOf('=') == -1) {
      return parsedUrl;
    }

    if (urlToParse.indexOf('?') == -1) {
      // Here, we know the url is malformed, we are going for some hacks
      // Inform the url builder that we won't need a '?' in url
      parsedUrl.cancelQ = true;
      if (urlToParse.indexOf('&') == -1) {
        // It's now the url hell, there is at least 1 param since we found a '=', even hackier !
        // Inform the url builder that we won't need a '&' in url
        parsedUrl.cancelAmp = true;
        // Extract the last word from path, we know it was in fact a param
        lastPathBit = parsedUrl.path.match(/\/(\w*)$/);
        if (lastPathBit.length) {
          // Remove it from path
          parsedUrl.path = parsedUrl.path.replace(lastPathBit[1], '');
          // Prepend it to the rest of url string in order to pass the params parser
          urlToParse = lastPathBit[1] + urlToParse;
        }
      }
    }
    urlToParse = urlToParse.replace('?', '');

    // Usual params split
    var urlSplit = urlToParse.split('&');
    if (!urlSplit.length) {
      return false;
    }

    // Extract params and values
    parsedUrl.params = {};
    $.each(urlSplit, function(k, v) {
      if (v === '') {
        return;
      }
      var params = v.split('=');
      parsedUrl.params[params[0]] = params[1] || true;
    });
    return parsedUrl;
  },

  // Returns an url string form an url object - Form parseUrl()
  craftUrl: function(parsedUrl) {
    if (!parsedUrl.params) {
      return parsedUrl.host + parsedUrl.path;
    }

    // As seen before, some hacks for malformed urls
    var craftedUrl = (parsedUrl.host ? parsedUrl.host : ext.url.host) +
      parsedUrl.path + (parsedUrl.cancelQ ? (parsedUrl.cancelAmp ? '' : '&') : '?');

    // Build the params
    var i = 0;
    $.each(parsedUrl.params, function(k, v) {
      // We don't always have values for each param, but append it anyway
      craftedUrl += (i === 0 ? '' : '&') + k + (v !== true ? '=' + v : '');
      i++;
    });

    // Append the hashtag thingie
    //craftedUrl += (parsedUrl.hash ? parsedUrl.hash : '');

    return craftedUrl;
  },

  // Ajax_GET an url object, then callback with data and page_number
  grabPage: function(urlObject, callback, completeCallback, errorCallback) {
    var urlToGrab = typeof urlObject == 'string' ? urlObject : utils.craftUrl(urlObject);
    $.ajax({
      type: 'GET',
      url: urlToGrab,
      jsonp: false,
      success: function(data, status, jXHR) {
        var ajaxedUrl = utils.parseUrl(this.url);
        var pageNumber = ajaxedUrl && ajaxedUrl.params && ajaxedUrl.params.page || 0;
        callback(data, Number(pageNumber));
      },
      error: function(jXHR, status, thrown) {
        if (errorCallback) {
          errorCallback();
        }
      },
      complete: function() {
        if (completeCallback) {
          completeCallback();
        }
      }
    });
  },

  // Ajax_POST an url object, then callback with data
  post: function(urlObject, postData, callback) {
    var urlToGrab = typeof urlObject == 'string' ? urlObject : utils.craftUrl(urlObject);
    $.ajax({
      type: 'POST',
      data: postData,
      url: urlToGrab,
      jsonp: false,
      success: function(data, status, jqXHR) {
        callback(data);
      }
    });
  },

  multiGet: function(actions, callback) {
    if (actions.length < 1) {
      callback();
      return;
    }
    var action = actions.pop();
    var urlToGrab = utils.craftUrl({
      host: ext.url.host,
      path: '/ajax.php',
      params: action
    });
    $.ajax({
      type: 'GET',
      url: urlToGrab,
      jsonp: false,
      complete: function() {
        utils.multiGet(actions, callback);
      }
    });
  },

  delay: (function() {
    var timer = 0;
    return function(callback, ms) {
      clearTimeout(timer);
      timer = setTimeout(function() {
        callback();
      }, ms);
    };
  })(),

  // Date string convertion - Returns now and then date objects & full diff between those objects
  dateToDuration: function(dateStr) {
    var dur = {};
    var dateMatch = dateStr.match(/\d[\d:\-\/ ]{4,}\d/);
    if (!dateMatch || !dateMatch.length) {
      return false;
    }

    dur.was = new Date(dateMatch[0].replace(/-/g, '/'));
    if (dur.was.toString() == 'Invalid Date') {
      return false;
    }

    dur.now = utils.siteRelativeDate;
    dur.ttDiff = dur.now - dur.was;

    dur.msTot = dur.ttDiff;
    dur.ms = dur.msTot % 1000;
    dur.secTot = dur.msTot / 1000;
    dur.sec = Math.floor(dur.secTot) % 60;
    dur.minTot = dur.secTot / 60;
    dur.min = Math.floor(dur.minTot) % 60;
    dur.hourTot = dur.minTot / 60;
    dur.hour = Math.floor(dur.hourTot) % 24;
    dur.dayTot = dur.hourTot / 24;
    dur.day = Math.floor(dur.dayTot) % 7;
    dur.weekTot = dur.dayTot / 7;
    dur.week = Math.floor(Math.floor(dur.weekTot) % 4.34812141);
    dur.monthTot = dur.weekTot / 4.34812141;
    dur.month = Math.floor(dur.monthTot) % 12;
    dur.yearTot = dur.monthTot / 12;
    dur.year = Math.floor(dur.yearTot);
    return dur;
  },

  shortDurationFormat: function(dateStr) {
    var dateMatch = dateStr.match(/\d[\d:\-\/ ]{4,}\d/);
    if (!dateMatch || !dateMatch.length) {
      return false;
    }

    var was = new Date(dateMatch[0].replace(/-/g, '/'));
    if (was.toString() == 'Invalid Date') {
      return false;
    }

    var now = utils.siteRelativeDate;

    var diff = Math.round(now - was) / 1000;
    if (diff < 60) { // Less than 1min
      return 'frais';
    } else if (diff < 3600) { // Less than 1h
      return Math.round(diff / 60) + 'min';
    } else if (diff < 86400) { // Less than 1d
      return Math.round(diff / 3600) + 'h';
    } else if (diff < 2592000) { // Less than 1mo(30d)
      return Math.round(diff / 86400) + 'j';
    } else if (diff < 31536000) {
      return Math.round(diff / 2592000) + 'mo';
    } else {
      return Math.round(diff / 31536000) + 'a';
    }
  },

  // Size string convertion - Returns precise size data in To-Go-Mo-Ko
  strToSize: function(sizeStr) {
    var sizeMatches = sizeStr.match(/([\d\.,]+) (\w)[oObB]/);
    if (!sizeMatches || !sizeMatches.length) {
      return false;
    }

    var value = Number(sizeMatches[1].replace(',', '')); // In Ko
    switch (sizeMatches[2]) {
      case 'P':
        value *= 1024;
      case 'T':
        value *= 1024;
      case 'G':
        value *= 1024;
      case 'M':
        value *= 1024;
    }

    var size = {};
    size.koTot = value;
    size.ko = Math.floor(size.koTot) % 1024;
    size.moTot = size.koTot / 1024;
    size.mo = Math.floor(size.moTot) % 1024;
    size.goTot = size.moTot / 1024;
    size.go = Math.floor(size.goTot) % 1024;
    size.toTot = size.goTot / 1024;
    size.to = Math.floor(size.toTot) % 1024;
    return size;
  },

  strToInt: function(str) {
    if (str === null || str === undefined) {
      return null;
    }
    if (typeof str == 'number') {
      return str;
    }
    if (typeof str == 'string') {
      return Number(str.replace(',', ''));
    }
    return null;
  },

  clone: function(obj) {
    return jQuery.extend(true, {}, obj);
  },

  // Returns parsed total karma
  getKarmaTotal: function() {
    if (!$('#userlink a').length) {
      return -1;
    }
    return Number($('#userlink a[href$="karma.php"]').text().replace(/,/g, ''));
  },

  // Returns parsed userId
  getUserId: function() {
    if (!$('#userlink a').length) {
      return -1;
    }
    return $('#userlink a:first').attr('href').match(/\d+/)[0];
  },

  // Returns parsed authKey of the user from menu
  getAuthkey: function() {
    if (this.authKey) {
      return this.authKey;
    }
    var ak = false;
    $('#navig_bloc_user li a').each(function() {
      var href = $(this).attr('href');
      if (href.indexOf('ak=') > 0) {
        ak = href.slice(-32);
      }
    });
    this.authKey = ak;
    return ak;
  },

  updateSiteRelativeDate: function() {
    var d = new Date();
    var dstStart = new Date(d.getFullYear(), 2, 25, 1, 59);
    if (dstStart.getDay() > 0) {
      dstStart.setDate(dstStart.getDate() + (7 - dstStart.getDay()));
    }
    var dstEnd = new Date(d.getFullYear(), 9, 25, 1, 59);
    if (dstEnd.getDay() > 0) {
      dstEnd.setDate(dstEnd.getDate() + (7 - dstEnd.getDay()));
    }
    var time = d.getTime();
    var isDST = (dstStart.getTime() < time) && (time < dstEnd.getTime());
    utils.siteRelativeDate = new Date(time + ((d.getTimezoneOffset() + (isDST ? 120 : 60)) * 60000));
  },

  insertHtml: function(data, $node, pos) {
    switch (pos) {
      case 'before':
        $node.before(data);
        break;
      case 'after':
        $node.after(data);
        break;
      case 'prepend':
        $node.prepend(data);
        break;
      case 'append':
      default:
        $node.append(data);
        break;
    }
  },

  // Import a javascript file from the site if we need it elsewhere (jQ function doesn't seem to work as intended)
  appendNativeScript: function(jsFileName) {
    $('body').append($('<script>', {
      type: 'text/javascript',
      src: jsFileName
    }));
  },

  // Insert script into DOM - Escape sandboxing
  insertScript: function(id, f, removeAfterUse) {
    document.body.appendChild(
      $('<script>', {
        id: id,
        type: 'text/javascript'
      }).text('(' + f.toString() + ')(jQuery)').get(0)
    );
    if (removeAfterUse) {
      $('#' + id).remove();
    }
  },

  // Builds our specific frames from a frame object :
  // { id, classes, title, header, data, relativeToId, relativeToObj, relativeToWindow, top, left, css,
  // buttons = [ /* close is by default */ { b_id, b_text, b_callback} ], onCloseCallback, underButtonsText },
  // removeOnOutsideClick
  appendFrame: function(o) {
    // Build custom buttons
    var additionnalButtons = '';
    if (o.buttons) {
      $.each(o.buttons, function(i, button) {
        additionnalButtons += '<input type="button" id="ext_' + o.id + '_' +
          button.id + '" class="fine" value=" ' + button.text + ' "> ';
      });
    }

    // Build entire frame
    var frame = $('<div>', {
      id: 'ext_' + o.id,
      class: 'ext_frame' + (o.classes ? ' ' + o.classes : '')
    }).append(
      $('<p>', {
        class: 'separate',
        text: o.title
      }),
      $('<div>', {
        class: 'ext_frame_content'
      }).append(
        (o.header ? $('<div>', {
          class: 'ext_frame_header'
        }).append(o.header) : $()),
        $('<div>', {
          id: 'ext_' + o.id + '_data',
          class: 'ext_frame_data'
        }).append(o.data),
        $('<div>', {
          id: 'ext_' + o.id + '_buttons',
          class: 'ext_frame_buttons'
        }).append(
          (additionnalButtons.length ? additionnalButtons : $()),
          $('<input>', {
            type: 'button',
            id: 'ext_' + o.id + '_close',
            value: ' Fermer '
          })
        )
      ), (o.underButtonsText ? $('<div>', {
        id: 'ext_copyright'
      }).append(o.underButtonsText) : $())
    );

    // Append
    $('#contenu').append(frame);

    // Close button
    frame.find('#ext_' + o.id + '_close').click(function() {
      if (o.onCloseCallback) {
        o.onCloseCallback();
      }
      frame.remove();
      return false;
    });

    // Custom buttons management and callbacks
    if (additionnalButtons.length) {
      $.each(o.buttons, function(i, button) {
        if (button.callback) {
          frame.find('#ext_' + o.id + '_' + button.id).click(function() {
            button.callback(frame.find('#ext_' + o.id + '_data'),
              '#ext_' + o.id);
            return false;
          });
        }
      });
    }

    if (o.css) {
      $.each(o.css, function(key, value) {
        frame.css(key, value);
      });
      frame.css('overflow', 'auto');
    }

    // Position correction on resize
    if (o.relativeToId) {
      $(window).resize(function() {
        var toOffset = $('#' + o.relativeToId).offset();
        frame.offset({
          top: toOffset.top + o.top,
          left: toOffset.left + o.left
        });
      });
      $(window).trigger('resize');
    }

    if (o.relativeToObj) {
      $(window).resize(function() {
        var toOffset = o.relativeToObj.offset();
        frame.offset({
          top: toOffset.top + o.top,
          left: toOffset.left + o.left
        });
      });
      $(window).trigger('resize');
    }

    if (o.relativeToWindow) {
      $(window).resize(function() {
        var topOffset = (document.body.scrollTop || document.documentElement
          .scrollTop);
        var leftOffset = (document.body.scrollLeft || document.documentElement
          .scrollLeft);
        if (o.top === true) {
          o.top = $(window).height() / 2 - frame.height() / 2;
        }
        if (o.left === true) {
          o.left = $(window).width() / 2 - frame.width() / 2;
        }
        frame.offset({
          top: topOffset + o.top + ($('#entete').css('position') ==
            'fixed' ? $('#entete').height() : 0),
          left: leftOffset + o.left
        });
      });
      $(window).trigger('resize');
    };

    // Background-color correction
    var transparentCss = 'rgba(0, 0, 0, 0)';
    var transparentCssFirefox = 'transparent';
    if (frame.find('.ext_frame_content').css('background-color') ==
      transparentCss || frame.find('.ext_frame_data').css('background-color') ==
      transparentCssFirefox) {
      // Go up as much as needed to find some non-transparent color
      var cssTries = ['#navigation', '#centre', '#navig_bloc_user', '#header'];
      $.each(cssTries, function(i, cssId) {
        var cssColor = $(cssId).css('background-color');
        if (cssColor && cssColor != transparentCss && cssColor != transparentCssFirefox) {
          var colorRGBA = cssColor.match(
            /^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\.\d]+)\s*\)$/i
          );
          if (colorRGBA) {
            cssColor = 'rgba(' + colorRGBA[1] + ',' + colorRGBA[2] + ',' +
              colorRGBA[3] + ',1)';
          }
          // Instead of creating style on frame, let's append to our custom CSS area
          utils.appendCSS('.ext_frame { background-color: ' + cssColor + '; } ');
          return false;
        }
      });
    }

    if (o.removeOnOutsideClick) {
      $(document).one('click', function() {
        frame.remove();
      });
      frame.on('click', function(e) {
        e.stopPropagation();
      });
    }
  },

  // Default CSS
  insertCSS: function() {
    $('head').append([
      "<style id='ext_css'>",
      // Back to top button
      '#backTopButton { display:none; text-decoration:none; position:fixed; ' +
      'bottom:10px; right:10px; overflow:hidden; width:39px; height:39px; ' +
      'border:none; text-indent:100%; background:url(' +
      utils.getExtensionUrl('images/' + opt.get('endless_scrolling',
        'button_style') + '/to_top_small.png') + ') no-repeat; }',

      // Endless scrolling pauser button
      '.esButtonPaused { background:url(' + utils.getExtensionUrl(
        'images/' + opt.get('endless_scrolling', 'button_style') +
        '/endless_scrolling_paused.png') + ') no-repeat; }',
      '.esButtonActive { background:url(' + utils.getExtensionUrl(
        'images/' + opt.get('endless_scrolling', 'button_style') +
        '/endless_scrolling_active.png') + ') no-repeat; }',

      // New episodes button
      '.new_episodes_new { background:url(' + utils.getExtensionUrl(
        'images/watch_new.png') + ') no-repeat; }',
      '.new_episodes_old { background:url(' + utils.getExtensionUrl(
        'images/watch.png') + ') no-repeat; }',
      '</style>',
    ].join(' '));
    if (typeof chrome == 'undefined') {
      $('head').append('<link rel="stylesheet" type="text/css" href="' + utils.getExtensionUrl('main.css') + '" />');
    }
  },

  insertDivs: function() {
    // The back to top button - We build it on init and show it when needed
    $('#global').append(
      '<a id="esPauseButton" class="esButtonActive" href="#"></a>' +
      '<a id="backTopButton" href="#"></a>'
    );
    var esModule = ext.modules.endless_scrolling;
    $('#backTopButton').click(function() {
      esModule.ignoreScrolling = true;
      $('html, body').animate({
        scrollTop: 0
      }, 800, 'swing', function() {
        esModule.ignoreScrolling = false;
      });
      $(this).hide();
      $('#esPauseButton').hide();
      return false;
    });
    $('#esPauseButton').click(function() {
      if (esModule.pauseEndlessScrolling) {
        $('#esPauseButton').removeClass('esButtonPaused');
        $('#esPauseButton').addClass('esButtonActive');
        esModule.pauseEndlessScrolling = false;
      } else {
        $('#esPauseButton').removeClass('esButtonActive');
        $('#esPauseButton').addClass('esButtonPaused');
        esModule.pauseEndlessScrolling = true;
      }
      return false;
    });
  },

  // Custom CSS insertion, mostly used by the frame builder
  appendCSS: function(css) {
    $('#ext_css').append(css);
  },

  sizeUnits: ['o', 'Ko', 'Mo', 'Go', 'To', 'Po']
};

if (typeof chrome == 'undefined') {
  if (typeof safari != 'undefined') {
    utils.getExtensionUrl = function(str) {
      return safari.extension.baseURI + str;
    };
    utils.storage._set = function(obj, callback) {
      for (var key in obj) {
        localStorage[key] = JSON.stringify(obj[key]);
      }
      if (callback) {
        callback();
      }
    };
    utils.storage._get = function(key, callback) {
      var returnObj = {};
      returnObj[key] = JSON.parse(localStorage[key]);
      callback(returnObj);
    };
  } else if (typeof self != 'undefined') {
    utils.getExtensionUrl = function(str) {
      return self.options[str];
    };
    utils.storage._set = function(obj, callback) {
      for (var key in obj) {
        var storedObj = {
          key: key,
          val: obj[key]
        };
        self.port.emit('storageSet', storedObj);
      }
      if (callback) {
        callback();
      }
    };
    utils.storage._get = function(key, callback) {
      var returnObj = {};
      self.port.on('storageGet' + key, function(obj) {
        returnObj[key] = obj;
        if (callback) {
          callback(returnObj);
        }
      });
      self.port.emit('storageGet', key);
    };
  } else {
    throw 'Unsupported browser';
  }
} else {
  utils.getExtensionUrl = function(u) {
    return chrome.extension.getURL(u);
  };
  utils.storage._set = function(o, c) {
    return chrome.storage.local.set(o, c);
  };
  utils.storage._get = function(k, c) {
    return chrome.storage.local.get(k, c);
  };
}
