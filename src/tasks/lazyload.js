import LazyTaskCreator from '../lazytaskcreator';
import LazyTask from '../lazytask';

class LazyLoadTask extends LazyTask {

  constructor(lazyView, options, name) {
    options = options || {};
    options.destroyOnComplete = true;
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

      if (this.options.onComplete) {
        this.options.onComplete.call(this, this.lazyView);
      }

      this.lazyView.update();

      if (this.options.destroyOnComplete) {
        this.destroy();
      }

    }

  }


  onEnter() {

    if (!this.entered) {
      this.entered = true;

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

      this.lazyView.removeOffset(this.name)

      if (this.options.onStart) {
        this.options.onStart.call(this, this.lazyView);
      }
    }
  }
}

module.exports = options => {
  return new LazyTaskCreator(LazyLoadTask, options);
};
