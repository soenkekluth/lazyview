import LazyViewPlugin from '../lazyview.plugin';
import assign from 'object-assign';

const defaults = {
  destroy: false
}

module.exports = options => {

  return new LazyViewPlugin((lazyView) => {
    var opts = assign({},defaults, options);
    var el = lazyView.el;
    var src = el.getAttribute('data-src');
    var srcset = el.getAttribute('data-srcset');

    var dispatchLoad = (event) => {
      setTimeout(() => {
        lazyView.scroll.trigger('scroll:resize');
        if(opts.destroy){
          lazyView.destroy();
        }
      }, 100);
      if(options.loadClass){
        el.classList.remove(opts.loadClass);
      }
      if(options.completeClass) {
        el.classList.add(opts.completeClass);
      }
      el.removeEventListener('load', dispatchLoad);
    };

    var onEnter = () => {

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
        el.addEventListener('load', dispatchLoad);

        if(opts.loadClass){
          el.classList.add(opts.loadClass);
        }

        el.removeAttribute('data-src');
        el.removeAttribute('data-srcset');
      }

      if(lazyView.options.offsets && lazyView.options.offsets.threshold){
        delete lazyView.options.offsets.threshold;
      }
    };


    if (src || srcset) {

      if(opts.threshold){
        lazyView.options.offsets = lazyView.options.offsets || {};
        lazyView.options.offsets.threshold = options.threshold;
        lazyView.once('enter:threshold', onEnter);
      }else{
        lazyView.once('enter', onEnter);
      }
    } else {
      el = null;
      dispatchLoad = null;
      onEnter = null;
    }
  });

};
