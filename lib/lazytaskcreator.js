'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LazyTaskCreator = function LazyTaskCreator(Task, options) {
  (0, _classCallCheck3.default)(this, LazyTaskCreator);

  this.creator = function (lazyView) {
    return new Task(lazyView, options);
  };
};

exports.default = LazyTaskCreator;
module.exports = exports['default'];