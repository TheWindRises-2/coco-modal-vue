# coco-modal-vue
 [coco-modal](https://github.com/TheWindRises-2/coco-modal) 的vue组件


 
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


[在线示例](https://unpkg.com/coco-modal/example/example.html)

##所有参数

```
    {
        maskClose: true,
        header: true,
        footer: true,
        title: '提示',
        text: '',
        width: '500px',
        top: '15vh',
        inputAttrs: false,
        escClose: true,
        okButton: true,
        cancelButton: true,
        okText: '确定',
        cancelText: '取消',
        closeButton: true,
        html: '',
        zIndexOfModal: 1995,
        zIndexOfMask: 2008,
        zIndexOfActiveModal: 2020,
        autoFocusOkButton: true,
        autoFocusInput: true,
        fullScreen: false,
        borderRadius: '6px',
        blur: false,
        buttonColor: '#4285ff',
        onMount(){},
        hooks: {
          open(){},
          opened(){},
          close(){},
          closed(){}
        },
        animation: true
    }

```
