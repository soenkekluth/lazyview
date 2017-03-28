import EventDispatcher from 'eventdispatcher';
import Scroll from 'scrollfeatures';
import assign from 'object-assign';
import { addClass, removeClass } from 'dom-helpers/class';
import debounce from 'lodash.debounce';
import TaskCreator from './task/taskcreator';

const isPlainObject = obj => Object.prototype.toString.call(obj) == '[object Object]';
const isArray = arr => Object.prototype.toString.call(arr) === '[object Array]';
const isTaskCreator = obj => obj && obj.hasOwnProperty('creator');

const getAbsolutBoundingRect = (node, fixedHeight) => {
  var rect = node.getBoundingClientRect();
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

const getPositionStyle = (node) => {
  if (typeof window !== 'undefined') {
    const style = window.getComputedStyle(node, null);
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
    offsets: null
  };

  static ENTER = 'enter';
  static EXIT = 'exit';
  static ENTER_CHILD = 'enter:child';
  static EXIT_CHILD = 'exit:child';

  static apply(nodes, props = {}, tasks = []) {

    if (nodes && nodes.length) {
      var collection = new LazyViewCollection();
      for (var i = 0; i < nodes.length; i++) {
        collection.push(new LazyView({node: nodes[i], props, tasks}));
      }
      return collection;
    }

    return new LazyView(nodes, assign({}, props), tasks);
  }

 constructor({node = null, props = {}, tasks = []}) {

    if (!node) {
      throw 'non initialization object';
    }

    let nodes;
    if (node instanceof window.NodeList) {
      nodes = [].slice.call(node, 1);
      node = node[0];
    }

    super({ target: node });

    this.node = node;
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
      position: getPositionStyle(this.node)
    };

    if (this.props.autoInit) {
      this.init();
    }

    if (nodes && nodes.length) {
      var collection = LazyView.apply(nodes, props, tasks);
      collection.push(this);
      return collection;
    }
  }

  /*constructor(...args) {

    if (!args.length) {
      throw 'non initialization object';
    }

    var nodes;
    if (args[0] instanceof window.NodeList) {
      nodes = [].slice.call(args[0], 1);
      args[0] = args[0][0];
    }

    let node = (args[0].tagName !== undefined) ? args[0] : null;
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

    super({ target: node });

    this.node = node;
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
      position: getPositionStyle(this.node)
    };

    if (this.props.autoInit) {
      this.init();
    }

    if (nodes && nodes.length) {
      var collection = LazyView.apply(nodes, ...args.splice(1, args.length));
      collection.push(this);
      return collection;
    }
  }*/

  init() {
    if (this.state.initialized) {
      return;
    }
    this.state.initialized = true;
    this.state.position = getPositionStyle(this.node);

    this.scroll = Scroll.getInstance(Scroll.getScrollParent(this.node));

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.update.bind(this);
    this.checkBounds = debounce(this.checkBounds.bind(this), 100);

    this.node.addEventListener('load', this.checkBounds, false);

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
      children = this.node.querySelectorAll(this.props.children);
    } else if (isArray(this.props.children)) {
      for (let i = 0, l = this.props.children.length; i < l; i++) {
        const entry = this.props.children[i];
        if (!entry) {
          continue;
        }
        if (typeof entry === 'string') {
          let els = Array.prototype.slice.call(this.node.querySelectorAll(entry));
          if (els && els.length) {
            children = children.concat(els);
          }
        } else if (typeof entry.nodeType === 'undefined') {
          children.push(entry);
        }
      }
    }

    Array.prototype.forEach.call(children, this.watchChild);
  }

  watchChild(node) {
    if (!node || typeof node.nodeType === 'undefined') {
      console.warn('node is invalid');
      return;
    }
    const hasChild = this.children.filter(child => child.node === node).length > 0;

    if (!hasChild) {
      let rect = getAbsolutBoundingRect(node);

      this.children.push({
        node: node,
        position: rect,
        state: {
          inView: false,
        }
      });
      this.watching = true;
    }
  }

  unwatchChild(node) {
    if (!node || typeof node.nodeType === 'undefined') {
      console.warn('node is invalid');
      this.invalidateChildren();
      return;
    }
    this.children = this.children.filter(child => (!!child.node && child.node !== node));
    if (!this.children.length) {
      this.watching = false;
    }
  }

  render() {
    if (this.props.enterClass) {
      if (this.state.inView) {
        addClass(this.node, this.props.enterClass);
      } else {
        removeClass(this.node, this.props.enterClass);
      }
    }
  }

  checkBounds() {
    if (this.node && (this.node.clientHeight !== this.position.height)) {
      this.scroll.trigger('scroll:resize');
    }
  }

  onScroll() {

    this.updateViewState();

    if (this.state.inView && this.watching) {

      for (let i = 0, l = this.children.length; i < l; i++) {
        if(!this.children[i] || !this.children[i].position){
          continue;
        }
        if (this.isInView(this.children[i].position)) {
          if (!this.children[i].state.inView) {
            this.children[i].state.inView = true;
            this.trigger('enter:child', { target: this.children[i].node });
          }
        } else {
          if (this.children[i].state.inView) {
            this.children[i].state.inView = false;
            this.trigger('exit:child', { target: this.children[i].node });
          }
        }
      }
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

  invalidateChildren() {
    if (this.children.length) {
      this.children = this.children.filter(child => (child && child.node));
      this.watching = this.children.length > 0;
    } else {
      this.watching = false;
    }
  }

  cachePosition() {
    this.position = getAbsolutBoundingRect(this.node);
    // this.invalidateChildren();
    if (this.watching) {
      for (let i = 0, l = this.children.length; i < l; i++) {
        if (this.children[i] && this.children[i].node) {
          let rect = getAbsolutBoundingRect(this.children[i].node);
          if(this.children[i]){
            this.children[i].position = rect;
          }
        }
      }
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

    if (this.node) {
      this.node.removeListener('load', this.checkBounds);
    }

    this.onScroll = null;
    this.onResize = null;

    this.position = null;
    this.props = null;
    this.node = null;
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
