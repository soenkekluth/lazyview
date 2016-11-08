import EventDispatcher from 'eventdispatcher';
import Scroll from 'scroll-events';
import domready from 'domready';
import LazyViewPlugin from './lazyview.plugin';
import assign from 'object-assign';
import deepAssign from 'deep-assign';

const isPlainObject = obj => Object.prototype.toString.call(obj) == '[object Object]';
const isArray = arr => Object.prototype.toString.call(arr) === '[object Array]';
const isLazyViewPlugin = obj => obj && obj.hasOwnProperty('creator');

var instanceName = 0;


const defaults = {
  ignoreInitial: false,
  enterClass: '',
  exitClass: '',
  threshold: 0,
  offsets: null // {myoffset:100}
};

const getAbsolutBoundingRect = (el, fixedHeight) => {
  var rect = el.getBoundingClientRect();
  var height = fixedHeight || rect.height;
  var top = rect.top + Scroll.windowScrollY + height;
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

  static ENTER_OFFSET = 'enter:offset';
  static EXIT_OFFSET = 'exit:offset';

  static apply(elements, ...rest) {

    if (elements && elements.length) {
      var collection = new LazyViewCollection();
      for (var i = 0; i < elements.length; i++) {
        collection.push(new LazyView(elements[i], ...rest));
      }
      return collection;
    }

    return new LazyView(elements, assign({}, options), plugins);
  }


  static plugin(creator) {
    return new LazyViewPlugin(creator);
  }

  constructor(...args) {

    if (!args.length) {
      throw 'non initialization object';
    }

    var elements;
    if (args[0] instanceof window.NodeList) {
      elements = [].slice.call(args[0], 1);
      // return LazyView.apply(elements, args.splice(1,args.length));
      args[0] = args[0][0];
    }

    let el = (args[0].tagName !== undefined) ? args[0] : null;
    let options = {};
    let plugins = [];

    if (args.length === 2) {

      if (typeof args[1] !== 'undefined') {
        if (isLazyViewPlugin(args[1])) {
          plugins.push(args[1]);
        } else if (isArray(args[1])) {
          plugins.concat(args[1]);
        } else if (isPlainObject(args[1])) {
          options = args[1];
        }
      }
    } else if (args.length === 3) {

      if (typeof args[1] !== 'undefined') {
        if (isLazyViewPlugin(args[1])) {
          plugins.push(args[1]);
        } else if (isArray(args[1])) {
          plugins = plugins.concat(args[1]);
        } else if (isPlainObject(args[1])) {
          options = args[1];
        }
      }
      if (typeof args[2] !== 'undefined') {
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

    this.instanceName = (++instanceName);
    this.el = el;
    this.plugins = plugins;
    this.options = assign({}, defaults, options);


    this.offsetStates = {};

    this.setState({
      inView: false
    }, true);

    this.onScroll = this.onScroll.bind(this);//this.updateViewState.bind(this);
    this.onResize = this.update.bind(this);

    domready(() => this.init());

    if (elements && elements.length) {
      var collection = LazyView.apply(elements, ...args.splice(1,args.length));
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

    this.isInitial = true;
    this.onScroll();

  }

  render() {
    if (this.options.enterClass || this.options.exitClass) {
      const directionY = this.scroll.directionY;
      if (this.state.inView) {
        !!this.options.enterClass && (this.el.classList.add(this.options.enterClass, directionY < 1 ? 'view-top' : 'view-bottom'));
        !!this.options.exitClass && this.el.classList.remove(this.options.exitClass);
      } else {
        !!this.options.enterClass && this.el.classList.remove(this.options.enterClass, 'view-top' , 'view-bottom');
        !!this.options.exitClass && this.el.classList.add(this.options.exitClass, directionY < 1 ? 'view-top' : 'view-bottom');
      }
    }
  }

  onScroll() {

    this.updateViewState();

    if(this.options.offsets){
      var keys = Object.keys(this.options.offsets);
      var i = -1;
      var l = keys.length;
      while(++i < l){
        var key = keys[i];
        var value = this.options.offsets[key];

        if(this.isInView(value)) {
          if(!this.offsetStates[key]){
            this.offsetStates[key] = true;
            this.dispatch('enter:'+key);
          }
        }else{
          if (this.offsetStates[key]) {
            this.offsetStates[key] = false;
            this.dispatch('exit:'+key);
          }
        }
      }
    }
  }

  update() {
    this.scroll.updateScrollPosition();
    this.cachePosition();
    this.updateViewState();
  }

  isInView(offset = 0){
    const scrollY = this.scroll.y;
    return (scrollY <= (this.position.top - offset) && (scrollY + this.clientHeight >= this.position.bottom + offset))
  }

  updateViewState() {
    if(this.isInView(this.options.threshold)) {
      if (!this.state.inView) {
        this.setState({ inView: true }, !this.options.enterClass);
        if (!this.isInitial || !this.options.ignoreInitial) {
          this.dispatch(LazyView.ENTER);
        }
      }
    } else {
      if (this.state.inView) {
        this.setState({ inView: false }, !this.options.enterClass);
        if (!this.isInitial || !this.options.ignoreInitial) {
          this.dispatch(LazyView.EXIT);
        }
      }
    }

    this.isInitial = false;
  }

  cachePosition() {
    this.clientHeight = this.scroll.clientHeight;
    this.scrollHeight = this.scroll.scrollHeight;
    this.position = getAbsolutBoundingRect(this.el);
  }

  setState(newState, silent) {
    this.state = assign({}, this.state, newState);
    if (silent !== true) {
      this.render();
    }
  }

  destroy() {

    this.scroll.off('scroll:start', this.onScroll);
    this.scroll.off('scroll:progress', this.onScroll);
    this.scroll.off('scroll:stop', this.onScroll);
    this.scroll.off('scroll:resize', this.onResize);

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
