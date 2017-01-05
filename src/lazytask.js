import assign from 'object-assign';

export default class LazyTask {

  static defaults = {
    destroyOnComplete: false,
    completeClass: null,
    initClass: null,
    onStart: null,
    onStop: null,
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
    this.lazyView.one('enter', this.onEnter);
    this.lazyView.one('exit', this.onExit);
    if (this.options.threshold) {
      this.lazyView.addOffset(this.name, this.options.threshold);
      this.lazyView.one('enter:' + this.name, this.onEnter);
      this.lazyView.one('exit:' + this.name, this.onExit);
    } else {
      this.lazyView.one('enter', this.onEnter);
      this.lazyView.one('exit', this.onExit);
    }
  }

  onStop(arg) {
    return Promise.resolve(arg);
  }

  onStart(lazyView) {
    return Promise.resolve(lazyView);
  }

  onComplete(lazyView) {
    return Promise.resolve(lazyView);
  }

  onAfterComplete(lazyView) {
    if (lazyView.el.clientHeight !== lazyView.position.height) {
      lazyView.scroll.trigger('scroll:resize');
    }
    return Promise.resolve(lazyView);
  }

  onEnter() {
    var result =
      this.onStart(this.lazyView)
      .then(arg => {
        if (this.options && this.options.onStart) {
          var res = this.options.onStart.call(this, this.lazyView);
          if (res.then) {
            return res;
          }
        }
        return arg;
      })
      .then(arg => this.onComplete(arg))
      .then(arg => this.onAfterComplete(arg))
      .then(arg => {
        if (this.options && this.options.onComplete) {
          var res = this.options.onComplete.call(this, this.lazyView);
          if (res.then) {
            return res;
          }
        }
        return arg;
      })
    return result;
  }


  onExit() {
    var lazyView = this.lazyView;
    var result =
      this.onStop(lazyView)
      .then(arg => {
        if (this.options && this.options.onStop) {
          var res = this.options.onStop.call(this, lazyView);
          if (res.then) {
            return res;
          }
        }
        return arg;
      })
    return result;
  }

}
