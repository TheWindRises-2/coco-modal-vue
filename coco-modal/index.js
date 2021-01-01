
import CocoModal from './component';

CocoModal.install = function(v) {
  v.component(CocoModal.name, CocoModal);
  v.prototype.$coco = CocoModal.coco();
};
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(CocoModal);
}


export default CocoModal;
