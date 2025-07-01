
# 适用场景 & 优点

在 web 开发中，我们经常需要将用户行为或性能数据上报到服务器。
为了不影响用户体验，开发者通常会在页面卸载时进行数据上报。
然而，传统的数据上报方式，如 `XMLHttpRequest` 或 `Fetch API`，容易受到页面卸载过程中的阻塞，导致数据丢失。
为了解决这个问题，`navigator.sendBeacon` API 被引入，它可以在页面卸载时安全、可靠地发送数据。

- 发送心跳包：可以使用 `navigator.sendBeacon` 发送心跳包，以保持与服务器的长连接，避免因为长时间没有网络请求而导致连接被关闭。
- 埋点：可以使用 `navigator.sendBeacon` 在页面关闭或卸载时记录用户在线时间，pv uv，以及错误日志上报 按钮点击次数。
- 发送用户反馈：可以使用 `navigator.sendBeacon` 发送用户反馈信息，如用户意见、bug 报告等，以便进行产品优化和改进


1. 不受页面卸载过程的影响，确保数据可靠发送。无视页面关闭，保证请求发送
2. 异步执行，不阻塞页面关闭或跳转。
3. 能够发送跨域请求。


ping请求 是html5 新增的 并且是sendBeacon 特有的 ping 请求 只能携带少量数据，并且不需要等待服务端响应，因此非常适合做埋点统计，以及日志统计相关功能。

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c8b5d356a02142ebb6722458125b016f~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

# 限制

只支持如下请求
+ 只能发送POST
+ 只能传送少量数据（64KB 以内）
+ 无法自定义请求头
+ sendBeacon 只能传输 [`ArrayBuffer`](https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FJavaScript%2FReference%2FGlobal_Objects%2FArrayBuffer "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer")、[`ArrayBufferView`](https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FJavaScript%2FReference%2FGlobal_Objects%2FTypedArray "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/TypedArray")、[`Blob`](https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FAPI%2FBlob "https://developer.mozilla.org/zh-CN/docs/Web/API/Blob")、[`DOMString`](https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FJavaScript%2FReference%2FGlobal_Objects%2FString "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String")、[`FormData`](https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FAPI%2FFormData "https://developer.mozilla.org/zh-CN/docs/Web/API/FormData") 或 [`URLSearchParams`](https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FAPI%2FURLSearchParams "https://developer.mozilla.org/zh-CN/docs/Web/API/URLSearchParams") 类型的数据

会被广告屏蔽插件拦截


#  demo

使用Blob 在sendBeacon中发送json
	注意发送的是post
```js
<button class="send">发送</button>

const send = document.querySelector('.send')
send.addEventListener('click', () => {
    let data = JSON.stringify({name:'test'})
    const blob = new Blob([data], { type: 'application/json' })
    navigator.sendBeacon('http://localhost:3000/api/beacon',blob,{
        type:"beacon"
    })
})
```