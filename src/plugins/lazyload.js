import LazyViewPlugin from '../lazyview.plugin';

module.exports = options => {

  return new LazyViewPlugin(lazyView => {

    var el = lazyView.el;
    var src = el.getAttribute('data-src');
    var srcset = el.getAttribute('data-srcset');

    var dispatchLoad = (event) => {
      setTimeout(() => {
        lazyView.scroll.trigger('scroll:resize');
        // lazyView.destroy();
      }, 100);
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

        el.removeAttribute('data-src');
        el.removeAttribute('data-srcset');
      }
    };
    if (src || srcset) {
      lazyView.once('enter', onEnter);
    } else {
      el = null;
      dispatchLoad = null;
      onEnter = null;
    }
  });

};
