# nodejs 入门
# 分析你的node应用
```
import { createServer } from 'node:http';
const hostname = '127.0.0.1';
const port = 3000;
const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```
## 环境
dev test staging production
## 分析node应用
`NODE_ENV=production node --prof app.js`
--prof参数生成一个 xx.log文件会有性能的描述

```
curl -X GET "http://localhost:8080/newUser?username=matt&password=password"
ab -k -c 20 -n 250 "http://localhost:8080/auth?username=matt&password=password"
```
对网站负载
`node --prof-process isolate-0xnnnnnnnnnnnn-v8.log > processed.txt`
来理解性能文件在描述什么
# fetch data
## Undici
+ Undici
  + pool
  + stream
## webSocket
```js
// Creates a new WebSocket connection to the specified URL.
const socket = new WebSocket('ws://localhost:8080');
// Executes when the connection is successfully established.
socket.addEventListener('open', event => {
  console.log('WebSocket connection established!');
  // Sends a message to the WebSocket server.
  socket.send('Hello Server!');
});
// Listen for messages and executes when a message is received from the server.
socket.addEventListener('message', event => {
  console.log('Message from server: ', event.data);
});
// Executes when the connection is closed, providing the close code and reason.
socket.addEventListener('close', event => {
  console.log('WebSocket connection closed:', event.code, event.reason);
});
// Executes if an error occurs during the WebSocket communication.
socket.addEventListener('error', error => {
  console.error('WebSocket error:', error);
});
```
Node.js v22 不提供内置的原生 WebSocket 服务器实现。
要创建接受来自 Web 浏览器或其他客户端的传入连接的 WebSocket 服务器，仍然需要使用 ws 或 socket.io 等库。
这意味着虽然 Node.js 现在可以轻松连接到 WebSocket 服务器，但它仍然需要外部工具才能成为 WebSocket 服务器。

# node中使用ts
`npm add --save-dev @types/node`
`node --experimental-strip-types example.ts` 
在 V22.6.0 ，这样你现在可以在 Node.js 中直接运行 TypeScript 代码
