'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LazyTask = function () {
  function LazyTask(lazyView, options) {
    var name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'lazytask';

    _classCallCheck(this, LazyTask);

    this.lazyView = lazyView;
    this.name = name;
    this.options = (0, _objectAssign2.default)({}, LazyTask.defaults, options);
    this.onEnter = this.onEnter.bind(this);
    this.onExit = this.onExit.bind(this);
    this.init();
  }

  _createClass(LazyTask, [{
    key: 'destroy',
    value: function destroy() {
      this.lazyView.removeOffset(this.name);
      this.options = null;
      this.onEnter = null;
      this.onExit = null;
      this.lazyView = null;
    }
  }, {
    key: 'init',
    value: function init() {
      if (this.options.threshold) {
        this.lazyView.addOffset(this.name, this.options.threshold);
        this.lazyView.once('enter:' + this.name, this.onEnter);
        this.lazyView.once('exit:' + this.name, this.onExit);
      } else {
        this.lazyView.once('enter', this.onEnter);
        this.lazyView.once('exit', this.onExit);
      }
    }
  }, {
    key: 'onStart',
    value: function onStart(arg) {
      return Promise.resolve(arg);
    }
  }, {
    key: 'onComplete',
    value: function onComplete(arg) {
      return Promise.resolve(arg);
    }
  }, {
    key: 'onEnter',
    value: function onEnter() {
      var _this = this;

      var onStart = this.options.onStart || this.onStart;
      var onComplete = this.options.onComplete || this.onComplete;

      var result = onStart.call(this, this.lazyView);
      if (result.then) {
        return result.then(function (res) {
          return onComplete.call(_this, res || _this.lazyView);
        });
      }
      return onComplete(result);
    }
  }, {
    key: 'onExit',
    value: function onExit() {}
  }]);

  return LazyTask;
}();

LazyTask.defaults = {
  destroyOnComplete: false,
  completeClass: null,
  initClass: null,
  onStart: null,
  onComplete: null,
  onEnter: null,
  onExit: null
};
exports.default = LazyTask;
module.exports = exports['default'];