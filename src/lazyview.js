import EventDispatcher from 'eventdispatcher';
import Scroll from 'scrollfeatures';
import assign from 'object-assign';
import classNames from 'classnames/dedupe';
import debounce from 'lodash.debounce';
import TaskCreator from './task/taskcreator';

const isPlainObject = obj => Object.prototype.toString.call(obj) == '[object Object]';
const isArray = arr => Object.prototype.toString.call(arr) === '[object Array]';
const isTaskCreator = obj => obj && obj.hasOwnProperty('creator');


const getAbsolutBoundingRect = (el, fixedHeight) => {
  var rect = el.getBoundingClientRect();
  var height = fixedHeight || rect.height;
  var top = rect.top + Scroll.windowY;
  return {
    top: top,
    bottom: rect.bottom + Scroll.windowY,
    height: height,
    width: rect.width,
    left: rect.left,
    right: rect.right
  };
};


const nullPosition = {
  top: 0,
  bottom: 0,
  height: 0,
  width: 0
}

const getPositionStyle = (el) => {
  if (typeof window !== 'undefined') {
    const style = window.getComputedStyle(el, null);
    return style.getPropertyValue('position');
  }
  return null;
};

export default class LazyView extends EventDispatcher {


  static defaultProps = {
    autoInit: true,
    ignoreInitial: false,
    enterClass: null,
    exitClass: null,
    init: null,
    threshold: 0,
    children: false,
    offsets: null // {myoffset:100}
  };



  static ENTER = 'enter';
  static EXIT = 'exit';
  static ENTER_CHILD = 'enter:child';
  static EXIT_CHILD = 'exit:child';

  static apply(elements, ...rest) {

    if (elements && elements.length) {
      var collection = new LazyViewCollection();
      for (var i = 0; i < elements.length; i++) {
        collection.push(new LazyView(elements[i], ...rest));
      }
      return collection;
    }

    return new LazyView(elements, assign({}, props), tasks);
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
    let props = {};
    let tasks = [];

    if (args.length === 2) {

      if (typeof args[1] !== 'undefined') {
        if (isTaskCreator(args[1])) {
          tasks.push(args[1]);
        } else if (isArray(args[1])) {
          tasks.concat(args[1]);
        } else if (isPlainObject(args[1])) {
          props = args[1];
        }
      }
    } else if (args.length === 3) {

      if (typeof args[1] !== 'undefined') {
        if (isTaskCreator(args[1])) {
          tasks.push(args[1]);
        } else if (isArray(args[1])) {
          tasks = tasks.concat(args[1]);
        } else if (isPlainObject(args[1])) {
          props = args[1];
        }
      }
      if (typeof args[2] !== 'undefined') {
        if (isTaskCreator(args[2])) {
          tasks.push(args[2]);
        } else if (isArray(args[2])) {
          tasks = tasks.concat(args[2]);
        } else if (isPlainObject(args[2])) {
          props = args[2];
        }
      }
    }


    super({ target: el });

    this.el = el;
    this.tasks = tasks;
    this.props = assign({}, LazyView.defaultProps, props);
    this.offsetStates = {};
    this.children = [];
    this.lastChildrenQuery = null;
    this.watchChild = this.watchChild.bind(this);
    this.unwatchChild = this.unwatchChild.bind(this);
    nullPosition.top = this.props.threshold;
    this.offsetKeys = this.props.offsets ? Object.keys(this.props.offsets) : null;

    this.state = {
      firstRender: true,
      initialized: false,
      inView: false,
      progress: 0,
      position: getPositionStyle(this.el)
    };

    if (this.props.autoInit) {
      this.init();
    }

    if (elements && elements.length) {
      var collection = LazyView.apply(elements, ...args.splice(1, args.length));
      collection.push(this);
      return collection;
    }
  }


  init() {
    if (this.state.initialized) {
      return;
    }
    this.state.initialized = true;
    this.state.position = getPositionStyle(this.el);

    this.scroll = Scroll.getInstance(Scroll.getScrollParent(this.el));

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.update.bind(this);
    this.checkBounds = debounce(this.checkBounds.bind(this), 100);

    this.el.addEventListener('load', this.checkBounds, false);

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
      window.addEventListener('load', this.onResize, { capture: false, once: true });
      if (document.readyState !== 'complete') {
        document.addEventListener("DOMContentLoaded", this.onResize, { capture: false, once: true });
      }
    }

    this.watchChildren();
    this.update();
  }


  addOffset(name, value) {
    this.props.offsets = this.props.offsets || {};
    this.props.offsets[name] = value;
    this.offsetKeys = Object.keys(this.props.offsets);
  }

  removeOffset(name) {
    if (this.props.offsets && this.props.offsets.hasOwnProperty(name)) {
      delete this.props.offsets[name];
      this.offsetKeys = Object.keys(this.props.offsets);
    }
  }

  watchChildren() {

    if (!this.props.children) {
      return;
    }

    let children = [];

    if (typeof this.props.children === 'string') {
      children = this.el.querySelectorAll(this.props.children);
    } else if (isArray(this.props.children)) {
      for (let i = 0, l = this.props.children.length; i < l; i++) {
        const entry = this.props.children[i];
        if (typeof entry === 'string') {
          children = children.concat(Array.prototype.slice.call(this.el.querySelectorAll(entry)));
        } else if (entry.tagName) {
          children.push(entry);
        }
      }
    }

    Array.prototype.forEach.call(children, this.watchChild);
  }

  watchChild(domNode) {

    const hasChild = this.children.find(child => child.el === domNode);
    if (!hasChild) {
      let rect = getAbsolutBoundingRect(domNode);

      this.children.push({
        el: domNode,
        position: rect,
        state: {
          inView: false,
        }
      });
      this.watching = true;
    }
  }

  unwatchChild(domNode) {
    this.children = this.children.filter(child => (!child.el || child.el !== domNode));
    if (!this.children.length) {
      this.watching = false;
    }
  }

  render() {
    if (this.props.enterClass) {
      this.el.className = classNames(this.el.className, {
        [this.props.enterClass]: this.state.inView
      });
    }
  }


  checkBounds() {
    if (this.el && (this.el.clientHeight !== this.position.height)) {
      this.scroll.trigger('scroll:resize');
    }
  }

  onScroll() {

    this.updateViewState();

    if (this.state.inView && this.watching) {

      for (let i = 0, l = this.children.length; i < l; i++) {
        if (this.isInView(this.children[i].position)) {
          if (!this.children[i].state.inView) {
            this.children[i].state.inView = true;
            this.trigger('enter:child', { target: this.children[i].el });
          }
        } else {
          if (this.children[i].state.inView) {
            this.children[i].state.inView = false;
            this.trigger('exit:child', { target: this.children[i].el });
          }
        }
      }

      /*if (false || this.offsetKeys) {

        for (let i = 0, l = this.offsetKeys.length; i < l; i++) {
          var key = this.offsetKeys[i];
          var value = this.props.offsets[key];

          if (this.isInView(value)) {
            if (!this.offsetStates[key]) {
              this.offsetStates[key] = true;
              this.trigger('enter:' + key);
            }
          } else {
            if (this.offsetStates[key]) {
              this.offsetStates[key] = false;
              this.trigger('exit:' + key);
            }
          }
        }
      }*/
    }
  }

  update() {
    this.cachePosition();
    if (this.state.firstRender) {
      setTimeout(() => {
        this.onScroll();
      }, 0);
    } else {
      this.onScroll();
    }
  }

  isInView(position, offsetPosition = nullPosition) {
    const progress = this.getProgress(position, offsetPosition);
    return (progress >= 0 && progress <= 1);
  }

  getInnerProgress() {
    return ((this.position.top - this.scroll.clientHeight + this.scroll.y) / this.position.height);
  }

  getProgress(position, offsetPosition = nullPosition) {
    const posTop = (position.top - this.scroll.clientHeight + offsetPosition.top);
    return (this.scroll.y - posTop) / (this.scroll.clientHeight + position.height - offsetPosition.top);
  }

  updateViewState() {

    this.state.progress = this.getProgress(this.position, nullPosition);

    if (this.state.progress >= 0 && this.state.progress <= 1) {

      this.trigger('scroll', { progress: this.state.progress });

      if (!this.state.inView) {
        this.setInview(true, (this.props.enterClass === null));

        if (this.props.init) {
          this.props.init.call(this);
        }

        this.trigger(LazyView.ENTER);
      }
    } else {
      if (this.state.inView) {
        this.setInview(false, (this.props.enterClass === null));
        if (!(this.state.firstRender)) {
          this.trigger(LazyView.EXIT);
        }
      }
    }

    this.state.firstRender = false;
  }

  cachePosition() {
    this.position = getAbsolutBoundingRect(this.el);

    if (this.watching) {
      for (let i = 0, l = this.children.length; i < l; i++) {
        let rect = getAbsolutBoundingRect(this.children[i].el);
        this.children[i].position = rect;
      }
      return;
    }
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

    if (this.el) {
      this.el.removeListener('load', this.checkBounds);
    }

    this.onScroll = null;
    this.onResize = null;

    this.position = null;
    this.props = null;
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

  on(event, listener) {
    var i = -1;
    while (++i < this.items.length) {
      this.items[i].on(event, listener);
    }
    return this;
  }

  off(event, listener) {
    var i = -1;
    while (++i < this.items.length) {
      this.items[i].off(event, listener);
    }
    return this;
  }
}
