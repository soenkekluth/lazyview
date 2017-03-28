'use strict';

var _class, _temp;

var _taskcreator = require('../task/taskcreator');

var _taskcreator2 = _interopRequireDefault(_taskcreator);

var _lazytask = require('../task/lazytask');

var _lazytask2 = _interopRequireDefault(_lazytask);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _lazyloadPromise = require('lazyload-promise');

var _lazyloadPromise2 = _interopRequireDefault(_lazyloadPromise);

var _class2 = require('dom-helpers/class');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LazyLoad = (_temp = _class = function (_LazyTask) {
  _inherits(LazyLoad, _LazyTask);

  function LazyLoad(lazyView, props) {
    _classCallCheck(this, LazyLoad);

    props = (0, _objectAssign2.default)({}, LazyLoad.defaultProps, props);

    var _this = _possibleConstructorReturn(this, _LazyTask.call(this, lazyView, props));

    _this.onLoad = _this.onLoad.bind(_this);
    return _this;
  }

  LazyLoad.prototype.destroy = function destroy() {
    _LazyTask.prototype.destroy.call(this);
    this.onLoad = null;
  };

  LazyLoad.prototype.onLoad = function onLoad(img) {
    if (this.props.completeClass) {
      (0, _class2.addClass)(img, this.props.completeClass);
    }
  };

  LazyLoad.prototype.onStart = function onStart() {
    return (0, _lazyloadPromise2.default)(this.lazyView.node, { onLoad: this.onLoad });
  };

  return LazyLoad;
}(_lazytask2.default), _class.defaultProps = {
  selector: 'img',
  once: true,
  name: 'lazyload'
}, _temp);


module.exports = function (props) {
  return new _taskcreator2.default(LazyLoad, props);
};