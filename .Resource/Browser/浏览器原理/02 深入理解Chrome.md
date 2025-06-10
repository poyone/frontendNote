1. 每一幅图都是这一节的精髓，可以获取高度概括的信息，注释信息也是

# Part 1 terminology & multi-process architecture

## Terminology

As ==part 1== of this series, we'll take a look at ==core computing terminology== and ==Chrome's multi-process architecture==.

CPU & GPU
+ CPU: **C**entral **P**rocessing **U**nit
+ GPU: **G**raphics **P**rocessing **U**nit
![|500](https://developer.chrome.com/static/blog/inside-browser-part1/image/hardware-os-application-d4c78524d5558_1920.png)

Process & Thread & IPC
+ Process & Thread:
	+ When you start an application, a process is created. The program might create thread(s) to help it do work, but that's optional. The Operating System gives the process a "slab" of memory to work with and all application state is kept in that private memory space. When you close the application, the process also goes away and the Operating System frees up the memory.
![|500](https://developer.chrome.com/static/blog/inside-browser-part1/image/process-memory-60ff42694f726.svg)
	Figure 5: Diagram of a process using memory space and storing application data

+ IPC:
	+ A process can ask the Operating System to start another process to run different tasks. When this happens, different parts of the memory are allocated for the new process. **If two processes need to talk**, they can do so by using ==**I**nter **P**rocess **C**ommunication== (**IPC**). Many applications are designed to work this way so that if a worker process get unresponsive, it can be restarted without stopping other processes which are running different parts of the application.
![|500](https://developer.chrome.com/static/blog/inside-browser-part1/image/worker-process-ipc-ea8392115a438.svg)

## Architecture

For the sake of this blog series, we're using Chrome's recent architecture, described in Figure 8.

==At the top is the browser process coordinating with other processes that take care of different parts of the application==. For the renderer process, multiple processes are created and assigned to each tab. Until very recently, Chrome gave each tab a process when it could; now it tries to give each site its own process, including iframes (see [Site Isolation](https://developer.chrome.com/blog/inside-browser-part1#site-isolation)).
![|500](https://developer.chrome.com/static/blog/inside-browser-part1/image/browser-architecture-998609758999a_1920.png)

The following table describes each Chrome process and what it controls:

| process  | description                                                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Browser  | Controls "chrome" part of the application including address bar, bookmarks, back and forward buttons.  <br>Also handles the invisible, privileged parts of a web browser such as network requests and file access. |
| Renderer | Controls anything inside of the tab where a website is displayed.                                                                                                                                                  |
| Plugin   | Controls any plugins used by the website, for example, flash.                                                                                                                                                      |
| GPU      | Handles GPU tasks in isolation from other processes. It is separated into different process because GPUs handles requests from multiple apps and draw them in the same surface.                                    |
|          |                                                                                                                                                                                                                    |
![|500](https://developer.chrome.com/static/blog/inside-browser-part1/image/chrome-processes-79aaecca78d23_1920.png)
There are even more processes like the Extension process and utility processes. If you want ==to see how many processes are running in your Chrome==, click the options menu icon at the top right corner, select More Tools, then ==select Task Manager==. This opens up a window with a list of processes that are currently running and how much CPU/Memory they are using.

## benefit of multiprocess

If a single tab is unresponsive, the others are still alive:
+ As mentioned before each tab in browser has its' own process，so if one tab was unresponsive you can close it and move on.
+ If all tab in one process, any tab becomes unresponsive, all the tabs are unresponsive. That's sad.

Another benefit of separating the browser's work into multiple processes is security and sandboxing


# Part 2 Navigation: Browser & Render Process

In this post, we dig deeper into how each process and thread communicate in order to display a website.
> Let’s look at a simple use case of web browsing: you type a URL into a browser, then the browser fetches data from the internet and displays a page. ==In this post, we’ll focus on the part where a user requests a site and the browser prepares to render a page== - also known as a navigation.

## What happens in navigation

### It starts with a browser process
As we covered in [part 1: CPU, GPU, Memory, and multi-process architecture](https://developers.google.com/web/updates/2018/09/inside-browser-part1), everything outside of a tab is handled by the ==browser process==. 
+ The browser process has threads like the UI thread which draws buttons and input fields of the browser, 
+ ==the network thread== which deals with network stack to receive data from the internet, 
+ ==the storage thread== that controls access to the files and more. 
+ When you type a URL into the address bar, your input is handled by browser process’s ==UI thread.==

### Step 1: Handling input

When a user starts to type into the address bar, the first thing UI thread asks is "Is this a search query or URL?". In Chrome, the address bar is also a search input field, so the UI thread needs to parse and decide whether to send you to a search engine, or to the site you requested.
![|500](https://developer.chrome.com/static/blog/inside-browser-part2/image/handling-user-input-24fea2c817a6a_1920.png)
	Figure 1: UI Thread asking if the input is a search query or a URL

### Step 2: Start navigation

When a user hits enter, the UI thread initiates a network call to get site content. Loading spinner is displayed on the corner of a tab, and the network thread goes through appropriate protocols like DNS lookup and establishing TLS Connection for the request.
![|500](https://developer.chrome.com/static/blog/inside-browser-part2/image/navigation-start-4aeb163d61a8c_1920.png)
	Figure 2: the UI thread talking to the network thread to navigate to mysite.com

At this point, the network thread may receive a server redirect header like HTTP 301. In that case, the network thread communicates with UI thread that the server is requesting redirect. Then, another URL request will be initiated.

### Step 3: Read response

![|500](https://developer.chrome.com/static/blog/inside-browser-part2/image/http-response-0ae2751b24973_1920.png)
	Figure 3: response header which contains Content-Type and payload which is the actual data

Once the response body (payload) starts to come in, the network thread looks at the first few bytes of the stream if necessary. ==The response's Content-Type header should say what type of data it is==, but since it may be missing or wrong, [MIME Type sniffing](https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/MIME_types) is done here. This is a "tricky business" as commented in [the source code](https://cs.chromium.org/chromium/src/net/base/mime_sniffer.cc?sq=package:chromium&dr=CS&l=5). You can read the comment to see how different browsers treat content-type/payload pairs.

==If the response is an HTML file==, then the next step would be to pass the data to the ==renderer process==, but ==if it is a zip file or some other file== then that means it is a download request so they need to pass the data to ==download manager.==
![|500](https://developer.chrome.com/static/blog/inside-browser-part2/image/mime-type-sniffing-444e1a2f5b037_1920.png)
	Figure 4: Network thread asking if response data is HTML from a safe site
	Network thread Asking itself actually

### Step 4: Find a renderer process

Once all of the checks are done and Network thread is confident that browser should navigate to the requested site, the Network thread tells UI thread that the data is ready. UI thread then finds a renderer process to carry on rendering of the web page.
![|500](https://developer.chrome.com/static/blog/inside-browser-part2/image/find-renderer-process-4d4055665d4a7_1920.png)

Actually, When the UI thread is sending a URL request to the network thread at step 2, it already knows which site they are navigating to. The UI thread tries to proactively find or start a renderer process in parallel to the network request. This way, if all goes as expected, ==a renderer process is already in standby position when the network thread received data==.

### Step 5: Commit navigation

Now that the data and the renderer process is ready, ==an IPC is sent from the browser process to the renderer process to commit the navigation==. It also ==passes on the data stream== so the renderer process can keep receiving HTML data. Once the browser process hears confirmation that the commit has happened in the renderer process, ==the navigation is complete== and the ==document loading phase begins==.

![|500](https://developer.chrome.com/static/blog/inside-browser-part2/image/commit-navigation-bc2943921c6f6_1920.png)
	Figure 6: IPC between the browser and the renderer processes, requesting to render the page

### Extra Step: Initial load complete

Once the navigation is committed, the renderer process carries on loading resources and renders the page. We will go over the details of what happens at this stage in the next post. ==Once the renderer process "finishes" rendering, it sends an IPC back== to the browser process (this is after all the ==`onload` events== have fired on all frames in the page and have finished executing). At this point, the UI thread stops the loading spinner on the tab.

![|500](https://developer.chrome.com/static/blog/inside-browser-part2/image/page-finish-loading-1bee6888e9e56_1920.png)
	Figure 7: IPC from the renderer to the browser process to notify the page has "loaded"

## Navigating to a different site

The simple navigation was complete! But what happens if a user puts different URL to address bar again? Well, the browser process goes through the same steps to navigate to the different site. But before it can do that, it needs to check with the currently rendered site if they care about ==[`beforeunload`](https://developer.mozilla.org/docs/Web/Events/beforeunload) event.==

If the navigation was initiated from the renderer process (like user clicked on a link or client-side JavaScript has run `window.location = "https://newsite.com"`) the renderer process first checks `beforeunload` handlers. Then, it goes through the same process as browser process initiated navigation. ==The only difference is that navigation request is kicked off from the renderer process to the browser process.==

When the new navigation is made to a different site than currently rendered one, a separate render process is called in to handle the new navigation while current render process is kept around to handle ==events like `unload`==. For more, see [an overview of page lifecycle states](https://developers.google.com/web/updates/2018/07/page-lifecycle-api#overview_of_page_lifecycle_states_and_events) and how you can hook into events with [the Page Lifecycle API](https://developers.google.com/web/updates/2018/07/page-lifecycle-api).
![|500](https://developer.chrome.com/static/blog/inside-browser-part2/image/new-navigation-unload-29ee714c3fcf4_1920.png)
	Figure 9: 2 IPCs from a browser process to a new renderer process telling to render the page and telling old renderer process to unload

## In case of Service Worker

这部分没看懂，可能需要去看下红宝书的工作者进程(workers?)

> 这章有几节没看懂，有几个关键的概念，他们都导航到另外几篇文章了，有时间再补补

# Part 3 Inner workings of a Renderer Process

> 最重要的一篇
> structure(DOM)、style(CSS)、position(layout)、layer、
> Raster、composite

Renderer process touches many aspects of web performance. ==Since there is a lot happening inside of the renderer process, this post is only a general overview==. If you'd like to dig deeper, [the Performance section of Web Fundamentals](https://developers.google.com/web/fundamentals/performance/why-performance-matters/) has many more resources.

The renderer process is responsible for everything that happens inside of a tab. 
In a renderer process:
+ the ==main thread== handles most of the code you send to the user. 
+ Sometimes parts of your JavaScript is handled by ==worker threads== if you use a web worker or a service worker. 
+ ==Compositor and raster threads== are also run inside of a renderer processes to render a page efficiently and smoothly.

==The renderer process's core job is to turn HTML, CSS, and JavaScript into a web page that the user can interact with.==

![|500](https://developer.chrome.com/static/blog/inside-browser-part3/image/renderer-process-df424472d0633_1920.png)

## Parsing

### Construction of a DOM

When the renderer process receives a commit message for a navigation and starts to receive HTML data, the main thread begins to parse the text string (HTML) and turn it into a **D**ocument **O**bject **M**odel (**DOM**).

### Subresource loading

A website usually uses external resources like images, CSS, and JavaScript. Those files need to be loaded from network or cache. The main thread _could_ request them one by one as they find them while parsing to build a DOM, but in order to speed up, "preload scanner" is run concurrently. If there are things like `<img>` or `<link>` in the HTML document, preload scanner peeks at tokens generated by HTML parser and sends requests to the network thread in the browser process.
![|500](https://developer.chrome.com/static/blog/inside-browser-part3/image/dom-ffeed8e96a6e8_1920.png)
	Figure 2: The main thread parsing HTML and building a DOM tree
	main thread in render process

### JavaScript can block the parsing

When the HTML parser finds a `<script>` tag, it pauses the parsing of the HTML document and has to load, parse, and execute the JavaScript code. Why? because JavaScript can change the shape of the document using things like `document.write()` which changes the entire DOM structure ([overview of the parsing model](https://html.spec.whatwg.org/multipage/parsing.html#overview-of-the-parsing-model) in the HTML spec has a nice diagram). This is why the HTML parser has to wait for JavaScript to run before it can resume parsing of the HTML document. If you are curious about what happens in JavaScript execution, [the V8 team has talks and blog posts on this](https://mathiasbynens.be/notes/shapes-ics).
![|400](https://html.spec.whatwg.org/images/parsing-model-overview.svg)
## Hint to browser how you want to load resources

There are many ways web developers can send hints to the browser in order to load resources nicely. If your JavaScript does not use `document.write()`, you can add [`async`](https://developer.mozilla.org/docs/Web/HTML/Element/script#attr-async) or [`defer`](https://developer.mozilla.org/docs/Web/HTML/Element/script#attr-defer) attribute to the `<script>` tag. The browser then loads and runs the JavaScript code asynchronously and does not block the parsing. You may also use [JavaScript module](https://developers.google.com/web/fundamentals/primers/modules) if that's suitable. `<link rel="preload">` is a way to inform browser that the resource is definitely needed for current navigation and you would like to download as soon as possible. You can read more on this at [Resource Prioritization – Getting the Browser to Help You](https://developers.google.com/web/fundamentals/performance/resource-prioritization).

## Style calculation

The main thread parses CSS and determines the computed style for each DOM node. This is information about what kind of style is applied to each element based on CSS selectors. You can see this information in the `computed` section of DevTools.
Even if you do not provide any CSS, each DOM node has a computed style.
![|500](https://developer.chrome.com/static/blog/inside-browser-part3/image/computed-style-5e3c65a01f3f1_1920.png)

## Layout

==Now the renderer process knows the structure of a document and styles for each nodes==, but that is not enough to render a page.
Imagine you are trying to describe a painting to your friend over a phone. "There is a big red circle and a small blue square" is not enough information for your friend to know what exactly the painting would look like.
![|500](https://developer.chrome.com/static/blog/inside-browser-part3/image/game-human-fax-machine-17f10d8b400ac_1920.png)

The layout is a process to find the geometry of elements. The main thread walks through the ==DOM and computed styles== and creates the ==layout tree== which has information like x y coordinates and bounding box sizes. ==Layout tree may be similar structure to the DOM tree, but it only contains information related to what's visible on the page==. ==If `display: none` is applied, that element is not part of the layout tree (however, an element with `visibility: hidden` is in the layout tree). Similarly, if a pseudo-element with content like `p::before{content:"Hi!"}` is applied, it is included in the layout tree even though that is not in the DOM.==
![|500](https://developer.chrome.com/static/blog/inside-browser-part3/image/layout-9d8ed8c743f45_1920.png)
	Figure 5: The main thread going over DOM tree with computed styles and producing layout tree

Figure 6: Box layout for a paragraph moving due to line break change

Determining the Layout of a page is a challenging task. Even the simplest page layout like a block flow from top to bottom has to consider how big the font is and where to line break them because those affect the size and shape of a paragraph; which then affects where the following paragraph needs to be.

CSS can make element float to one side, mask overflow item, and change writing directions. You can imagine, this layout stage has a mighty task. In Chrome, a whole team of engineers works on the layout. If you want to see details of their work, [few talks from BlinkOn Conference](https://www.youtube.com/watch?v=Y5Xa4H2wtVA) are recorded and quite interesting to watch.

## Paint

Having a ==DOM==, ==style==, and ==layout== is still not enough to render a page. Let's say you are trying to reproduce a painting. You know the size, shape, and location of elements, but ==you still have to judge in what order you paint them.==

For example, `z-index` might be set for certain elements, in that case painting in order of elements written in the HTML will result in incorrect rendering.
![z-index fail|500](https://developer.chrome.com/static/blog/inside-browser-part3/image/z-index-fail-2529cf989dc65.png)
	Figure 8: Page elements appearing in order of an HTML markup, resulting in wrong rendered image because z-index was not taken into account

At this paint step, the main thread walks the layout tree to create ==paint records==. ==Paint record is a note of painting process like "background first, then text, then rectangle"==. If you have drawn on `<canvas>` element using JavaScript, this process might be familiar to you.

### Updating rendering pipeline is costly

Figure 10: DOM+Style, Layout, and Paint trees in order it is generated

==The most important thing to grasp in rendering pipeline is that at each step the result of the previous operation is used to create new data. For example, if something changes in the layout tree, then the Paint order needs to be regenerated for affected parts of the document.==

## Compositing

### How would you draw a page?

> 这处原文有动画可以帮助了解栅格化

Now that the browser knows the ==structure of the document==, the ==style of each element==, the ==geometry of the page==, and the ==paint order==, how does it draw a page? ==Turning this information into pixels on the screen is called rasterizing.==

Perhaps a naive way to handle this would be to raster parts inside of the viewport. If a user scrolls the page, then move the rastered frame, and fill in the missing parts by rastering more. This is how Chrome handled rasterizing when it was first released. However, the modern browser runs a more sophisticated process called compositing.

### What is compositing

> 这处原文有动画可以帮助了解合成 和 栅格化的不同

==Compositing is a technique to separate parts of a page into layers, rasterize them separately==, and ==composite as a page in a separate thread called compositor thread==. If scroll happens, since layers are already rasterized, all it has to do is to composite a new frame. Animation can be achieved in the same way by moving layers and composite a new frame.

You can see how your website is divided into layers in DevTools using [Layers panel](https://blog.logrocket.com/eliminate-content-repaints-with-the-new-layers-panel-in-chrome-e2c306d4d752?gi=cd6271834cea).

### Dividing into layers

In order to find out which elements need to be in which layers, the main thread walks through the layout tree to create the ==layer tree== (this part is called "Update Layer Tree" in the DevTools performance panel). If certain parts of a page that should be separate layer (like slide-in side menu) is not getting one, then you can hint to the browser by using ==`will-change`== attribute in CSS.
![layer tree|600](https://developer.chrome.com/static/blog/inside-browser-part3/image/layer-tree-cc92336966c73.png)
	Figure 16: The main thread walking through layout tree producing layer tree

You might be tempted to give layers to every element, but compositing across an excess number of layers could result in slower operation than rasterizing small parts of a page every frame, so it is crucial that you measure rendering performance of your application. For more about on topic, see [Stick to Compositor-Only Properties and Manage Layer Count](https://developers.google.com/web/fundamentals/performance/rendering/stick-to-compositor-only-properties-and-manage-layer-count).

### Raster and composite off of the main thread

==Once the layer tree is created and paint orders are determined, the main thread commits that information to the compositor thread. The compositor thread then rasterizes each layer. A layer could be large like the entire length of a page, so the compositor thread divides them into tiles and sends each tile off to raster threads. Raster threads rasterize each tile and store them in GPU memory.==
![raster](https://developer.chrome.com/static/blog/inside-browser-part3/image/raster-9dfd7af5a9554.png)
	Figure 17: Raster threads creating the bitmap of tiles and sending to GPU

> 最后面这段很难理解

The compositor thread can prioritize different raster threads so that things within the viewport (or nearby) can be rastered first. A layer also has multiple tilings for different resolutions to handle things like zoom-in action.

Once tiles are rastered, compositor thread gathers tile information called **==draw quads==**(绘制四方形) to create a ==**compositor frame**.==

|   |   |
|---|---|
|Draw quads|Contains information such as the tile's location in memory and where in the page to draw the tile taking in consideration of the page compositing.|
|Compositor frame|A collection of draw quads that represents a frame of a page.|

A compositor frame is then submitted to the browser process via IPC. At this point, another compositor frame could be added from UI thread for the browser UI change or from other renderer processes for extensions. These compositor frames are sent to the GPU to display it on a screen. If a scroll event comes in, compositor thread creates another compositor frame to be sent to the GPU.
![composit](https://developer.chrome.com/static/blog/inside-browser-part3/image/composit-266744978ac93.png)
	Figure 18: Compositor thread creating compositing frame. Frame is sent to the browser process then to GPU

The benefit of compositing is that it is done without involving the main thread. Compositor thread does not need to wait on style calculation or JavaScript execution. This is why [compositing only animations](https://www.html5rocks.com/en/tutorials/speed/high-performance-animations/) are considered the best for smooth performance. If layout or paint needs to be calculated again then the main thread has to be involved.


# Part 4 

When you hear "input events" you might only think of a typing in textbox or mouse click, but from the browser's point of view, input means any gesture from the user. Mouse wheel scroll is an input event and touch or mouse over is also an input event.

When user gesture like touch on a screen occurs, the browser process is the one that receives the gesture at first. However, the browser process is only aware of where that gesture occurred since content inside of a tab is handled by the renderer process. So the browser process sends the event type (like `touchstart`) and its coordinates to the renderer process. Renderer process handles the event appropriately by finding the event target and running event listeners that are attached.

![input event|500](https://developer.chrome.com/static/blog/inside-browser-part4/image/input-event-265a73164e715.png)
	Figure 1: Input event routed through the browser process to the renderer process

由于运行 JavaScript 是主线程的工作，因此在合成网页时，合成器线程会将网页中附加了事件处理脚本的区域标记为“非快速滚动区域”。有了这些信息，如果事件发生在该区域，合成器线程可以确保将输入事件发送到主线程。如果输入事件来自此区域之外，则合成器线程会继续合成新帧，而无需等待主线程。

![有限的非快速滚动区域|500](https://developer.chrome.com/static/blog/inside-browser-part4/image/limited-non-fast-scrollab-376be5ee2cd6b.png?hl=zh-cn)
	图 3：对非快速滚动区域的描述输入的示意图

### 编写事件处理程序时须注意

Web 开发中的一种常见的事件处理模式是事件委托。由于事件气泡，因此您可以在最顶部的元素上附加一个事件处理脚本，并根据事件目标委托任务。您可能看过或编写过如下代码。

```js
document.body.addEventListener('touchstart', event => {
    if (event.target === area) {
        event.preventDefault();
    }
});
```

由于您只需为所有元素编写一个事件处理脚本，因此这种事件委托模式的人体工学设计非常吸引人。不过，如果您从浏览器的角度查看此代码，现在整个网页都被标记为非快速滚动区域。这意味着，即使您的应用并不在意来自页面某些部分的输入，合成器线程也必须与主线程进行通信，并在每次有输入事件的传入时等待它。因此，合成器的流畅滚动功能会失效。

![整页非快速滚动区域|500](https://developer.chrome.com/static/blog/inside-browser-part4/image/full-page-non-fast-scroll-dd3010cc3ee0f.png?hl=zh-cn)
	图 4：对覆盖整个页面的非快速滚动区域的描述输入的示意图

为避免出现这种情况，您可以在事件监听器中传递 `passive: true` 选项。这会提示浏览器您仍希望在主线程中监听事件，但合成器也可以继续合成新帧。

```js
document.body.addEventListener('touchstart', event => {
    if (event.target === area) {
        event.preventDefault()
    }
 }, {passive: true});
```

# Result

> 以下是Gemin的一些进程 & 线程相关的总结
> 主要需要记住的是几大进程 & 事件循环 定时器 网络请求等异步操作属于哪个进程的哪些线程。

## 浏览器中的进程和线程以及它们与 JS 代码的关系

### 浏览器为什么要多进程？

现代浏览器为了提升性能、稳定性以及安全性，通常采用多进程架构。每个标签页通常对应一个独立的渲染进程，这样即使一个页面崩溃，也不会影响其他页面。

### 常见的浏览器进程

- **浏览器主进程:** 负责浏览器界面显示、用户交互、网络请求等。
- **渲染进程:** 每个标签页通常对应一个渲染进程，负责页面渲染、JavaScript执行、样式计算等。
- **GPU进程:** 负责硬件加速的合成和渲染。
- **插件进程:** 负责插件的运行。

### 渲染进程中的线程

每个渲染进程中包含多个线程，其中最重要的是：

- **主线程:** 负责执行 JavaScript 代码、渲染页面、处理用户输入等。
- **渲染线程:** 负责将 DOM 树和 CSSOM 树合成渲染树，布局和绘制。
- **事件触发线程:** 负责控制 JavaScript 的事件循环，处理定时器和异步操作。

### JS 代码与线程的关系

- **JavaScript 是单线程的:** 在一个渲染进程中，JavaScript 代码始终在一个主线程上执行。
- **JavaScript 引擎:** V8 引擎（Chrome、Node.js）等负责解析和执行 JavaScript 代码。
- **事件循环:** JavaScript 采用事件循环机制，使得 JavaScript 具有异步非阻塞的特性。
- **GUI 渲染线程与 JS 引擎线程互斥:** 为了防止渲染出现不可预期的结果，浏览器设置 GUI 渲染线程与 JS 引擎为互斥的关系。当 JS 引擎执行时，GUI 线程会被挂起，GUI 更新则会被保存在一个队列中，等到 JS 引擎空闲时立即被执行。

### 为什么 JavaScript 是单线程的？

- **历史原因:** JavaScript 最初设计为单线程，用于处理浏览器中的交互。
- **简化模型:** 单线程模型更容易理解和实现。
- **DOM 操作:** 多线程同时操作 DOM 会导致数据不一致的问题。

### 单线程的弊端与解决方法

- **阻塞:** 长时间运行的 JavaScript 代码会阻塞页面渲染。
- **解决方法:**
    - **异步操作:** 使用 setTimeout、setInterval、Promise、async/await 等实现异步操作。
    - **Web Worker:** 将耗时任务放到 Web Worker 中执行，不阻塞主线程。
    - **请求动画帧:** 使用 requestAnimationFrame 进行动画渲染，提高性能。

### 总结

- 浏览器采用多进程架构，提升性能和稳定性。
- 渲染进程包含多个线程，JavaScript 代码在主线程上执行。
- JavaScript 是单线程的，但通过事件循环和异步操作实现了非阻塞。
- 了解浏览器进程和线程有助于我们写出更高效的 JavaScript 代码。

**深入了解**

- **浏览器工作原理:** 为了更深入地理解，可以研究浏览器的工作原理，包括 HTML 解析、CSSOM 构造、渲染树生成、布局和绘制等过程。
- **JavaScript 引擎:** 深入学习 V8 引擎等 JavaScript 引擎的工作原理，了解 JavaScript 代码的执行过程。
- **事件循环:** 详细了解 JavaScript 的事件循环机制，理解异步操作的原理。

**希望这个回答对您有所帮助！**

**如果您还有其他问题，欢迎随时提出。**

**以下是一些可能感兴趣的关键词，您可以用来搜索更详细的信息：**

- 浏览器多进程
- 渲染进程
- JavaScript 引擎
- 事件循环
- Web Worker
- requestAnimationFrame
- DOM 树
- CSSOM 树
- 渲染树

**想了解更多关于某个特定方面吗？**