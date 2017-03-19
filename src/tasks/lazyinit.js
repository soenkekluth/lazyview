import TaskCreator from '../task/taskcreator';
import LazyTask from '../task/lazytask';
import assign from 'object-assign';

class LazyInit extends LazyTask {

  static defaultProps = {
    once: true,
    name: 'lazyinit',
  }

  constructor(lazyView, props) {
    props = assign({}, LazyInit.defaultProps, props);
    super(lazyView, props);
  }

}

module.exports = props => {
  return new TaskCreator(LazyInit, props);
};
