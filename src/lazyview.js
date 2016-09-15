import EventDispatcher from 'eventdispatcher';
import Scroll from 'scroll-events';
import domready from 'domready';
import delegate from 'delegatejs';
import LazyViewPlugin from './lazyview.plugin';
import assign from 'object-assign';

const isPlainObject = obj => Object.prototype.toString.call(obj) == '[object Object]';
const isArray = arr => Object.prototype.toString.call(arr) === '[object Array]';
const isLazyViewPlugin = obj => obj && obj.hasOwnProperty('creator');

const defaults = {
  enterClass: '',
  exitClass: '',
  threshold: 0
};

const getAbsolutBoundingRect = (el, fixedHeight) => {
  var rect = el.getBoundingClientRect();
  var height = fixedHeight || rect.height;
  var top = rect.top + Scroll.windowScrollY +height;
  return {
    top: top,
    bottom: rect.bottom + Scroll.windowScrollY - height,
    height: height,
    width: rect.width,
    left: rect.left,
    right: rect.right
  };
};

export default class LazyView extends EventDispatcher {

  static ENTER = 'enter';
  static EXIT = 'exit';

  static apply(elements, options, plugins) {

    if (elements && elements.length) {
      var collection = new LazyViewCollection();
      for (var i = 0; i < elements.length; i++) {
        collection.push(new LazyView(elements[i], options, plugins));
      }
      return collection;
    }

    return new LazyView(elements, options, plugins);
  }


  static plugin(creator) {
    return new LazyViewPlugin(creator);
  }

  constructor(...args) {

    if (args.length < 1) {
      throw 'non initialization object';
    }

    var elements;
    if (args[0] instanceof window.NodeList) {
      elements = [].slice.call(args[0], 1);
      args[0] = args[0][0];
    }

    let el = (args[0].tagName !== undefined) ? args[0] : null;
    let options = {};
    let plugins = [];

    if (args.length === 2) {

      if(typeof args[1] !== 'undefined'){
      if (isLazyViewPlugin(args[1])) {
        plugins.push(args[1]);
      } else if (isArray(args[1])) {
        plugins.concat(args[1]);
      } else if (isPlainObject(args[1])) {
        options = args[1];
      }}
    } else if (args.length === 3) {

      if(typeof args[1] !== 'undefined'){
        if (isLazyViewPlugin(args[1])) {
          plugins.push(args[1]);
        } else if (isArray(args[1])) {
          plugins = plugins.concat(args[1]);
        } else if (isPlainObject(args[1])) {
          options = args[1];
        }
      }
      if(typeof args[2] !== 'undefined'){
        if (isLazyViewPlugin(args[2])) {
          plugins.push(args[2]);
        } else if (isArray(args[2])) {
          plugins = plugins.concat(args[2]);
        } else if (isPlainObject(args[2])) {
          options = args[2];
        }
      }
    }

    super({ target: el });

    this.el = el;
    this.plugins = plugins;
    this.options = assign({}, defaults, options);

    this.setState({
      inView: false
    }, true);

    this.onScroll = delegate(this, this.checkInView);
    this.onResize = delegate(this, this.update);

    domready(() => this.init());

    if (elements && elements.length) {
      var collection = LazyView.apply(elements, options, plugins);
      collection.push(this);
      return collection;
    }
  }

  init() {

    var scrollTarget = Scroll.getScrollParent(this.el);
    this.scroll = Scroll.getInstance(scrollTarget);
    this.scroll.on('scroll:start', this.onScroll);
    this.scroll.on('scroll:progress', this.onScroll);
    this.scroll.on('scroll:stop', this.onScroll);
    this.scroll.on('scroll:resize', this.onResize);
    window.addEventListener('resize', this.onResize, false);
    window.addEventListener('orientationchange', this.onResize, false);


    this.cachePosition();

    var i = -1;
    while (++i < this.plugins.length) {
      this.plugins[i].creator(this);
    }



    // scrollTarget.addEventListener('load', (event) => {
    //   setTimeout(() => {
    //     // this.scroll.trigger('scroll:update');
    //     // this.update();
    //   }, 10);
    // }, false);

    this.checkInView();

  }

  render() {
    if (this.options.enterClass) {
      if (this.state.inView) {
        this.el.classList.add(this.options.enterClass);
      } else {
        this.el.classList.remove(this.options.enterClass);
      }
    }
  }


  update() {
    this.scroll.updateScrollPosition();
    this.cachePosition();
    this.checkInView();
  }

  checkInView() {
    const scrollY = this.scroll.y;
    if (scrollY <= (this.position.top - this.options.threshold) && (scrollY + this.clientHeight >= this.position.bottom + this.options.threshold)) {
      if (!this.state.inView) {
        this.setState({ inView: true }, !this.options.enterClass);
        this.dispatch(LazyView.ENTER);
      }
    } else {
      if (this.state.inView) {
        this.setState({ inView: false }, !this.options.enterClass);
        this.dispatch(LazyView.EXIT);
      }
    }
  }

  cachePosition() {
    this.clientHeight = this.scroll.clientHeight;
    this.scrollHeight = this.scroll.scrollHeight;
    this.position = getAbsolutBoundingRect(this.el);
  }

  setState(newState, silent) {
    this.state = newState;
    if (silent !== true) {
      this.render();
    }
  }

  destroy() {

    this.scroll.off('scroll:start', this.onScroll);
    this.scroll.off('scroll:progress', this.onScroll);
    this.scroll.off('scroll:stop', this.onScroll);
    this.scroll.off('scroll:update', this.onResize);

    if (!this.scroll.hasListeners()) {
      this.scroll.destroy();
      this.scroll = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize);
      window.removeEventListener('orientationchange', this.onResize);
    }

    this.onScroll = null;
    this.onResize = null;

    this.clientHeight = null;
    this.scrollHeight = null;
    this.position = null;
    this.options = null;
    this.el = null;
  }
}

class LazyViewCollection extends EventDispatcher {

  constructor() {
    super();
    this.items = [];
  }

  push(lazyView) {
    this.items.push(lazyView);
  }

  addListener(event, listener) {
    var i = -1;
    while (++i < this.items.length) {
      this.items[i].addListener(event, listener);
    }
    return this;
  }

  removeListener(event, listener) {
    var i = -1;
    while (++i < this.items.length) {
      this.items[i].removeListener(event, listener);
    }
    return this;
  }
}
