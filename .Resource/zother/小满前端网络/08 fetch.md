分为两个部分
1. 基础的get post怎么发
2. 对于abort progress setTimeout怎么实现
	1. 附加一个cookie怎么发

# 基础请求
## get

```js
fetch('http://localhost:3000/api/txt')
	.then(res => {
	    console.log(res);
	    return res.text()
	}).then(res => {
	    console.log(res);
	})
```
注意第一个then返回的是一个Response对象，只有简单的响应头信息
第二个then里面获取的才是Response对象通过
`text() json() blob()`解析出来的文字 json和二进制数据


## post
```js
fetch('http://localhost:3000/api/post',{
    method:'POST',
    headers:{
        'Content-Type':'application/json'
    },
    body:JSON.stringify({
        name:'zhangsan',
        age:18
    })
}).then(res => {
    console.log(res);
    return res.json()
}).then(res => {
    console.log(res);
})
```

# 功能

## abort

```js
const abort = new AbortController()
fetch('http://localhost:3000/api/post',{
    method:'POST',
    headers:{
        'Content-Type':'application/json'
    },
    signal:abort.signal,
    body:JSON.stringify({
        name:'zhangsan',
        age:18
    })
}).then(res => {
    console.log(res);
    return res.json()
}).then(res => {
    console.log(res);
})

document.querySelector('#stop').addEventListener('click', () => {
        console.log('stop');
        abort.abort()
})
```
主要是fetch第二个参数，对象里面的signal字段，接受一个abort.signal来控制终端

## progress

```js
const btn = document.querySelector('#send')
const sendFetch = async () => {
    const data = await fetch('http://localhost:3000/api/txt',{
        signal:abort.signal
    })
    //fetch 实现进度条
    const response = data.clone()
    const reader = data.body.getReader()
    const contentLength = data.headers.get('Content-Length')
    let loaded = 0
    while (true) {
        const { done, value } = await reader.read()
        if (done) {
            break
        }
        loaded += value?.length || 0;
        const progress = document.querySelector('#progress')
        progress.innerHTML = (loaded / contentLength * 100).toFixed(2) + '%'
    }
    const text = await response.text()
    console.log(text);
}
btn.addEventListener('click', sendFetch)
```
通过Response对象的`body.getReader`获得一个reader
通过Response对象的`headers.get('Content-Length')`获取一个数据总长度
之后while loop来一直读取数据`const { done, value } = await reader.read()`
做累加除以总长度 直到`done`

## timeout

```js
const abort = new AbortController()
setTimeout(() => abort.abort(), 3000)
```
其实就是通过`setTimeout`函数，在时间到达之后callback `abort.abort()`

## cookie

```js
const data = await fetch('http://localhost:3000/api/txt',{
    signal:abort.signal,
    //cookie
    credentials:'include',
})
```
