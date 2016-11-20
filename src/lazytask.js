import assign from 'object-assign';

export default class LazyTask {

  static defaults = {
    destroyOnComplete: false,
    completeClass: null,
    initClass: null,
    onStart: null,
    onComplete: null,
    onEnter: null,
    onExit: null
  }

  constructor(lazyView, options, name = 'lazytask') {
    this.lazyView = lazyView;
    this.name = name;
    this.options = assign({}, LazyTask.defaults, options);
    this.onEnter = this.onEnter.bind(this);
    this.onExit = this.onExit.bind(this);
    this.init();
  }


  destroy() {
    this.lazyView.removeOffset(this.name);
    this.options = null;
    this.onEnter = null;
    this.onExit = null;
    this.lazyView = null;
  }


  init() {
    if (this.options.threshold) {
      this.lazyView.addOffset(this.name, this.options.threshold);
      this.lazyView.one('enter:' + this.name, this.onEnter);
      this.lazyView.one('exit:' + this.name, this.onExit);
    } else {
      this.lazyView.one('enter', this.onEnter);
      this.lazyView.one('exit', this.onExit);
    }
  }


  onStart(arg) {
    return Promise.resolve(arg);
  }

  onComplete(arg) {
    return Promise.resolve(arg);
  }

  onEnter() {

    const onStart = this.options.onStart || this.onStart;
    const onComplete = this.options.onComplete || this.onComplete;

    var result = onStart.call(this, this.lazyView);
    if (result.then) {
      return result.then(res => onComplete.call(this, res || this.lazyView))
    }
    return onComplete(result);
  }


  onExit() {

  }

}
