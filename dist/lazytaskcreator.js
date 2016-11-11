'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LazyTaskCreator = function LazyTaskCreator(Task, options) {
  _classCallCheck(this, LazyTaskCreator);

  this.creator = function (lazyView) {
    return new Task(lazyView, options);
  };
};

exports.default = LazyTaskCreator;
module.exports = exports['default'];