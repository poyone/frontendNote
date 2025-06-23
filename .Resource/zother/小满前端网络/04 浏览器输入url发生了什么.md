分几个部分

浏览器视角url
-> dns(获取ip) -> tcp(为http服务)建立连接 -> http返回html
-> 渲染

输入后敲回车，浏览器判断是url 还是 关键字进行搜索


dns：
+ 浏览器缓存
+ 操作系统dns
+ 本地host文件
+ 最后采取域名服务器问

tcp
+ dns拿到地址后，建立tcp链接
+ 拿到html之后，没什么事tcp就关闭了

http
+ 不光有get post，还有option预检请求，跨域问题
+ 缓存问题：强缓存、协商缓存

渲染
+ 见之前的渲染文章了
