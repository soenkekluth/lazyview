import EventDispatcher from 'eventdispatcher';
import Scroll from 'scrollfeatures';
import assign from 'object-assign';

const isPlainObject = obj => Object.prototype.toString.call(obj) == '[object Object]';
const isArray = arr => Object.prototype.toString.call(arr) === '[object Array]';
const isLazyTaskCreator = obj => obj && obj.hasOwnProperty('creator');

const defaults = {
  autoInit: true,
  ignoreInitial: false,
  enterClass: '',
  exitClass: '',
  init: null,
  threshold: 0,
  offsets: null // {myoffset:100}
};

const getAbsolutBoundingRect = (el, fixedHeight) => {
  var rect = el.getBoundingClientRect();
  var height = fixedHeight || rect.height;
  var top = rect.top + Scroll.windowY + height;
  return {
    top: top,
    bottom: rect.bottom + Scroll.windowY - height,
    height: height,
    width: rect.width,
    left: rect.left,
    right: rect.right
  };
};

const getPositionStyle = (el) => {
  if(typeof window !== 'undefined'){
    const style = window.getComputedStyle(el, null);
    return style.getPropertyValue('position');
  }
  return null;
};

export default class LazyView extends EventDispatcher {

  static ENTER = 'enter';
  static EXIT = 'exit';

  static apply(elements, ...rest) {

    if (elements && elements.length) {
      var collection = new LazyViewCollection();
      for (var i = 0; i < elements.length; i++) {
        collection.push(new LazyView(elements[i], ...rest));
      }
      return collection;
    }

    return new LazyView(elements, assign({}, options), tasks);
  }

  constructor(...args) {

    if (!args.length) {
      throw 'non initialization object';
    }

    var elements;
    if (args[0] instanceof window.NodeList) {
      elements = [].slice.call(args[0], 1);
      args[0] = args[0][0];
    }

    let el = (args[0].tagName !== undefined) ? args[0] : null;
    let options = {};
    let tasks = [];

    if (args.length === 2) {

      if (typeof args[1] !== 'undefined') {
        if (isLazyTaskCreator(args[1])) {
          tasks.push(args[1]);
        } else if (isArray(args[1])) {
          tasks.concat(args[1]);
        } else if (isPlainObject(args[1])) {
          options = args[1];
        }
      }
    } else if (args.length === 3) {

      if (typeof args[1] !== 'undefined') {
        if (isLazyTaskCreator(args[1])) {
          tasks.push(args[1]);
        } else if (isArray(args[1])) {
          tasks = tasks.concat(args[1]);
        } else if (isPlainObject(args[1])) {
          options = args[1];
        }
      }
      if (typeof args[2] !== 'undefined') {
        if (isLazyTaskCreator(args[2])) {
          tasks.push(args[2]);
        } else if (isArray(args[2])) {
          tasks = tasks.concat(args[2]);
        } else if (isPlainObject(args[2])) {
          options = args[2];
        }
      }
    }

    super({ target: el });

    this.el = el;
    this.tasks = tasks;
    this.options = assign({}, defaults, options);
    this.offsetStates = {};
    this.offsetKeys = this.options.offsets ? Object.keys(this.options.offsets) : null;

    this.state = {
      firstRender: true,
      initialized: false,
      inView: false,
      position: getPositionStyle(this.el)
    };

    if(this.options.autoInit) {
      setTimeout(()=>{this.init()},0);
    }

    if (elements && elements.length) {
      var collection = LazyView.apply(elements, ...args.splice(1, args.length));
      collection.push(this);
      return collection;
    }
  }


  init() {
    if(this.state.initialized){
      return;
    }
    this.state.initialized = true;
    this.state.position = getPositionStyle(this.el);

    this.scroll = Scroll.getInstance(Scroll.getScrollParent(this.el));

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.update.bind(this);

    var i = -1;
    while (++i < this.tasks.length) {
      this.tasks[i].creator(this);
    }

    this.scroll.on('scroll:start', this.onScroll);
    this.scroll.on('scroll:progress', this.onScroll);
    this.scroll.on('scroll:stop', this.onScroll);
    this.scroll.on('scroll:resize', this.onResize);

    if (typeof window !== 'undefined') {
      window.addEventListener('orientationchange', this.onResize, false);
      window.addEventListener('load', this.onResize, false);
      if (document.readyState !== 'complete') {
        document.addEventListener("DOMContentLoaded", this.onResize, false);
      }
    }

    this.update();
  }


  addOffset(name, value) {
    this.options.offsets = this.options.offsets || {};
    this.options.offsets[name] = value;
    this.offsetKeys = Object.keys(this.options.offsets);
  }

  removeOffset(name) {
    if (this.options.offsets && this.options.offsets.hasOwnProperty(name)) {
      delete this.options.offsets[name];
      this.offsetKeys = Object.keys(this.options.offsets);
    }
  }

  render() {
    if (this.options.enterClass || this.options.exitClass) {
      const directionY = this.scroll.directionY;
      if (this.state.inView) {
        !!this.options.enterClass && (this.el.classList.add(this.options.enterClass, directionY < 1 ? 'view-top' : 'view-bottom'));
        !!this.options.exitClass && this.el.classList.remove(this.options.exitClass);
      } else {
        !!this.options.enterClass && this.el.classList.remove(this.options.enterClass, 'view-top', 'view-bottom');
        !!this.options.exitClass && this.el.classList.add(this.options.exitClass, directionY < 1 ? 'view-top' : 'view-bottom');
      }
    }
  }

  onScroll() {

    this.updateViewState();

    if (this.offsetKeys) {

      for(let i = 0, l = this.offsetKeys.length; i<l; i++) {
        var key = this.offsetKeys[i];
        var value = this.options.offsets[key];

        if (this.isInView(value)) {
          if (!this.offsetStates[key]) {
            this.offsetStates[key] = true;
            this.dispatch('enter:' + key);
          }
        } else {
          if (this.offsetStates[key]) {
            this.offsetStates[key] = false;
            this.dispatch('exit:' + key);
          }
        }
      }
    }
  }

  update() {
    this.cachePosition();
    this.onScroll();
  }

  isInView(offset = 0) {
    if (this.state.position === 'fixed') {
      return true;
    }
    const scrollY = this.scroll.y;
    return (scrollY <= (this.position.top - offset) && (scrollY + this.scroll.clientHeight >= this.position.bottom + offset))
  }

  updateViewState() {
    if (this.isInView(this.options.threshold)) {
      if (!this.state.inView) {

        this.setInview(true, !this.options.enterClass);

        if (this.options.init) {
          this.options.init.call(this);
        }
        if (!(this.state.firstRender && this.options.ignoreInitial)) {
          this.dispatch(LazyView.ENTER);
        }
      }
    } else {
      if (this.state.inView) {
        this.setInview(false, !this.options.enterClass);
        if (!(this.state.firstRender && this.options.ignoreInitial)) {
          this.dispatch(LazyView.EXIT);
        }
      }
    }

    this.state.firstRender = false;
  }

  cachePosition() {
    this.position = getAbsolutBoundingRect(this.el);
  }

  setInview(value, silent) {
    this.state.inView = value;
    if (silent !== true) {
      this.render();
    }
  }

  destroy() {

    if (this.scroll) {
      this.scroll.off('scroll:start', this.onScroll);
      this.scroll.off('scroll:progress', this.onScroll);
      this.scroll.off('scroll:stop', this.onScroll);
      this.scroll.off('scroll:resize', this.onResize);

      if (!this.scroll.hasListeners()) {
        this.scroll.destroy();
        this.scroll = null;
      }
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('orientationchange', this.onResize);
      window.removeEventListener('load', this.onResize);
      if (document.readyState !== 'complete') {
        document.removeEventListener("DOMContentLoaded", this.onResize);
      }
    }

    this.onScroll = null;
    this.onResize = null;

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
