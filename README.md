# coco-modal-vue
coco-modal的vue组件

 [coco-modal](https://github.com/TheWindRises-2/coco-modal)
 
```

import CocoModal from 'coco-modal-vue'

Vue.use(CocoModal)

```

```

<coco-modal v-model="open" :title="'coco modal'" :top="'300px'">
  hello world      
</coco-modal>

```
or
```
this.$coco('hello world','coco modal',{
  top:'300px'
})
```

## Examples


在线示例： [Examples](https://unpkg.com/coco-modal/example/example.html)
