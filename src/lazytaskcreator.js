import assign from 'object-assign';

export default class LazyTaskCreator {

  constructor(Task, options) {
    this.creator = (lazyView) => new Task(lazyView, options);
  }

}
