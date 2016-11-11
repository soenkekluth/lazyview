import LazyTaskCreator from '../lazytaskcreator';
import LazyTask from '../lazytask';


class LazyInitTask extends LazyTask {
  constructor(lazyView, options) {
    super(lazyView, options, 'lazyinit');
  }

}

module.exports = options => {
  return new LazyTaskCreator(LazyInitTask, options);
};
