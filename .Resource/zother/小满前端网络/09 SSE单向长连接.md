# 适用场景

+ **chatGPT 返回的数据 就是使用的SSE 技术**
+ **实时数据大屏 如果只是需要展示 实时的数据可以使用SSE技术 而不是非要使用webSocket**

# 与websocket差异

+ sse和websocket都是长连接
	+ see属于是后端单向向前端推送
	+ websocket属于是双工通信，两边都可以发

+ SSE 的连接状态仅有三种：已连接、连接中、已断开。
	+ 连接状态是由浏览器自动维护的，客户端无法手动关闭或重新打开连接。
	+ 而 WebSocket 连接的状态更灵活，可以手动打开、关闭、重连等。
# api用法

## 后端

```js
import express from 'express';
const app = express();
app.get('/api/sse', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream', //核心返回数据流
        'Connection': 'close'
    })
    const data = fs.readFileSync('./index.txt', 'utf8')
    const total = data.length;
    let current = 0;
    //mock sse 数据
    let time = setInterval(() => {
        console.log(current, total)
        if (current >= total) {
            console.log('end')
            clearInterval(time)
            return
        }
        //返回自定义事件名
        res.write(`event:lol\n`)
        /返回数据
        res.write(`data:${data.split('')[current]}\n\n`)
        current++
    }, 300)
})
app.listen(3000, () => {
    console.log('Listening on port 3000');
});
```
+ `'Content-Type': 'text/event-stream'`通过content type来设置请求类型为sse
+ "res.write(`event:lol\n`)" `event: eventType`来标注事件类型
	+ 因为前端默认是接收`messgae`类型，所以一般使用"res.write(`data:lol\n`)" 用data来标注

## 前端

### EventSource

`const eventSource = new EventSource(url, options);`

`options`：Object 类型，表示可选参数。常用的可选参数包括：

- `withCredentials`：Boolean 类型，表示是否允许发送 Cookie 和 HTTP 认证信息。默认为 false。
- `headers`：Object 类型，表示要发送的请求头信息。
- `retryInterval`：Number 类型，表示与服务器失去连接后，重新连接的时间间隔。默认为 1000 毫秒。

### onmessage

```js
eventSource.onmessage = function(event) {
  console.log('接收到数据：', event);
};
```

### 通过监听器 & 自定义事件

```js
const sse = new EventSource('http://localhost:3000/api/sse' )

sse.addEventListener('open', (e) => {
    console.log(e.target)
})

// 一般事件
sse.addEventListener('message', (e) => {
    console.log(e.data)
})

//对应后端nodejs自定义的事件名lol
sse.addEventListener('lol', (e) => {
    console.log(e.data)
})
```

### readyState

```js
if (eventSource.readyState === EventSource.CONNECTING) {
  console.log('正在连接服务器...');
} else if (eventSource.readyState === EventSource.OPEN) {
  console.log('已经连接上服务器！');
} else if (eventSource.readyState === EventSource.CLOSED) {
  console.log('连接已经关闭。');
}
```

### open

```js
eventSource.onopen = function(event) {
  console.log('连接成功！', event);
};
```

### close

```
eventSource.close();
```
`close()` 方法用于关闭 `EventSource` 对象与服务器的连接，停止接收服务器发送的数据。

