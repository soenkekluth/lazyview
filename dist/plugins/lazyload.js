'use strict';

var _lazyview = require('../lazyview.plugin');

var _lazyview2 = _interopRequireDefault(_lazyview);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
  destroy: false
};

module.exports = function (options) {

  return new _lazyview2.default(function (lazyView) {
    var opts = (0, _objectAssign2.default)({}, defaults, options);
    var el = lazyView.el;
    var src = el.getAttribute('data-src');
    var srcset = el.getAttribute('data-srcset');

    var _dispatchLoad = function dispatchLoad(event) {
      setTimeout(function () {
        lazyView.scroll.trigger('scroll:resize');
        if (opts.destroy) {
          lazyView.destroy();
        }
      }, 100);
      if (options.loadClass) {
        el.classList.remove(opts.loadClass);
      }
      if (options.completeClass) {
        el.classList.add(opts.completeClass);
      }
      el.removeEventListener('load', _dispatchLoad);
    };

    var onEnter = function onEnter() {

      var isChanged = false;
      if (src && el.getAttribute('src') !== src) {
        isChanged = true;
        el.setAttribute('src', src);
      }

      if (srcset && el.getAttribute('srcset') !== srcset) {
        isChanged = true;
        el.setAttribute('srcset', srcset);
      }

      if (isChanged) {
        el.addEventListener('load', _dispatchLoad);

        if (opts.loadClass) {
          el.classList.add(opts.loadClass);
        }

        el.removeAttribute('data-src');
        el.removeAttribute('data-srcset');
      }

      if (lazyView.options.offsets && lazyView.options.offsets.threshold) {
        delete lazyView.options.offsets.threshold;
      }
    };

    if (src || srcset) {

      if (opts.threshold) {
        lazyView.options.offsets = lazyView.options.offsets || {};
        lazyView.options.offsets.threshold = options.threshold;
        lazyView.once('enter:threshold', onEnter);
      } else {
        lazyView.once('enter', onEnter);
      }
    } else {
      el = null;
      _dispatchLoad = null;
      onEnter = null;
    }
  });
};