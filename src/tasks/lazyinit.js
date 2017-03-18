import TaskCreator from '../task/taskcreator';
import LazyTask from '../task/lazytask';


class LazyInitTask extends LazyTask {
  constructor(lazyView, options) {
    super(lazyView, options, 'lazyinit');
  }

}

module.exports = options => {
  return new TaskCreator(LazyInitTask, options);
};
