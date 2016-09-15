'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventdispatcher = require('eventdispatcher');

var _eventdispatcher2 = _interopRequireDefault(_eventdispatcher);

var _scrollEvents = require('scroll-events');

var _scrollEvents2 = _interopRequireDefault(_scrollEvents);

var _domready = require('domready');

var _domready2 = _interopRequireDefault(_domready);

var _delegatejs = require('delegatejs');

var _delegatejs2 = _interopRequireDefault(_delegatejs);

var _lazyview = require('./lazyview.plugin');

var _lazyview2 = _interopRequireDefault(_lazyview);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var isPlainObject = function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) == '[object Object]';
};
var isArray = function isArray(arr) {
  return Object.prototype.toString.call(arr) === '[object Array]';
};
var isLazyViewPlugin = function isLazyViewPlugin(obj) {
  return obj && obj.hasOwnProperty('creator');
};

var defaults = {
  enterClass: '',
  exitClass: '',
  threshold: 0
};

var getAbsolutBoundingRect = function getAbsolutBoundingRect(el, fixedHeight) {
  var rect = el.getBoundingClientRect();
  var height = fixedHeight || rect.height;
  var top = rect.top + _scrollEvents2.default.windowScrollY + height;
  return {
    top: top,
    bottom: rect.bottom + _scrollEvents2.default.windowScrollY - height,
    height: height,
    width: rect.width,
    left: rect.left,
    right: rect.right
  };
};

var LazyView = function (_EventDispatcher) {
  _inherits(LazyView, _EventDispatcher);

  _createClass(LazyView, null, [{
    key: 'apply',
    value: function apply(elements, options, plugins) {

      if (elements && elements.length) {
        var collection = new LazyViewCollection();
        for (var i = 0; i < elements.length; i++) {
          collection.push(new LazyView(elements[i], options, plugins));
        }
        return collection;
      }

      return new LazyView(elements, options, plugins);
    }
  }, {
    key: 'plugin',
    value: function plugin(creator) {
      return new _lazyview2.default(creator);
    }
  }]);

  function LazyView() {
    _classCallCheck(this, LazyView);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length < 1) {
      throw 'non initialization object';
    }

    var elements;
    if (args[0] instanceof window.NodeList) {
      elements = [].slice.call(args[0], 1);
      args[0] = args[0][0];
    }

    var el = args[0].tagName !== undefined ? args[0] : null;
    var options = {};
    var plugins = [];

    if (args.length === 2) {

      if (typeof args[1] !== 'undefined') {
        if (isLazyViewPlugin(args[1])) {
          plugins.push(args[1]);
        } else if (isArray(args[1])) {
          plugins.concat(args[1]);
        } else if (isPlainObject(args[1])) {
          options = args[1];
        }
      }
    } else if (args.length === 3) {

      if (typeof args[1] !== 'undefined') {
        if (isLazyViewPlugin(args[1])) {
          plugins.push(args[1]);
        } else if (isArray(args[1])) {
          plugins = plugins.concat(args[1]);
        } else if (isPlainObject(args[1])) {
          options = args[1];
        }
      }
      if (typeof args[2] !== 'undefined') {
        if (isLazyViewPlugin(args[2])) {
          plugins.push(args[2]);
        } else if (isArray(args[2])) {
          plugins = plugins.concat(args[2]);
        } else if (isPlainObject(args[2])) {
          options = args[2];
        }
      }
    }

    var _this = _possibleConstructorReturn(this, (LazyView.__proto__ || Object.getPrototypeOf(LazyView)).call(this, { target: el }));

    _this.el = el;
    _this.plugins = plugins;
    _this.options = (0, _objectAssign2.default)({}, defaults, options);

    _this.setState({
      inView: false
    }, true);

    _this.onScroll = (0, _delegatejs2.default)(_this, _this.checkInView);
    _this.onResize = (0, _delegatejs2.default)(_this, _this.update);

    (0, _domready2.default)(function () {
      return _this.init();
    });

    if (elements && elements.length) {
      var _ret;

      var collection = LazyView.apply(elements, options, plugins);
      collection.push(_this);
      return _ret = collection, _possibleConstructorReturn(_this, _ret);
    }
    return _this;
  }

  _createClass(LazyView, [{
    key: 'init',
    value: function init() {

      var scrollTarget = _scrollEvents2.default.getScrollParent(this.el);
      this.scroll = _scrollEvents2.default.getInstance(scrollTarget);
      this.scroll.on('scroll:start', this.onScroll);
      this.scroll.on('scroll:progress', this.onScroll);
      this.scroll.on('scroll:stop', this.onScroll);
      this.scroll.on('scroll:resize', this.onResize);
      window.addEventListener('resize', this.onResize, false);
      window.addEventListener('orientationchange', this.onResize, false);

      this.cachePosition();

      var i = -1;
      while (++i < this.plugins.length) {
        this.plugins[i].creator(this);
      }

      // scrollTarget.addEventListener('load', (event) => {
      //   setTimeout(() => {
      //     // this.scroll.trigger('scroll:update');
      //     // this.update();
      //   }, 10);
      // }, false);

      this.checkInView();
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.options.enterClass) {
        if (this.state.inView) {
          this.el.classList.add(this.options.enterClass);
        } else {
          this.el.classList.remove(this.options.enterClass);
        }
      }
    }
  }, {
    key: 'update',
    value: function update() {
      this.scroll.updateScrollPosition();
      this.cachePosition();
      this.checkInView();
    }
  }, {
    key: 'checkInView',
    value: function checkInView() {
      var scrollY = this.scroll.y;
      if (scrollY <= this.position.top - this.options.threshold && scrollY + this.clientHeight >= this.position.bottom + this.options.threshold) {
        if (!this.state.inView) {
          this.setState({ inView: true }, !this.options.enterClass);
          this.dispatch(LazyView.ENTER);
        }
      } else {
        if (this.state.inView) {
          this.setState({ inView: false }, !this.options.enterClass);
          this.dispatch(LazyView.EXIT);
        }
      }
    }
  }, {
    key: 'cachePosition',
    value: function cachePosition() {
      this.clientHeight = this.scroll.clientHeight;
      this.scrollHeight = this.scroll.scrollHeight;
      this.position = getAbsolutBoundingRect(this.el);
    }
  }, {
    key: 'setState',
    value: function setState(newState, silent) {
      this.state = newState;
      if (silent !== true) {
        this.render();
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {

      this.scroll.off('scroll:start', this.onScroll);
      this.scroll.off('scroll:progress', this.onScroll);
      this.scroll.off('scroll:stop', this.onScroll);
      this.scroll.off('scroll:update', this.onResize);

      if (!this.scroll.hasListeners()) {
        this.scroll.destroy();
        this.scroll = null;
      }

      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('orientationchange', this.onResize);
      }

      this.onScroll = null;
      this.onResize = null;

      this.clientHeight = null;
      this.scrollHeight = null;
      this.position = null;
      this.options = null;
      this.el = null;
    }
  }]);

  return LazyView;
}(_eventdispatcher2.default);

LazyView.ENTER = 'enter';
LazyView.EXIT = 'exit';
exports.default = LazyView;

var LazyViewCollection = function (_EventDispatcher2) {
  _inherits(LazyViewCollection, _EventDispatcher2);

  function LazyViewCollection() {
    _classCallCheck(this, LazyViewCollection);

    var _this2 = _possibleConstructorReturn(this, (LazyViewCollection.__proto__ || Object.getPrototypeOf(LazyViewCollection)).call(this));

    _this2.items = [];
    return _this2;
  }

  _createClass(LazyViewCollection, [{
    key: 'push',
    value: function push(lazyView) {
      this.items.push(lazyView);
    }
  }, {
    key: 'addListener',
    value: function addListener(event, listener) {
      var i = -1;
      while (++i < this.items.length) {
        this.items[i].addListener(event, listener);
      }
      return this;
    }
  }, {
    key: 'removeListener',
    value: function removeListener(event, listener) {
      var i = -1;
      while (++i < this.items.length) {
        this.items[i].removeListener(event, listener);
      }
      return this;
    }
  }]);

  return LazyViewCollection;
}(_eventdispatcher2.default);

module.exports = exports['default'];