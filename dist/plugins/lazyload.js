'use strict';

var _lazyview = require('../lazyview.plugin');

var _lazyview2 = _interopRequireDefault(_lazyview);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (options) {

  options = options || {};

  return new _lazyview2.default(function (lazyView) {

    var el = lazyView.el;
    var src = el.getAttribute('data-src');
    var srcset = el.getAttribute('data-srcset');

    var _dispatchLoad = function dispatchLoad(event) {
      setTimeout(function () {
        lazyView.scroll.trigger('scroll:resize');
        // lazyView.destroy();
      }, 100);
      if (options.loadClass) {
        el.classList.remove(options.loadClass);
      }
      if (options.completeClass) {
        el.classList.add(options.completeClass);
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

        if (options.loadClass) {
          el.classList.add(options.loadClass);
        }

        el.removeAttribute('data-src');
        el.removeAttribute('data-srcset');
      }
    };
    if (src || srcset) {
      lazyView.once('enter', onEnter);
    } else {
      el = null;
      _dispatchLoad = null;
      onEnter = null;
    }
  });
};