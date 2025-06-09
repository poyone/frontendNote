	以Google的4篇为引，增加了一些来自掘金的博客内容
# Overview

Chrome有如下几大进程，每个进程又有一些线程
1. Browser进程: 
	1. 网络进程，fetch请求那些
	2. UI进程，比如浏览器顶部的导航栏等
	3. 存储进程，存储fetch获取的数据
2. ==Render进程==: 
	1. 当浏览器fetch数据好之后就会调用(通过IPC)Render进程绘制页面
	2. 注意每个tab都拥有一个单独的render进程，如下图 ![|500](https://developer.chrome.com/static/blog/inside-browser-part1/image/browser-architecture-998609758999a_1920.png)
	3. 渲染进程构成：
		1. main thread：主进程负责执行JS代码
		2. render thread：负责将 DOM 树和 CSSOM 树合成渲染树，布局和绘制
			1. 分为 光栅(raster)线程 & 合成(Compositor)
		3. event handle thread：负责控制 ==JavaScript 的事件循环，处理定时器和异步操作==
			1. 当代码执行到异步代码，异步的操作部分就会加入到对应线程中执行
				1. 我们写的事件监听器的handler也是在这个线程中的，触发之后会加入到event loop中
			2. 执行的结果准备好之后就会加入到 event loop中
			3. 当call stack为空的时候就可以把事件循环中的任务推入栈

# 渲染线程和JS代码？
[文章链接](https://juejin.cn/post/6844903919789801486)
[视频讲解参考](https://www.bilibili.com/video/BV1Pr4y1N7QZ/?spm_id_from=333.1007.top_right_bar_window_history.content.click&vd_source=6997c0a04f6a78d03d30de86e9b949d9)

## 宏任务 微任务

我们前文提到过JS引擎线程和GUI渲染线程是互斥的关系，浏览器为了能够使宏任务和DOM任务有序的进行，会在一个宏任务执行结果后，在下一个宏任务执行前，GUI渲染线程开始工作，对页面进行渲染。
+ js线程 和 GUI渲染线程，为什么互斥？多次更新dom样式 怎么只显示最后一次？
![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/8/20/16caca3e44d7d357~tplv-t2oaga2asx-zoom-in-crop-mark:1512:0:0:0.awebp)
+ 宏任务触发时机？
![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/8/20/16caca3ed44e6b16~tplv-t2oaga2asx-zoom-in-crop-mark:1512:0:0:0.awebp)
我会看到，页面先显示成蓝色背景，然后瞬间变成了黑色背景，这是因为以上代码属于两次`宏任务`，第一次`宏任务`执行的代码是将背景变成蓝色，然后触发渲染，将页面变成蓝色，再触发第二次宏任务将背景变成黑色。

我们已经知道宏任务结束后，会执行渲染，然后执行下一个宏任务，
而微任务可以理解成在当前宏任务执行后立即执行的任务。
也就是说，当宏任务执行完，会在渲染前，将执行期间所产生的所有微任务都执行完。
Promise，process.nextTick等，属于微任务。

	微任务会累积在渲染之前，在渲染之前会一次清空。
	可以参考视频中fn1 fn2 fn3 然后执行promise中的任务，之后渲染页面，开启下一次宏任务

## 重绘重排

[腾讯团队，重绘重排，painting layout](https://juejin.cn/post/6844903779700047885)
## 渲染树的构建步骤

为了构建渲染树，浏览器主要完成了以下工作：  
从DOM树的根节点开始遍历每个可见节点。  
对于每个可见的节点，找到CSSOM树中对应的规则，并应用它们。  
根据每个可见节点以及其对应的样式，组合生成渲染树。  
第一步中，既然说到了要遍历可见的节点，那么我们得先知道，什么节点是不可见的。不可见的节点包括：  
一些不会渲染输出的节点，比如script、meta、link等。  
一些通过css进行隐藏的节点。比如display:none。注意，利用visibility和opacity隐藏的节点，还是会显示在渲染树上的。只有display:none的节点才不会显示在渲染树上。

## 何时回触发layout重排

我们前面知道了，回流这一阶段主要是计算节点的位置和几何信息，那么当页面布局和几何信息发生变化的时候，就需要回流。  
比如以下情况：  
添加或删除可见的DOM元素  
元素的位置发生变化  
元素的尺寸发生变化（包括外边距、内边框、边框大小、高度和宽度等）  
内容发生变化，比如文本变化或图片被另一个不同尺寸的图片所替代。  
页面一开始渲染的时候（这肯定避免不了）  
浏览器的窗口尺寸变化（因为回流是根据视口的大小来计算元素的位置和大小的）  
注意：回流一定会触发重绘，而重绘不一定会回流

# 渲染的步骤

The ==renderer process=='s core job is to turn ==HTML==, ==CSS==, and ==JavaScript== into a web page that the user can interact with.

1. Construction of a ==DOM==
	1.  Subresource loading
2. ==JavaScript== can block the parsing
	![|400](https://html.spec.whatwg.org/images/parsing-model-overview.svg)

绘制的流程：
1. 解析dom，获得文档结构
2. 读取css，知道每一个dom的样式
3. 布局树(layout tree)
4. 绘画层级(paint record)，z-index

+  ==Layout tree may be similar structure to the DOM tree, but it only contains information related to what's visible on the page==. ==If `display: none` is applied, that element is not part of the layout tree (however, an element with `visibility: hidden` is in the layout tree). Similarly, if a pseudo-element with content like `p::before{content:"Hi!"}` is applied, it is included in the layout tree even though that is not in the DOM.==
![|500](https://developer.chrome.com/static/blog/inside-browser-part3/image/layout-9d8ed8c743f45_1920.png)

+ ==Paint record is a note of painting process like "background first, then text, then rectangle"==.
![z-index fail|500](https://developer.chrome.com/static/blog/inside-browser-part3/image/z-index-fail-2529cf989dc65.png)

## 重绘？

==The most important thing to grasp in rendering pipeline is that at each step the result of the previous operation is used to create new data. For example, if something changes in the layout tree, then the Paint order needs to be regenerated for affected parts of the document.==

## 栅格 & 合成

==Once the layer tree is created and paint orders are determined, the main thread commits that information to the compositor thread. The compositor thread then rasterizes each layer. A layer could be large like the entire length of a page, so the compositor thread divides them into tiles and sends each tile off to raster threads. Raster threads rasterize each tile and store them in GPU memory.==
![raster](https://developer.chrome.com/static/blog/inside-browser-part3/image/raster-9dfd7af5a9554.png)

> 栅格化 & 合成太难理解了，算了。