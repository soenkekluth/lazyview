export default class TaskCreator {
  constructor(Task, options) {
    this.creator = (lazyView) => new Task(lazyView, options);
  }
}
