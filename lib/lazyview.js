'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _eventdispatcher = require('eventdispatcher');

var _eventdispatcher2 = _interopRequireDefault(_eventdispatcher);

var _scrollfeatures = require('scrollfeatures');

var _scrollfeatures2 = _interopRequireDefault(_scrollfeatures);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isPlainObject = function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) == '[object Object]';
};
var isArray = function isArray(arr) {
  return Object.prototype.toString.call(arr) === '[object Array]';
};
var isLazyTaskCreator = function isLazyTaskCreator(obj) {
  return obj && obj.hasOwnProperty('creator');
};

var defaults = {
  autoInit: true,
  ignoreInitial: false,
  enterClass: '',
  exitClass: '',
  init: null,
  threshold: 0,
  offsets: null // {myoffset:100}
};

var getAbsolutBoundingRect = function getAbsolutBoundingRect(el, fixedHeight) {
  var rect = el.getBoundingClientRect();
  var height = fixedHeight || rect.height;
  var top = rect.top + _scrollfeatures2.default.windowY + height;
  return {
    top: top,
    bottom: rect.bottom + _scrollfeatures2.default.windowY - height,
    height: height,
    width: rect.width,
    left: rect.left,
    right: rect.right
  };
};

var getPositionStyle = function getPositionStyle(el) {
  if (typeof window !== 'undefined') {
    var style = window.getComputedStyle(el, null);
    return style.getPropertyValue('position');
  }
  return null;
};

var LazyView = function (_EventDispatcher) {
  (0, _inherits3.default)(LazyView, _EventDispatcher);

  LazyView.apply = function apply(elements) {

    if (elements && elements.length) {
      var collection = new LazyViewCollection();

      for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        rest[_key - 1] = arguments[_key];
      }

      for (var i = 0; i < elements.length; i++) {
        collection.push(new (Function.prototype.bind.apply(LazyView, [null].concat([elements[i]], rest)))());
      }
      return collection;
    }

    return new LazyView(elements, (0, _objectAssign2.default)({}, options), tasks);
  };

  function LazyView() {
    (0, _classCallCheck3.default)(this, LazyView);

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    if (!args.length) {
      throw 'non initialization object';
    }

    var elements;
    if (args[0] instanceof window.NodeList) {
      elements = [].slice.call(args[0], 1);
      args[0] = args[0][0];
    }

    var el = args[0].tagName !== undefined ? args[0] : null;
    var options = {};
    var tasks = [];

    if (args.length === 2) {

      if (typeof args[1] !== 'undefined') {
        if (isLazyTaskCreator(args[1])) {
          tasks.push(args[1]);
        } else if (isArray(args[1])) {
          tasks.concat(args[1]);
        } else if (isPlainObject(args[1])) {
          options = args[1];
        }
      }
    } else if (args.length === 3) {

      if (typeof args[1] !== 'undefined') {
        if (isLazyTaskCreator(args[1])) {
          tasks.push(args[1]);
        } else if (isArray(args[1])) {
          tasks = tasks.concat(args[1]);
        } else if (isPlainObject(args[1])) {
          options = args[1];
        }
      }
      if (typeof args[2] !== 'undefined') {
        if (isLazyTaskCreator(args[2])) {
          tasks.push(args[2]);
        } else if (isArray(args[2])) {
          tasks = tasks.concat(args[2]);
        } else if (isPlainObject(args[2])) {
          options = args[2];
        }
      }
    }

    var _this = (0, _possibleConstructorReturn3.default)(this, _EventDispatcher.call(this, { target: el }));

    _this.el = el;
    _this.tasks = tasks;
    _this.options = (0, _objectAssign2.default)({}, defaults, options);
    _this.offsetStates = {};
    _this.offsetKeys = _this.options.offsets ? Object.keys(_this.options.offsets) : null;

    _this.state = {
      firstRender: true,
      initialized: false,
      inView: false,
      viewProgress: 0,
      position: getPositionStyle(_this.el)
    };

    if (_this.options.autoInit) {
      _this.init();
    }

    if (elements && elements.length) {
      var _ret;

      var collection = LazyView.apply.apply(LazyView, [elements].concat(args.splice(1, args.length)));
      collection.push(_this);
      return _ret = collection, (0, _possibleConstructorReturn3.default)(_this, _ret);
    }
    return _this;
  }

  LazyView.prototype.init = function init() {
    if (this.state.initialized) {
      return;
    }
    this.state.initialized = true;
    this.state.position = getPositionStyle(this.el);

    this.scroll = _scrollfeatures2.default.getInstance(_scrollfeatures2.default.getScrollParent(this.el));

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.update.bind(this);

    var i = -1;
    while (++i < this.tasks.length) {
      this.tasks[i].creator(this);
    }

    this.scroll.on('scroll:start', this.onScroll);
    this.scroll.on('scroll:progress', this.onScroll);
    this.scroll.on('scroll:stop', this.onScroll);
    this.scroll.on('scroll:resize', this.onResize);

    if (typeof window !== 'undefined') {
      window.addEventListener('orientationchange', this.onResize, false);
      window.addEventListener('load', this.onResize, false);
      if (document.readyState !== 'complete') {
        document.addEventListener("DOMContentLoaded", this.onResize, false);
      }
    }

    this.update();
  };

  LazyView.prototype.addOffset = function addOffset(name, value) {
    this.options.offsets = this.options.offsets || {};
    this.options.offsets[name] = value;
    this.offsetKeys = Object.keys(this.options.offsets);
  };

  LazyView.prototype.removeOffset = function removeOffset(name) {
    if (this.options.offsets && this.options.offsets.hasOwnProperty(name)) {
      delete this.options.offsets[name];
      this.offsetKeys = Object.keys(this.options.offsets);
    }
  };

  LazyView.prototype.render = function render() {
    if (this.options.enterClass || this.options.exitClass) {
      var directionY = this.scroll.directionY;
      if (this.state.inView) {
        !!this.options.enterClass && this.el.classList.add(this.options.enterClass, directionY < 1 ? 'view-top' : 'view-bottom');
        !!this.options.exitClass && this.el.classList.remove(this.options.exitClass);
      } else {
        !!this.options.enterClass && this.el.classList.remove(this.options.enterClass, 'view-top', 'view-bottom');
        !!this.options.exitClass && this.el.classList.add(this.options.exitClass, directionY < 1 ? 'view-top' : 'view-bottom');
      }
    }
  };

  LazyView.prototype.onScroll = function onScroll() {

    this.updateViewState();

    if (this.offsetKeys) {

      for (var i = 0, l = this.offsetKeys.length; i < l; i++) {
        var key = this.offsetKeys[i];
        var value = this.options.offsets[key];

        if (this.isInView(value)) {
          if (!this.offsetStates[key]) {
            this.offsetStates[key] = true;
            this.trigger('enter:' + key);
          }
        } else {
          if (this.offsetStates[key]) {
            this.offsetStates[key] = false;
            this.trigger('exit:' + key);
          }
        }
      }
    }
  };

  LazyView.prototype.update = function update() {
    this.cachePosition();
    this.onScroll();
  };

  LazyView.prototype.isInView = function isInView() {
    var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    if (this.state.position === 'fixed') {
      return true;
    }
    // return (this.state.viewProgress > 0 && this.state.viewProgress < 1);

    return this.scroll.y <= this.position.top - offset && this.scroll.y + this.scroll.clientHeight >= this.position.bottom + offset;
  };

  LazyView.prototype.updateViewProgress = function updateViewProgress() {
    var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    var posY = this.position.bottom + offset + this.position.height - this.scroll.y;
    this.state.viewProgress = posY / (this.scroll.clientHeight + offset + this.position.height);
  };

  LazyView.prototype.updateViewState = function updateViewState() {

    this.updateViewProgress(this.options.threshold);

    if (this.state.viewProgress >= 0 && this.state.viewProgress <= 1) {

      this.trigger('scroll', { progress: this.state.viewProgress });

      if (!this.state.inView) {
        this.setInview(true, !this.options.enterClass);

        if (this.options.init) {
          this.options.init.call(this);
        }
        if (!(this.state.firstRender && this.options.ignoreInitial)) {
          this.trigger(LazyView.ENTER);
        }
      }
    } else {
      if (this.state.inView) {
        this.setInview(false, !this.options.enterClass);
        if (!(this.state.firstRender && this.options.ignoreInitial)) {
          this.trigger(LazyView.EXIT);
        }
      }
    }

    this.state.firstRender = false;
  };

  LazyView.prototype.cachePosition = function cachePosition() {
    this.position = getAbsolutBoundingRect(this.el);
  };

  LazyView.prototype.setInview = function setInview(value, silent) {
    this.state.inView = value;
    if (silent !== true) {
      this.render();
    }
  };

  LazyView.prototype.destroy = function destroy() {

    if (this.scroll) {
      this.scroll.off('scroll:start', this.onScroll);
      this.scroll.off('scroll:progress', this.onScroll);
      this.scroll.off('scroll:stop', this.onScroll);
      this.scroll.off('scroll:resize', this.onResize);

      if (!this.scroll.hasListeners()) {
        this.scroll.destroy();
        this.scroll = null;
      }
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('orientationchange', this.onResize);
      window.removeEventListener('load', this.onResize);
      if (document.readyState !== 'complete') {
        document.removeEventListener("DOMContentLoaded", this.onResize);
      }
    }

    this.onScroll = null;
    this.onResize = null;

    this.position = null;
    this.options = null;
    this.el = null;
  };

  return LazyView;
}(_eventdispatcher2.default);

LazyView.ENTER = 'enter';
LazyView.EXIT = 'exit';
exports.default = LazyView;

var LazyViewCollection = function (_EventDispatcher2) {
  (0, _inherits3.default)(LazyViewCollection, _EventDispatcher2);

  function LazyViewCollection() {
    (0, _classCallCheck3.default)(this, LazyViewCollection);

    var _this2 = (0, _possibleConstructorReturn3.default)(this, _EventDispatcher2.call(this));

    _this2.items = [];
    return _this2;
  }

  LazyViewCollection.prototype.push = function push(lazyView) {
    this.items.push(lazyView);
  };

  LazyViewCollection.prototype.addListener = function addListener(event, listener) {
    var i = -1;
    while (++i < this.items.length) {
      this.items[i].addListener(event, listener);
    }
    return this;
  };

  LazyViewCollection.prototype.removeListener = function removeListener(event, listener) {
    var i = -1;
    while (++i < this.items.length) {
      this.items[i].removeListener(event, listener);
    }
    return this;
  };

  return LazyViewCollection;
}(_eventdispatcher2.default);

module.exports = exports['default'];