'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _class, _temp;

var _taskcreator = require('../task/taskcreator');

var _taskcreator2 = _interopRequireDefault(_taskcreator);

var _lazytask = require('../task/lazytask');

var _lazytask2 = _interopRequireDefault(_lazytask);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LazyLoad = (_temp = _class = function (_LazyTask) {
  (0, _inherits3.default)(LazyLoad, _LazyTask);

  function LazyLoad(lazyView, props) {
    (0, _classCallCheck3.default)(this, LazyLoad);

    props = (0, _objectAssign2.default)({}, LazyLoad.defaultProps, props);
    return (0, _possibleConstructorReturn3.default)(this, _LazyTask.call(this, lazyView, props));
  }

  LazyLoad.prototype.getLazyItem = function getLazyItem(el) {

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

  LazyLoad.prototype.init = function init() {

    this.mediaToLoad = [];
    this.entered = false;

    var el = this.lazyView.el;
    if (this.getLazyItem(el)) {
      this.mediaToLoad.push(el);
    } else {
      var elems = el.querySelectorAll(this.props.selector);
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

  LazyLoad.prototype.destroy = function destroy() {
    _LazyTask.prototype.destroy.call(this);
    this.onLoad = null;
  };

  LazyLoad.prototype.onLoad = function onLoad(event) {

    var el = event.target;

    --this.loadCount;

    el.removeEventListener('load', this.onLoad);
    el.removeEventListener('error', this.onLoad);

    if (this.props.loadClass) {
      el.classList.remove(this.props.loadClass);
    }

    if (this.props.completeClass) {
      el.classList.add(this.props.completeClass);
    }

    if (this.loadCount === 0) {

      this.loadResolver(this.lazyView);

      if (this.props.once) {
        this.destroy();
      }
    }
  };

  LazyLoad.prototype.onStart = function onStart() {
    var _this2 = this;

    return new Promise(function (resolve, reject) {

      _this2.loadResolver = resolve;
      if (!_this2.mediaToLoad.length) {
        _this2.loadResolver(_this2.lazyView);
        if (_this2.props.once) {
          _this2.destroy();
        }
        return;
      }

      for (var i = 0, l = _this2.mediaToLoad.length; i < l; i++) {
        var el = _this2.mediaToLoad[i];

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
          el.addEventListener('load', _this2.onLoad);
          el.addEventListener('error', _this2.onLoad);

          if (_this2.props.loadClass) {
            el.classList.add(_this2.props.loadClass);
          }

          el.removeAttribute('data-src');
          el.removeAttribute('data-srcset');
        }
      }

      // this.lazyView.removeOffset(this.name)
    });
  };

  return LazyLoad;
}(_lazytask2.default), _class.defaultProps = {
  selector: 'img',
  once: true,
  name: 'lazyload'
}, _temp);


module.exports = function (props) {
  return new _taskcreator2.default(LazyLoad, props);
};