'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _class, _temp;

var _taskcreator = require('../task/taskcreator');

var _taskcreator2 = _interopRequireDefault(_taskcreator);

var _lazytask = require('../task/lazytask');

var _lazytask2 = _interopRequireDefault(_lazytask);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LazyInit = (_temp = _class = function (_LazyTask) {
  (0, _inherits3.default)(LazyInit, _LazyTask);

  function LazyInit(lazyView, props) {
    (0, _classCallCheck3.default)(this, LazyInit);

    props = (0, _objectAssign2.default)({}, LazyInit.defaultProps, props);
    return (0, _possibleConstructorReturn3.default)(this, _LazyTask.call(this, lazyView, props));
  }

  return LazyInit;
}(_lazytask2.default), _class.defaultProps = {
  once: true,
  name: 'lazyinit'
}, _temp);


module.exports = function (props) {
  return new _taskcreator2.default(LazyInit, props);
};