'use strict';

var _lazytaskcreator = require('../lazytaskcreator');

var _lazytaskcreator2 = _interopRequireDefault(_lazytaskcreator);

var _lazytask = require('../lazytask');

var _lazytask2 = _interopRequireDefault(_lazytask);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LazyInitTask = function (_LazyTask) {
  _inherits(LazyInitTask, _LazyTask);

  function LazyInitTask(lazyView, options) {
    _classCallCheck(this, LazyInitTask);

    return _possibleConstructorReturn(this, (LazyInitTask.__proto__ || Object.getPrototypeOf(LazyInitTask)).call(this, lazyView, options, 'lazyinit'));
  }

  return LazyInitTask;
}(_lazytask2.default);

module.exports = function (options) {
  return new _lazytaskcreator2.default(LazyInitTask, options);
};