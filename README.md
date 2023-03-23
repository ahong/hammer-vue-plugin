# hammer-vue-plugin

[Hammer.js](http://hammerjs.github.io/) 是一个可以识别 touch、mouse 和 pointerEvents 的手势库，而 hammer-vue-plugin 是基于 Hammer.js 实现的 Vue 插件，允许以 Vue 指令的方式快速添加手势监听器。



## 安装

```bash
npm i hammer-vue-plugin
```



## 接口

### 指令列表

v-hammer

- 作用：绑定事件监听器
- 参数：事件名，不支持动态参数
- 指令值：Function | null

v-hammer-manager-options

- 作用：设置 Manager 实例
- 指令值：Object

v-hammer-recognizer-options

- 作用：设置 Recognizer 识别器
- 指令值：Object | Array



### 标准事件

以下标准事件只使用 `v-hammer` 指令添加事件监听器即可：

- tap：点击事件，一个手指放下并快速抬起
  - v-hammer:tap 单击
  - v-hammer:doubletap  双击
- pan：拖动事件，一个手指放下并移动
  - v-hammer:pan
  - v-hammer:panstart
  - v-hammer:panmove
  - v-hammer:panend
  - v-hammer:pancancel
  - v-hammer:panleft
  - v-hammer:panright
  - v-hammer:panup
  - v-hammer:pandown
- swipe：滑动事件，一个手指放下并快速滑动
  - v-hammer:swipe
  - v-hammer:swipeleft
  - v-hammer:swiperight
  - v-hammer:swipeup
  - v-hammer:swipedown
- press：长按事件，一个手指放下并保持一段时间的时间
  - v-hammer:press
  - v-hammer:pressup
- pinch：捏合事件，两个手指放下并缩放
  - v-hammer:pinch
  - v-hammer:pinchstart
  - v-hammer:pinchmove
  - v-hammer:pinchend
  - v-hammer:pinchcancel
  - v-hammer:pinchin
  - v-hammer:pinchout
- rotate：旋转事件，两个手指放下并旋转
  - v-hammer:rotate
  - v-hammer:rotatestart
  - v-hammer:rotatemove
  - v-hammer:rotateend
  - v-hammer:rotatecancel



## 使用

### 添加/移除事件监听器

```vue
<div v-hammer:tap="onTap"></div>

<!-- 通过 bind 给监听器传递参数 -->
<div v-hammer:tap="onTap.bind(this, 'ahong')"></div>

<!-- 使用 null 移除事件 -->
<div v-hammer:tap="null"></div>
```



### Hammer Manager 配置

```vue
<div v-hammer-manager-options="{ enable: false }"></div>
```

**配置项：**

- enable：Boolean
- domEvents：Boolean
- touchAction：String，默认 compute，可选值有 compute、auto、pan-y、pan-x、none
- cssProps：Object，只在初始绑定时生效，无法更新（PS：Hammer.Manager.prototype.set 不支持更新此配置）

> 更多配置说明见：http://hammerjs.github.io/api/



### Hammer Recognizer 配置

```vue
<!-- 设置 doubletap 事件可以与 tap 事件一起被识别 -->
<div
    v-hammer:tap="onTap"
    v-hammer:doubletap="onDoubleTap"
    v-hammer-recognizer-options="{
        event: 'doubletap', recognizeWith: 'tap'
    }"
></div>
```

```vue
<!-- 设置多个识别器 -->
<div
    v-hammer-recognizer-options="[
        { type: 'tap', pointers: 2 },
        { type: 'pan', direction: 'DIRECTION_LEFT' }
    ]"
></div>
```

配置项：

- type：String，必须，可选值有 tap、pan、swipe、press、pinch、rotate，用于确定所需设置的识别器类型
- event：String，事件名，是 Hammer 识别手势时触发的唯一名称，不传时设置的是 type 对应的识别器

> 每种识别器都有自己的配置项，具体配置见 [Tap](http://hammerjs.github.io/recognizer-tap/)、[Pan](http://hammerjs.github.io/recognizer-pan/)、[Swipe](http://hammerjs.github.io/recognizer-swipe/)、[Press](http://hammerjs.github.io/recognizer-press/)、[Pinch](http://hammerjs.github.io/recognizer-pinch/)、[Rotate](http://hammerjs.github.io/recognizer-rotate/)

说明：

- doubletap 属于插件内置的自定义事件，在设置 doubletap 识别器的时候需要使用 event 指定。
- 如果 recognizeWith、dropRecognizeWith、requireFailure、dropRequireFailure 方法报错，说明无法获取对应的识别器，可以检查是否添加了对应的识别器，或检查指令的绑定顺序是否有问题



### 自定义事件

> Hammer.js 支持自定义识别器，实现更加丰富的手势。

结合 v-hammer 与 v-hammer-recognizer-options 指令可以实现自定义事件，例如下面演示了自定义三次点击的事件：

```vue
<div
    v-hammer:tripletap="onCustom"
    v-hammer-recognizer-options="{ type: 'tap', event: 'tripletap', taps: 3 }"
></div>
```



## 可优化点

- Rollup 打包是否有优化空间？
- 怎么实现 stopPropagation、preventDefault？
