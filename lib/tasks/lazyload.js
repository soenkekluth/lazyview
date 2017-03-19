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

var _lazyloadPromise = require('lazyload-promise');

var _lazyloadPromise2 = _interopRequireDefault(_lazyloadPromise);

var _class2 = require('dom-helpers/class');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LazyLoad = (_temp = _class = function (_LazyTask) {
  (0, _inherits3.default)(LazyLoad, _LazyTask);

  function LazyLoad(lazyView, props) {
    (0, _classCallCheck3.default)(this, LazyLoad);

    props = (0, _objectAssign2.default)({}, LazyLoad.defaultProps, props);

    var _this = (0, _possibleConstructorReturn3.default)(this, _LazyTask.call(this, lazyView, props));

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
    return (0, _lazyloadPromise2.default)(this.lazyView.el, { onLoad: this.onLoad });
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