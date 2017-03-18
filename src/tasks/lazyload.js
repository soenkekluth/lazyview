import TaskCreator from '../task/taskcreator';
import LazyTask from '../task/lazytask';

class LazyLoadTask extends LazyTask {

  constructor(lazyView, options, name) {
    options = options || {};
    options.once = true;
    super(lazyView, options, 'lazyload');
  }

  getLazyItem(el) {

    var src = el.getAttribute('data-src');
    var srcset = el.getAttribute('data-srcset');
    var isLazy = !!(src || srcset);

    if (isLazy) {

      var willLoad = false;
      if (src && el.getAttribute('src') !== src) {
        willLoad = true;
      }

      if (srcset && el.getAttribute('srcset') !== srcset) {
        willLoad = true
      }

      if (willLoad) {
        return el;
      }
    }
    return null;
  }

  init() {

    this.mediaToLoad = [];
    this.entered = false;

    var el = this.lazyView.el;
    if (this.getLazyItem(el)) {
      this.mediaToLoad.push(el);
    } else {
      var elems = el.querySelectorAll('img');
      for (let i = 0, l = elems.length; i < l; i++) {
        var elem = elems[i];
        if (this.getLazyItem(elem)) {
          this.mediaToLoad.push(elem);
        }
      }
    }

    this.loadCount = this.mediaToLoad.length;

    if (this.loadCount) {
      super.init();
      this.onLoad = this.onLoad.bind(this);
    } else {
      this.destroy();
    }
  }


  destroy() {
    super.destroy();
    this.onLoad = null;
  }


  onLoad(event) {

    var el = event.target;

    --this.loadCount;

    el.removeEventListener('load', this.onLoad);
    el.removeEventListener('error', this.onLoad);

    if (this.options.loadClass) {
      el.classList.remove(this.options.loadClass);
    }

    if (this.options.completeClass) {
      el.classList.add(this.options.completeClass);
    }

    if (this.loadCount === 0) {

      this.loadResolver(this.lazyView);

      if (this.options.once) {
        this.destroy();
      }
    }
  }


  onStart() {

    return new Promise((resolve, reject) => {

      this.loadResolver = resolve;
      if(!this.mediaToLoad.length){
        this.loadResolver(this.lazyView);
        if (this.options.once) {
          this.destroy();
        }
        return;
      }

      for (let i = 0, l = this.mediaToLoad.length; i < l; i++) {
        var el = this.mediaToLoad[i];


        var src = el.getAttribute('data-src');
        var srcset = el.getAttribute('data-srcset');

        var isChanged = false;
        if (src && el.getAttribute('src') !== src) {
          isChanged = true;
          el.setAttribute('src', src);
        }

        if (srcset && el.getAttribute('srcset') !== srcset) {
          isChanged = true;
          el.setAttribute('srcset', srcset);
        }

        if (isChanged) {
          el.addEventListener('load', this.onLoad);
          el.addEventListener('error', this.onLoad);

          if (this.options.loadClass) {
            el.classList.add(this.options.loadClass);
          }

          el.removeAttribute('data-src');
          el.removeAttribute('data-srcset');
        }
      }

      // this.lazyView.removeOffset(this.name)
    });

  }
}

module.exports = options => {
  return new TaskCreator(LazyLoadTask, options);
};
