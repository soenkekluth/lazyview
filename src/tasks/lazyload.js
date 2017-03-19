import TaskCreator from '../task/taskcreator';
import LazyTask from '../task/lazytask';
import assign from 'object-assign';
import lazyload from 'lazyload-promise';
import { addClass, removeClass } from 'dom-helpers/class';

class LazyLoad extends LazyTask {

  static defaultProps = {
    selector: 'img',
    once: true,
    name: 'lazyload',
  }

  constructor(lazyView, props) {
    props = assign({}, LazyLoad.defaultProps, props);
    super(lazyView, props);
    this.onLoad = this.onLoad.bind(this);
  }

  destroy() {
    super.destroy();
    this.onLoad = null;
  }

  onLoad(img) {
    if (this.props.completeClass) {
      addClass(img, this.props.completeClass);
    }
  }

  onStart() {
    return lazyload(this.lazyView.el, { onLoad: this.onLoad });
  }
}

module.exports = props => {
  return new TaskCreator(LazyLoad, props);
};
