import LazyTaskCreator from '../lazytaskcreator';
import LazyTask from '../lazytask';

class LazyLoadTask extends LazyTask {

  constructor(lazyView, options, name) {
    options = options || {};
    options.destroyOnComplete = true;
    super(lazyView, options, 'lazyload');
  }

  init() {
    var el = this.lazyView.el;
    var src = el.getAttribute('data-src');
    var srcset = el.getAttribute('data-srcset');

    if (src || srcset) {
      super.init();
      this.dispatchLoad = this.dispatchLoad.bind(this);
    } else{
      this.destroy();
    }
  }


  destroy(){
    super.destroy();
    this.dispatchLoad = null;
  }


  dispatchLoad(event) {
    var el = this.lazyView.el;

    setTimeout(() => {
      // this.lazyView.scroll.trigger('scroll:resize');

    }, 100);

    if (this.options.loadClass) {
      el.classList.remove(this.options.loadClass);
    }

    if (this.options.completeClass) {
      el.classList.add(this.options.completeClass);
    }

    el.removeEventListener('load', this.dispatchLoad);

    if (this.options.onComplete) {
      this.options.onComplete.call(this, this.lazyView);
    }


    setTimeout(() => {
      // this.lazyView.scroll.trigger('scroll:resize');
      this.lazyView.update();
      if (this.options.destroyOnComplete) {
        this.destroy();
      }
    }, 10);

  }


  onEnter() {
    var el = this.lazyView.el;
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
      el.addEventListener('load', this.dispatchLoad);

      if (this.options.loadClass) {
        el.classList.add(this.options.loadClass);
      }

      el.removeAttribute('data-src');
      el.removeAttribute('data-srcset');
    }

    this.lazyView.removeOffset(this.name)


    if (this.options.onStart) {
      this.options.onStart.call(this, this.lazyView);
    }
  }
}

module.exports = options => {
  return new LazyTaskCreator(LazyLoadTask, options);
};
