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

var LazyInitTask = function (_LazyTask) {
  (0, _inherits3.default)(LazyInitTask, _LazyTask);

  function LazyInitTask(lazyView, options) {
    (0, _classCallCheck3.default)(this, LazyInitTask);
    return (0, _possibleConstructorReturn3.default)(this, _LazyTask.call(this, lazyView, options, 'lazyinit'));
  }

  return LazyInitTask;
}(_lazytask2.default);

module.exports = function (options) {
  return new _lazytaskcreator2.default(LazyInitTask, options);
};