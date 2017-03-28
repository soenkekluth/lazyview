'use strict';

var _class, _temp;

var _taskcreator = require('../task/taskcreator');

var _taskcreator2 = _interopRequireDefault(_taskcreator);

var _lazytask = require('../task/lazytask');

var _lazytask2 = _interopRequireDefault(_lazytask);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LazyInit = (_temp = _class = function (_LazyTask) {
  _inherits(LazyInit, _LazyTask);

  function LazyInit(lazyView, props) {
    _classCallCheck(this, LazyInit);

    props = (0, _objectAssign2.default)({}, LazyInit.defaultProps, props);
    return _possibleConstructorReturn(this, _LazyTask.call(this, lazyView, props));
  }

  return LazyInit;
}(_lazytask2.default), _class.defaultProps = {
  once: true,
  name: 'lazyinit'
}, _temp);


module.exports = function (props) {
  return new _taskcreator2.default(LazyInit, props);
};