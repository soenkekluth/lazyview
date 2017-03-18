'use strict';

exports.__esModule = true;
exports.default = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _class, _temp;

var _eventdispatcher = require('eventdispatcher');

var _eventdispatcher2 = _interopRequireDefault(_eventdispatcher);

var _scrollfeatures = require('scrollfeatures');

var _scrollfeatures2 = _interopRequireDefault(_scrollfeatures);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _dedupe = require('classnames/dedupe');

var _dedupe2 = _interopRequireDefault(_dedupe);

var _lodash = require('lodash.debounce');

var _lodash2 = _interopRequireDefault(_lodash);

var _taskcreator = require('./task/taskcreator');

var _taskcreator2 = _interopRequireDefault(_taskcreator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isPlainObject = function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) == '[object Object]';
};
var isArray = function isArray(arr) {
  return Object.prototype.toString.call(arr) === '[object Array]';
};
var isTaskCreator = function isTaskCreator(obj) {
  return obj && obj.hasOwnProperty('creator');
};

var defaults = {
  autoInit: true,
  ignoreInitial: false,
  enterClass: null,
  exitClass: null,
  init: null,
  threshold: 0,
  children: null,
  childSelectors: null,
  offsets: null // {myoffset:100}
};

var getAbsolutBoundingRect = function getAbsolutBoundingRect(el, fixedHeight) {
  var rect = el.getBoundingClientRect();
  var height = fixedHeight || rect.height;
  var top = rect.top + _scrollfeatures2.default.windowY;
  return {
    top: top,
    bottom: rect.bottom + _scrollfeatures2.default.windowY,
    height: height,
    width: rect.width,
    left: rect.left,
    right: rect.right
  };
};

var nullPosition = {
  top: 0,
  bottom: 0,
  height: 0,
  width: 0
};

var getPositionStyle = function getPositionStyle(el) {
  if (typeof window !== 'undefined') {
    var style = window.getComputedStyle(el, null);
    return style.getPropertyValue('position');
  }
  return null;
};

var LazyView = (_temp = _class = function (_EventDispatcher) {
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
        if (isTaskCreator(args[1])) {
          tasks.push(args[1]);
        } else if (isArray(args[1])) {
          tasks.concat(args[1]);
        } else if (isPlainObject(args[1])) {
          options = args[1];
        }
      }
    } else if (args.length === 3) {

      if (typeof args[1] !== 'undefined') {
        if (isTaskCreator(args[1])) {
          tasks.push(args[1]);
        } else if (isArray(args[1])) {
          tasks = tasks.concat(args[1]);
        } else if (isPlainObject(args[1])) {
          options = args[1];
        }
      }
      if (typeof args[2] !== 'undefined') {
        if (isTaskCreator(args[2])) {
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
    _this.children = [];
    _this.lastChildrenQuery = null;
    nullPosition.top = _this.options.threshold;
    _this.offsetKeys = _this.options.offsets ? Object.keys(_this.options.offsets) : null;

    _this.state = {
      firstRender: true,
      initialized: false,
      inView: false,
      progress: 0,
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
    this.checkBounds = (0, _lodash2.default)(this.checkBounds.bind(this), 100);

    this.el.addEventListener('load', this.checkBounds, false);

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
      window.addEventListener('load', this.onResize, { capture: false, once: true });
      if (document.readyState !== 'complete') {
        document.addEventListener("DOMContentLoaded", this.onResize, { capture: false, once: true });
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

  LazyView.prototype.addChild = function addChild(element) {
    this.options.children = this.options.children || [];
    if (this.options.children.indexOf(element) === -1) {
      this.options.children.push(element);
    }
  };

  LazyView.prototype.removeChild = function removeChild(element) {
    if (this.options.children && this.options.children.length) {
      var index = this.options.children.indexOf(element);
      if (index > -1) {
        this.options.children.splice(index, 1);
      }
    }
  };

  LazyView.prototype.render = function render() {
    if (this.options.enterClass) {
      var _classNames;

      this.el.className = (0, _dedupe2.default)(this.el.className, (_classNames = {}, _classNames[this.options.enterClass] = this.state.inView, _classNames));
    }
  };

  LazyView.prototype.checkBounds = function checkBounds() {
    if (this.el && this.el.clientHeight !== this.position.height) {
      this.scroll.trigger('scroll:resize');
    }
  };

  LazyView.prototype.onScroll = function onScroll() {

    this.updateViewState();

    if (this.state.inView) {
      if (this.children.length) {
        for (var i = 0, l = this.children.length; i < l; i++) {
          if (this.isInView(this.children[i].position)) {
            if (!this.children[i].state.inView) {
              this.children[i].state.inView = true;
              this.trigger('enter:child', { target: this.children[i].el });
            }
          } else {
            if (this.children[i].state.inView) {
              this.children[i].state.inView = false;
              this.trigger('exit:child', { target: this.children[i].el });
            }
          }
        }
      }

      /*if (false || this.offsetKeys) {
         for (let i = 0, l = this.offsetKeys.length; i < l; i++) {
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
      }*/
    }
  };

  LazyView.prototype.update = function update() {
    var _this2 = this;

    this.cachePosition();
    if (this.state.firstRender) {
      setTimeout(function () {
        _this2.onScroll();
      }, 0);
    } else {
      this.onScroll();
    }
  };

  LazyView.prototype.isInView = function isInView(position) {
    var offsetPosition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : nullPosition;

    // if (position === 'fixed') {
    //   return true;
    // }
    var progress = this.getProgress(position, offsetPosition);
    return progress >= 0 && progress <= 1;
  };

  LazyView.prototype.getInnerProgress = function getInnerProgress() {
    return (this.position.top - this.scroll.clientHeight + this.scroll.y) / this.position.height;
  };

  LazyView.prototype.getProgress = function getProgress(position) {
    var offsetPosition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : nullPosition;

    var posTop = position.top - this.scroll.clientHeight + offsetPosition.top;
    return (this.scroll.y - posTop) / (this.scroll.clientHeight + position.height - offsetPosition.top);
  };

  LazyView.prototype.updateViewState = function updateViewState() {

    this.state.progress = this.getProgress(this.position, nullPosition);
    // console.log(this.state.progress)

    if (this.state.progress >= 0 && this.state.progress <= 1) {

      this.trigger('scroll', { progress: this.state.progress });

      if (!this.state.inView) {
        this.setInview(true, this.options.enterClass === null);

        if (this.options.init) {
          this.options.init.call(this);
        }

        // if (!(this.state.firstRender && this.options.ignoreInitial)) {
        this.trigger(LazyView.ENTER);
        // }
      }
    } else {
      if (this.state.inView) {
        this.setInview(false, this.options.enterClass === null);
        if (!this.state.firstRender) {
          this.trigger(LazyView.EXIT);
        }
      }
    }

    this.state.firstRender = false;
  };

  LazyView.prototype.cachePosition = function cachePosition() {
    this.position = getAbsolutBoundingRect(this.el);

    if (this.children && this.children.length) {
      for (var i = 0, l = this.children.length; i < l; i++) {
        var rect = getAbsolutBoundingRect(this.children[i].el);
        // rect.top -= this.position.top;
        // rect.bottom -= this.position.top;
        this.children[i].position = rect;
      }
      return;
    }

    var selectedChildren = null;
    this.children = [];

    if (this.options.childSelectors && this.options.childSelectors.length) {
      var query = this.options.childSelectors.join(', ');
      if (query !== this.lastChildrenQuery) {
        this.lastChildrenQuery = query;
        selectedChildren = this.el.querySelectorAll(this.options.childSelectors.join(', '));
      }
    } else if (!this.options.children && this.options.children.length) {
      selectedChildren = this.options.children;
    }

    if (selectedChildren) {

      for (var _i = 0, _l = selectedChildren.length; _i < _l; _i++) {
        var _rect = getAbsolutBoundingRect(selectedChildren[_i]);
        // rect.top -= this.position.top;
        // rect.bottom -= this.position.top;

        this.children.push({
          el: selectedChildren[_i],
          position: _rect,
          state: {
            inView: false
          }
        });
      }
    }
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

    if (this.el) {
      this.el.removeListener('load', this.checkBounds);
    }

    this.onScroll = null;
    this.onResize = null;

    this.position = null;
    this.options = null;
    this.el = null;
  };

  return LazyView;
}(_eventdispatcher2.default), _class.ENTER = 'enter', _class.EXIT = 'exit', _class.ENTER_CHILD = 'enter:child', _class.EXIT_CHILD = 'exit:child', _temp);
exports.default = LazyView;

var LazyViewCollection = function (_EventDispatcher2) {
  (0, _inherits3.default)(LazyViewCollection, _EventDispatcher2);

  function LazyViewCollection() {
    (0, _classCallCheck3.default)(this, LazyViewCollection);

    var _this3 = (0, _possibleConstructorReturn3.default)(this, _EventDispatcher2.call(this));

    _this3.items = [];
    return _this3;
  }

  LazyViewCollection.prototype.push = function push(lazyView) {
    this.items.push(lazyView);
  };

  LazyViewCollection.prototype.on = function on(event, listener) {
    var i = -1;
    while (++i < this.items.length) {
      this.items[i].on(event, listener);
    }
    return this;
  };

  LazyViewCollection.prototype.off = function off(event, listener) {
    var i = -1;
    while (++i < this.items.length) {
      this.items[i].off(event, listener);
    }
    return this;
  };

  return LazyViewCollection;
}(_eventdispatcher2.default);