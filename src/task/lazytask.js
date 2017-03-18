import assign from 'object-assign';

export default class LazyTask {

  static defaultProps = {
    name: 'lazytask',
    once: false,
    completeClass: null,
    initClass: null,
    onStart: null,
    onStop: null,
    onComplete: null,
    onEnter: null,
    onExit: null
  }

  constructor(lazyView, props) {
    this.lazyView = lazyView;
    this.name = name;
    this.props = assign({}, LazyTask.defaultProps, props);
    this.onEnter = this.onEnter.bind(this);
    this.onExit = this.onExit.bind(this);
    this.init();
  }


  destroy() {
    this.lazyView.removeOffset(this.name);
    this.props = null;
    this.onEnter = null;
    this.onExit = null;
    this.lazyView = null;
  }


  init() {
    this.lazyView.one('enter', this.onEnter);
    this.lazyView.one('exit', this.onExit);
    if (this.props.threshold) {
      this.lazyView.addOffset(this.name, this.props.threshold);
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
    lazyView.checkBounds();
    return Promise.resolve(lazyView);
  }

  onEnter() {
    var result =
      this.onStart(this.lazyView)
      .then(arg => {
        if (this.props && this.props.onStart) {
          var res = this.props.onStart.call(this, this.lazyView);
          if (res.then) {
            return res;
          }
        }
        return arg;
      })
      .then(arg => this.onComplete(arg))
      .then(arg => this.onAfterComplete(arg))
      .then(arg => {
        if (this.props && this.props.onComplete) {
          var res = this.props.onComplete.call(this, this.lazyView);
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
        if (this.props && this.props.onStop) {
          var res = this.props.onStop.call(this, lazyView);
          if (res.then) {
            return res;
          }
        }
        return arg;
      })
    return result;
  }

}
