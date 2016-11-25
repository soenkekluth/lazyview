'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lazytaskcreator = require('../lazytaskcreator');

var _lazytaskcreator2 = _interopRequireDefault(_lazytaskcreator);

var _lazytask = require('../lazytask');

var _lazytask2 = _interopRequireDefault(_lazytask);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LazyLoadTask = function (_LazyTask) {
  _inherits(LazyLoadTask, _LazyTask);

  function LazyLoadTask(lazyView, options, name) {
    _classCallCheck(this, LazyLoadTask);

    options = options || {};
    options.destroyOnComplete = true;
    return _possibleConstructorReturn(this, (LazyLoadTask.__proto__ || Object.getPrototypeOf(LazyLoadTask)).call(this, lazyView, options, 'lazyload'));
  }

  _createClass(LazyLoadTask, [{
    key: 'getLazyItem',
    value: function getLazyItem(el) {

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
    }
  }, {
    key: 'init',
    value: function init() {

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
        _get(LazyLoadTask.prototype.__proto__ || Object.getPrototypeOf(LazyLoadTask.prototype), 'init', this).call(this);
        this.onLoad = this.onLoad.bind(this);
      } else {
        this.destroy();
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      _get(LazyLoadTask.prototype.__proto__ || Object.getPrototypeOf(LazyLoadTask.prototype), 'destroy', this).call(this);
      this.onLoad = null;
    }
  }, {
    key: 'onLoad',
    value: function onLoad(event) {
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
    }
  }, {
    key: 'onStart',
    value: function onStart() {
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
    }
  }]);

  return LazyLoadTask;
}(_lazytask2.default);

module.exports = function (options) {
  return new _lazytaskcreator2.default(LazyLoadTask, options);
};