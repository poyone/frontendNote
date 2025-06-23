[link](https://juejin.cn/post/7238072027637186617)

相比于fetch，xhr请求可以方便的获取到进度，超时，以及可以abort

我们需要使用 open() 方法打开一个请求，该方法会初始化一个请求，但并不会发送请求。
它有三个必填参数以及一个可选参数
- method：请求的 HTTP 方法，例如 GET、POST 等。
- url：请求的 URL 地址。
- async：是否异步处理请求，默认为 true，即异步请求。

onreadystatechange 一个回调函数，在每次状态发生变化时被调用。
- readyState 0：未初始化，XMLHttpRequest 对象已经创建，但未调用 open 方法。
- readyState 1：已打开，open 方法已经被调用，但 send 方法未被调用。
- readyState 2：已发送，send 方法已经被调用，请求已经被服务器接收。
- readyState 3：正在接收，服务器正在处理请求并返回数据。
- readyState 4：完成，服务器已经完成了数据传输。

XMLHttpRequest 对象，调用 send() 方法发送请求后，会监听readystatechange
该事件会在请求过程中多次触发
只有在state = 4 的时候 `onload`事件才会触发

get
```js
const xhr = new XMLHttpRequest();
xhr.open('GET', 'http://localhost:3000/api/txt')
xhr.onload = function() {
  if (xhr.status === 200) {
        document.querySelector('#result').innerText = xhr.responseText;
    }
    else {
       console.log('Request failed.  Returned status of ' + xhr.status);
   }
};
xhr.send(null);
```

post json
```js
const xhr = new XMLHttpRequest();
xhr.open('POST', 'http://localhost:3000/api/post')
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onload = function() {
  if (xhr.status === 200) {
        document.querySelector('#result').innerText = xhr.responseText;
    }
    else {
       console.log('Request failed.  Returned status of ' + xhr.status);
   }
};
xhr.send(JSON.stringify({name: 'zhangsan', age: 18}));
```

post x-www-form-urlencoded
```js
const xhr = new XMLHttpRequest();
xhr.open('POST', 'http://localhost:3000/api/post')
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
xhr.onload = function() {
  if (xhr.status === 200) {
        document.querySelector('#result').innerText = xhr.responseText;
    }
    else {
       console.log('Request failed.  Returned status of ' + xhr.status);
   }
};
xhr.send('name=zhangsan&age=18');
```

abort
中断请求只需要调用 `xhr.abort()`; 即可
```js
xhr.addEventListener('abort', function (event) {
    console.log('我被中断了');
});
```

timeout
设置`xhr.timeout = 3000;`
```js
xhr.addEventListener('timeout', function (event) {
     console.log('超时啦');
});
```

progress
我们通过 event.loaded 和 event.total 属性获取已上传数据量和总数据量
```js
xhr.addEventListener('progress', function (event) {
	document.querySelector('#progress').innerText = `
		${(event.loaded / event.total * 100).toFixed(2)}%
	`;
});
```