'use strict';

exports.__esModule = true;
exports.default = undefined;

var _class, _temp;

var _eventdispatcher = require('eventdispatcher');

var _eventdispatcher2 = _interopRequireDefault(_eventdispatcher);

var _scrollfeatures = require('scrollfeatures');

var _scrollfeatures2 = _interopRequireDefault(_scrollfeatures);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _class2 = require('dom-helpers/class');

var _lodash = require('lodash.debounce');

var _lodash2 = _interopRequireDefault(_lodash);

var _taskcreator = require('./task/taskcreator');

var _taskcreator2 = _interopRequireDefault(_taskcreator);

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
var isTaskCreator = function isTaskCreator(obj) {
  return obj && obj.hasOwnProperty('creator');
};

var getAbsolutBoundingRect = function getAbsolutBoundingRect(node, fixedHeight) {
  var rect = node.getBoundingClientRect();
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

var getPositionStyle = function getPositionStyle(node) {
  if (typeof window !== 'undefined') {
    var style = window.getComputedStyle(node, null);
    return style.getPropertyValue('position');
  }
  return null;
};

var LazyView = (_temp = _class = function (_EventDispatcher) {
  _inherits(LazyView, _EventDispatcher);

  LazyView.apply = function apply(nodes) {
    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var tasks = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];


    if (nodes && nodes.length) {
      var collection = new LazyViewCollection();
      for (var i = 0; i < nodes.length; i++) {
        collection.push(new LazyView({ node: nodes[i], props: props, tasks: tasks }));
      }
      return collection;
    }

    return new LazyView(nodes, (0, _objectAssign2.default)({}, props), tasks);
  };

  function LazyView(_ref) {
    var _ref$node = _ref.node,
        node = _ref$node === undefined ? null : _ref$node,
        _ref$props = _ref.props,
        props = _ref$props === undefined ? {} : _ref$props,
        _ref$tasks = _ref.tasks,
        tasks = _ref$tasks === undefined ? [] : _ref$tasks;

    _classCallCheck(this, LazyView);

    if (!node) {
      throw 'non initialization object';
    }

    var nodes = void 0;
    if (node instanceof window.NodeList) {
      nodes = [].slice.call(node, 1);
      node = node[0];
    }

    var _this = _possibleConstructorReturn(this, _EventDispatcher.call(this, { target: node }));

    _this.node = node;
    _this.tasks = tasks;
    _this.props = (0, _objectAssign2.default)({}, LazyView.defaultProps, props);
    _this.offsetStates = {};
    _this.children = [];
    _this.lastChildrenQuery = null;
    _this.watchChild = _this.watchChild.bind(_this);
    _this.unwatchChild = _this.unwatchChild.bind(_this);
    nullPosition.top = _this.props.threshold;
    _this.offsetKeys = _this.props.offsets ? Object.keys(_this.props.offsets) : null;

    _this.state = {
      firstRender: true,
      initialized: false,
      inView: false,
      progress: 0,
      position: getPositionStyle(_this.node)
    };

    if (_this.props.autoInit) {
      _this.init();
    }

    if (nodes && nodes.length) {
      var _ret;

      var collection = LazyView.apply(nodes, props, tasks);
      collection.push(_this);
      return _ret = collection, _possibleConstructorReturn(_this, _ret);
    }
    return _this;
  }

  /*constructor(...args) {
     if (!args.length) {
      throw 'non initialization object';
    }
     var nodes;
    if (args[0] instanceof window.NodeList) {
      nodes = [].slice.call(args[0], 1);
      args[0] = args[0][0];
    }
     let node = (args[0].tagName !== undefined) ? args[0] : null;
    let props = {};
    let tasks = [];
     if (args.length === 2) {
       if (typeof args[1] !== 'undefined') {
        if (isTaskCreator(args[1])) {
          tasks.push(args[1]);
        } else if (isArray(args[1])) {
          tasks.concat(args[1]);
        } else if (isPlainObject(args[1])) {
          props = args[1];
        }
      }
    } else if (args.length === 3) {
       if (typeof args[1] !== 'undefined') {
        if (isTaskCreator(args[1])) {
          tasks.push(args[1]);
        } else if (isArray(args[1])) {
          tasks = tasks.concat(args[1]);
        } else if (isPlainObject(args[1])) {
          props = args[1];
        }
      }
      if (typeof args[2] !== 'undefined') {
        if (isTaskCreator(args[2])) {
          tasks.push(args[2]);
        } else if (isArray(args[2])) {
          tasks = tasks.concat(args[2]);
        } else if (isPlainObject(args[2])) {
          props = args[2];
        }
      }
    }
     super({ target: node });
     this.node = node;
    this.tasks = tasks;
    this.props = assign({}, LazyView.defaultProps, props);
    this.offsetStates = {};
    this.children = [];
    this.lastChildrenQuery = null;
    this.watchChild = this.watchChild.bind(this);
    this.unwatchChild = this.unwatchChild.bind(this);
    nullPosition.top = this.props.threshold;
    this.offsetKeys = this.props.offsets ? Object.keys(this.props.offsets) : null;
     this.state = {
      firstRender: true,
      initialized: false,
      inView: false,
      progress: 0,
      position: getPositionStyle(this.node)
    };
     if (this.props.autoInit) {
      this.init();
    }
     if (nodes && nodes.length) {
      var collection = LazyView.apply(nodes, ...args.splice(1, args.length));
      collection.push(this);
      return collection;
    }
  }*/

  LazyView.prototype.init = function init() {
    if (this.state.initialized) {
      return;
    }
    this.state.initialized = true;
    this.state.position = getPositionStyle(this.node);

    this.scroll = _scrollfeatures2.default.getInstance(_scrollfeatures2.default.getScrollParent(this.node));

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.update.bind(this);
    this.checkBounds = (0, _lodash2.default)(this.checkBounds.bind(this), 100);

    this.node.addEventListener('load', this.checkBounds, false);

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

    this.watchChildren();
    this.update();
  };

  LazyView.prototype.addOffset = function addOffset(name, value) {
    this.props.offsets = this.props.offsets || {};
    this.props.offsets[name] = value;
    this.offsetKeys = Object.keys(this.props.offsets);
  };

  LazyView.prototype.removeOffset = function removeOffset(name) {
    if (this.props.offsets && this.props.offsets.hasOwnProperty(name)) {
      delete this.props.offsets[name];
      this.offsetKeys = Object.keys(this.props.offsets);
    }
  };

  LazyView.prototype.watchChildren = function watchChildren() {

    if (!this.props.children) {
      return;
    }

    var children = [];

    if (typeof this.props.children === 'string') {
      children = this.node.querySelectorAll(this.props.children);
    } else if (isArray(this.props.children)) {
      for (var i = 0, l = this.props.children.length; i < l; i++) {
        var entry = this.props.children[i];
        if (!entry) {
          continue;
        }
        if (typeof entry === 'string') {
          var els = Array.prototype.slice.call(this.node.querySelectorAll(entry));
          if (els && els.length) {
            children = children.concat(els);
          }
        } else if (typeof entry.nodeType === 'undefined') {
          children.push(entry);
        }
      }
    }

    Array.prototype.forEach.call(children, this.watchChild);
  };

  LazyView.prototype.watchChild = function watchChild(node) {
    if (!node || typeof node.nodeType === 'undefined') {
      console.warn('node is invalid');
      return;
    }
    var hasChild = this.children.filter(function (child) {
      return child.node === node;
    }).length > 0;

    if (!hasChild) {
      var rect = getAbsolutBoundingRect(node);

      this.children.push({
        node: node,
        position: rect,
        state: {
          inView: false
        }
      });
      this.watching = true;
    }
  };

  LazyView.prototype.unwatchChild = function unwatchChild(node) {
    if (!node || typeof node.nodeType === 'undefined') {
      console.warn('node is invalid');
      this.invalidateChildren();
      return;
    }
    this.children = this.children.filter(function (child) {
      return !!child.node && child.node !== node;
    });
    if (!this.children.length) {
      this.watching = false;
    }
  };

  LazyView.prototype.render = function render() {
    if (this.props.enterClass) {
      if (this.state.inView) {
        (0, _class2.addClass)(this.node, this.props.enterClass);
      } else {
        (0, _class2.removeClass)(this.node, this.props.enterClass);
      }
    }
  };

  LazyView.prototype.checkBounds = function checkBounds() {
    if (this.node && this.node.clientHeight !== this.position.height) {
      this.scroll.trigger('scroll:resize');
    }
  };

  LazyView.prototype.onScroll = function onScroll() {

    this.updateViewState();

    if (this.state.inView && this.watching) {

      for (var i = 0, l = this.children.length; i < l; i++) {
        if (!this.children[i] || !this.children[i].position) {
          continue;
        }
        if (this.isInView(this.children[i].position)) {
          if (!this.children[i].state.inView) {
            this.children[i].state.inView = true;
            this.trigger('enter:child', { target: this.children[i].node });
          }
        } else {
          if (this.children[i].state.inView) {
            this.children[i].state.inView = false;
            this.trigger('exit:child', { target: this.children[i].node });
          }
        }
      }
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

    if (this.state.progress >= 0 && this.state.progress <= 1) {

      this.trigger('scroll', { progress: this.state.progress });

      if (!this.state.inView) {
        this.setInview(true, this.props.enterClass === null);

        if (this.props.init) {
          this.props.init.call(this);
        }

        this.trigger(LazyView.ENTER);
      }
    } else {
      if (this.state.inView) {
        this.setInview(false, this.props.enterClass === null);
        if (!this.state.firstRender) {
          this.trigger(LazyView.EXIT);
        }
      }
    }

    this.state.firstRender = false;
  };

  LazyView.prototype.invalidateChildren = function invalidateChildren() {
    if (this.children.length) {
      this.children = this.children.filter(function (child) {
        return child && child.node;
      });
      this.watching = this.children.length > 0;
    } else {
      this.watching = false;
    }
  };

  LazyView.prototype.cachePosition = function cachePosition() {
    this.position = getAbsolutBoundingRect(this.node);
    // this.invalidateChildren();
    if (this.watching) {
      for (var i = 0, l = this.children.length; i < l; i++) {
        if (this.children[i] && this.children[i].node) {
          var rect = getAbsolutBoundingRect(this.children[i].node);
          if (this.children[i]) {
            this.children[i].position = rect;
          }
        }
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

    if (this.node) {
      this.node.removeListener('load', this.checkBounds);
    }

    this.onScroll = null;
    this.onResize = null;

    this.position = null;
    this.props = null;
    this.node = null;
  };

  return LazyView;
}(_eventdispatcher2.default), _class.defaultProps = {
  autoInit: true,
  ignoreInitial: false,
  enterClass: null,
  exitClass: null,
  init: null,
  threshold: 0,
  children: false,
  offsets: null
}, _class.ENTER = 'enter', _class.EXIT = 'exit', _class.ENTER_CHILD = 'enter:child', _class.EXIT_CHILD = 'exit:child', _temp);
exports.default = LazyView;

var LazyViewCollection = function (_EventDispatcher2) {
  _inherits(LazyViewCollection, _EventDispatcher2);

  function LazyViewCollection() {
    _classCallCheck(this, LazyViewCollection);

    var _this3 = _possibleConstructorReturn(this, _EventDispatcher2.call(this));

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