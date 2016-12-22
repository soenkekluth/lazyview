'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LazyTask = function () {
  function LazyTask(lazyView, options) {
    var name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'lazytask';
    (0, _classCallCheck3.default)(this, LazyTask);

    this.lazyView = lazyView;
    this.name = name;
    this.options = (0, _objectAssign2.default)({}, LazyTask.defaults, options);
    this.onEnter = this.onEnter.bind(this);
    this.onExit = this.onExit.bind(this);
    this.init();
  }

  LazyTask.prototype.destroy = function destroy() {
    this.lazyView.removeOffset(this.name);
    this.options = null;
    this.onEnter = null;
    this.onExit = null;
    this.lazyView = null;
  };

  LazyTask.prototype.init = function init() {
    if (this.options.threshold) {
      this.lazyView.addOffset(this.name, this.options.threshold);
      this.lazyView.one('enter:' + this.name, this.onEnter);
      this.lazyView.one('exit:' + this.name, this.onExit);
    } else {
      this.lazyView.one('enter', this.onEnter);
      this.lazyView.one('exit', this.onExit);
    }
  };

  LazyTask.prototype.onStop = function onStop(arg) {
    return Promise.resolve(arg);
  };

  LazyTask.prototype.onStart = function onStart(lazyView) {
    return Promise.resolve(lazyView);
  };

  LazyTask.prototype.onComplete = function onComplete(lazyView) {
    return Promise.resolve(lazyView);
  };

  LazyTask.prototype.onAfterComplete = function onAfterComplete(lazyView) {
    if (lazyView.el.clientHeight !== lazyView.position.height) {
      lazyView.scroll.trigger('scroll:resize');
    }
    return Promise.resolve(lazyView);
  };

  LazyTask.prototype.onEnter = function onEnter() {
    var _this = this;

    var result = this.onStart(this.lazyView).then(function (arg) {
      if (_this.options && _this.options.onStart) {
        var res = _this.options.onStart.call(_this, _this.lazyView);
        if (res.then) {
          return res;
        }
      }
      return arg;
    }).then(function (arg) {
      return _this.onComplete(arg);
    }).then(function (arg) {
      return _this.onAfterComplete(arg);
    }).then(function (arg) {
      if (_this.options && _this.options.onComplete) {
        var res = _this.options.onComplete.call(_this, _this.lazyView);
        if (res.then) {
          return res;
        }
      }
      return arg;
    });
    return result;
  };

  LazyTask.prototype.onExit = function onExit() {
    var _this2 = this;

    var lazyView = this.lazyView;
    var result = this.onStop(lazyView).then(function (arg) {
      if (_this2.options && _this2.options.onStop) {
        var res = _this2.options.onStop.call(_this2, lazyView);
        if (res.then) {
          return res;
        }
      }
      return arg;
    });
    return result;
  };

  return LazyTask;
}();

LazyTask.defaults = {
  destroyOnComplete: false,
  completeClass: null,
  initClass: null,
  onStart: null,
  onStop: null,
  onComplete: null,
  onEnter: null,
  onExit: null
};
exports.default = LazyTask;
module.exports = exports['default'];