'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _lazytaskcreator = require('../lazytaskcreator');

var _lazytaskcreator2 = _interopRequireDefault(_lazytaskcreator);

var _lazytask = require('../lazytask');

var _lazytask2 = _interopRequireDefault(_lazytask);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LazyLoadTask = function (_LazyTask) {
  (0, _inherits3.default)(LazyLoadTask, _LazyTask);

  function LazyLoadTask(lazyView, options, name) {
    (0, _classCallCheck3.default)(this, LazyLoadTask);

    options = options || {};
    options.destroyOnComplete = true;
    return (0, _possibleConstructorReturn3.default)(this, _LazyTask.call(this, lazyView, options, 'lazyload'));
  }

  LazyLoadTask.prototype.getLazyItem = function getLazyItem(el) {

    var src = el.getAttribute('data-src');
    var srcset = el.getAttribute('data-srcset');
    var isLazy = !!(src || srcset);

    if (isLazy) {

      var willLoad = false;
      if (src && el.getAttribute('src') !== src) {
        willLoad = true;
      }

      if (srcset && el.getAttribute('srcset') !== srcset) {
        willLoad = true;
      }

      if (willLoad) {
        return el;
      }
    }
    return null;
  };

  LazyLoadTask.prototype.init = function init() {

    this.mediaToLoad = [];
    this.entered = false;

    var el = this.lazyView.el;
    if (this.getLazyItem(el)) {
      this.mediaToLoad.push(el);
    } else {
      var elems = el.querySelectorAll('img');
      for (var i = 0, l = elems.length; i < l; i++) {
        var elem = elems[i];
        if (this.getLazyItem(elem)) {
          this.mediaToLoad.push(elem);
        }
      }
    }

    this.loadCount = this.mediaToLoad.length;

    if (this.loadCount) {
      _LazyTask.prototype.init.call(this);
      this.onLoad = this.onLoad.bind(this);
    } else {
      this.destroy();
    }
  };

  LazyLoadTask.prototype.destroy = function destroy() {
    _LazyTask.prototype.destroy.call(this);
    this.onLoad = null;
  };

  LazyLoadTask.prototype.onLoad = function onLoad(event) {
    var _this2 = this;

    var el = event.target;

    --this.loadCount;

    el.removeEventListener('load', this.onLoad);
    el.removeEventListener('error', this.onLoad);

    if (this.options.loadClass) {
      el.classList.remove(this.options.loadClass);
    }

    if (this.options.completeClass) {
      el.classList.add(this.options.completeClass);
    }

    if (this.loadCount === 0) {

      var lazyView = this.lazyView;
      setTimeout(function () {
        _this2.loadResolver(lazyView);
        lazyView = null;
      }, 1);

      if (this.options.destroyOnComplete) {
        this.destroy();
      }
    }
  };

  LazyLoadTask.prototype.onStart = function onStart() {
    var _this3 = this;

    return new Promise(function (resolve, reject) {

      _this3.loadResolver = resolve;
      if (!_this3.mediaToLoad.length) {
        _this3.loadResolver(_this3.lazyView);
        return;
      }

      for (var i = 0, l = _this3.mediaToLoad.length; i < l; i++) {
        var el = _this3.mediaToLoad[i];

        var src = el.getAttribute('data-src');
        var srcset = el.getAttribute('data-srcset');

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
          el.addEventListener('load', _this3.onLoad);
          el.addEventListener('error', _this3.onLoad);

          if (_this3.options.loadClass) {
            el.classList.add(_this3.options.loadClass);
          }

          el.removeAttribute('data-src');
          el.removeAttribute('data-srcset');
        }
      }

      _this3.lazyView.removeOffset(_this3.name);
    });
  };

  return LazyLoadTask;
}(_lazytask2.default);

module.exports = function (options) {
  return new _lazytaskcreator2.default(LazyLoadTask, options);
};