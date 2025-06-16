[你不知道的 Chrome 调试技巧](https://juejin.cn/book/6844733783166418958/section)
# 通用篇 -快捷键

1. cmd + s + D 切换tool到右边或者底部
2. 切换具体面板 ctr + 1，2，3... 或者 ctr + 】【
   1. 如果被禁用，到setting(F1) appearance enable ctr 1-9
   2. 顺便也可以把界面改成dark
3. 使用箭头修改样式的具体数值：
![|300](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/12/18/167c07cf43b2f06e~tplv-t2oaga2asx-jj-mark:1890:0:0:0:q75.awebp)
4. elements， logs， sources & network 四个面板中都可以用ctr+f来查找信息
5. cmd + s + R 可以hard reload

# 通用篇 - 使用 Command

cmd + s + p打开命令面板，就像是vscode的ctr+s+p
命令可以分为以下几类
![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/12/11/1679a2e13926d71b~tplv-t2oaga2asx-jj-mark:1890:0:0:0:q75.awebp)
1. capture：打开命令面板 capture进行捕获全屏或者某个node的截图
2. layout：可以对某个面板进行布局
3. theme 也可以快速切换主题
# 通用篇 - 复用代码块 snippet
source面板中的snippet可以存储进场使用的一些js脚本，就不用再console一条条输了
之后可以在命令面板中输入`!`然后脚本名称就可以直接运行了
	注意，Ctrl+s+p打开的是指令面板
	Ctrl+p打开的是文件的命令面板，在这里可以执行脚本

# console 篇 - console 中的 '$'
1.`$0`
	inspect状态下单击选中元素后，也可以用$0快速指向这个element
在 Chrome 的 Elements 面板中，` $0 `是对我们当前选中的 html 节点的引用。
理所当然，$1 是对上一次我们选择的节点的引用，`$2 `是对在那之前选择的节点的引用，等等。一直到 `$4`
你可以尝试一些相关操作(例如: `$1.appendChild($0)`)
![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/12/7/16785c75b56d3a80~tplv-t2oaga2asx-jj-mark:1890:0:0:0:q75.awebp)

2. `$_`
当你想查看上次的输出
这时候 `$_` 就派上了用场，`$_` 是对上次执行的结果的 引用 ：
![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/12/7/16785d333e7c1d7f~tplv-t2oaga2asx-jj-mark:1890:0:0:0:q75.awebp)
3. `$i`
有时你只是想玩玩新出的 npm 包，现在不用再大费周章去建一个项目测试了，只需要在 Chrome插件:Console Importer 的帮助之下，快速的在 console 中引入和测试一些 npm 库。
运行 `$i('lodash')` 或者 `$i('moment') `几秒钟后，你就可以获取到 `lodash / momentjs `了:
这里记录下评论区给出的答案
4. `$$`
使用 `$$('div')` 相当于`document.querySelectAll('div')` 注意返回的是一个类Array
1.`?('xxx')`报错的，用`$$`就行了
2.`$i('xxx')`报错的，浏览器关闭再重新打开就行了
5. `$(css selector)`
即可选择，相当于`document.querySelect('div')`

# console 篇 - debug
1. 首先console.log打印的是对象的快照，如果你修改后再打印，它还是上次的情况
2. source的部分可以加断点，同时也可以加`console.log(someVariables)` 来输出，这是临时的，你就不用去源码中再清除一遍了

# console 篇 - 各个方法

[详情请见](https://juejin.cn/book/6844733783166418958/section/6844733783216766983)

1. table 打印obj
2. Live expression 来同时观测多个值

# Network 篇

1. 在initiator一栏可以看到这个请求是由那些代码 一层层触发的
2. method:POST可以过滤出post请求，以下是可以用的关键字
![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/12/29/167f82824d09c68d~tplv-t2oaga2asx-jj-mark:3326:0:0:0:q75.awebp)
3. 如何重新发送 `XHR` 的请求？刷新页面？太老套了，试试这么做：
![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/12/20/167c99ea1c267c2b~tplv-t2oaga2asx-jj-mark:3326:0:0:0:q75.awebp)

# 元素面板篇

[原文中有很多动图可以查看](https://juejin.cn/book/6844733783166418958/section/6844733783216766989)

1. `Shadow editor` 阴影编辑器
![|400](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/12/14/167ac17a4194c870~tplv-t2oaga2asx-jj-mark:3326:0:0:0:q75.awebp)
2. Cubic bezier(贝塞尔)编辑器(动画速率曲线)
3. 插入样式规则的按钮
>插入样式规则的按钮，这一段无法复现  
>这个在最新的chrome上可能已经没了
![|400](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/12/14/167ac1748b954754~tplv-t2oaga2asx-jj-mark:3326:0:0:0:q75.awebp)
4. 展开所有的子节点：右击节点后的 `expand recursively`
5. DOM 断点
有时脚本修改了 `DOM` ，但修改的是哪部分？什么时候修改的呢？
这样的情况下，你就可以添加一个 `DOM` 断点：监听节点被添加或者移除 / 属性被改变。
- 点击"..." 符号或者右击你想添加监听的元素
- 选择 `subtree modifications` :监听任何它内部的节点被 `移除` 或者 `添加`的事件
- 选择 `attribute modifications` :监听任何当前选中的节点被 `添加`，`移除` 或者 `被修改值`的事件
- 选择 `node removal` :监听被选中的元素被 `移除` 的事件

# 元素面板篇 - 颜色选择器

1. 直接点击style中任何带有颜色设置rule，即可打开选择器，竟然有着色器！！
![|400](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/12/12/167a1d2cc62a8d0f~tplv-t2oaga2asx-jj-mark:3326:0:0:0:q75.awebp)
2. 点击最下部，右边的上下箭头，即可导航到颜色分类，里面有你定义的CSS Variable！
![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/1/22/1687495003d24d3b~tplv-t2oaga2asx-jj-mark:3326:0:0:0:q75.awebp)
3. 颜色对比度查看，竟然还有双A标准计算！
打开一个文本的调色选择器(是 `color` 属性， 而不是 `background-color`) 你会看到 `“Contrast ratio(对比度)”` 部分。它显示了 **文本的颜色** 与 **开发者工具认为这段文本应该有的背景颜色** 之间的对比度。如果这个数值很高，那么你的文本相对于背景来说，更显而易见，但如果这个值接近 `1` ，那么文本的颜色几乎不能从背景色中区分。
> 注意是“文本”的color才有对比度，随便找个元素上加color是显示不出来对比度这个内容的

- 在数字边上的 “🚫” 意味着对比度太低了。
- 一个 “✅” 意味着这个颜色遵从 [Web Content Accessibility Guidelines (WCAG) 2.0](https://link.juejin.cn/?target=https%3A%2F%2Fwww.w3.org%2FTR%2FUNDERSTANDING-WCAG20%2Fconformance.html "https://www.w3.org/TR/UNDERSTANDING-WCAG20/conformance.html") 的 **AA** 声明，这意味着对比值至少为 `3`，
- “✅ ✅” 意味着满足了 **AAA** 声明。
![|400](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/12/12/167a1d2cc3b22cdd~tplv-t2oaga2asx-jj-mark:3326:0:0:0:q75.awebp)

# Drawer 篇 - Drawer 常识

说到 `Drawer` 大部分的朋友可能都很陌生，那 `Drawer` 是个什么东西？ `Chrome DevTools` 有很多部分，被分为9个 `tab` (俗称选项卡) ( `Elements` ， `Console` ， `Sources` ， `Network` ， 等等...)

但是，那仅仅是它的一部分而已！==有一组平行的选项卡，被隐藏在主窗口之下==。这个组合被称为 **`Drawer`**

+ 默认是esc打开/关闭，我一直用的是ctr+反引号

3. 检查代码 coverage，好像有用好像又没用
![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/12/29/167f829daebc168d~tplv-t2oaga2asx-jj-mark:3326:0:0:0:q75.awebp)
4. 检查你修改的内容，当你在浏览器修改样式之后，可能需要对比跟文件样式有哪些不同。(忘记自己改了什么了，hh)，这个时候Dev Tools就可以像git一样帮你显示，记录哪些改变
![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/12/29/167f829dadf27e11~tplv-t2oaga2asx-jj-mark:3326:0:0:0:q75.awebp)

# workspace篇

1. 文件同步
如果你把项目的文件夹直接拖到 `Source` 面板，`DevTools` 会将你做出的修改同步到系统的文件中。
![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/12/29/167f5b37db4e23ac~tplv-t2oaga2asx-jj-mark:3326:0:0:0:q75.awebp)

2. 样式同步
正如我们刚才所说，一旦设置好了 `DevTools workspace`，就可以在 `Sources` 面板中编辑 `HTML` 和 `JavaScript`（或者甚至是 `TypeScript`，如果你有`sourcemaps`）文件，按 `ctrl + s` 后它将被保存 在文件系统中。

但是在样式方面它提供了更好的支持。 因为即使你只是在 _“元素”_ 面板的 _“样式”_ 部分中编辑样式规则，它也会立即同步。 请注意，是立刻！
![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/12/29/167f5b37d2312b72~tplv-t2oaga2asx-jj-mark:3326:0:0:0:q75.awebp)

3. `Workspace` 允许 `CSS` 注入！感觉都不用live server了，amazing！！

设置工作区后，浏览器中所做的更改不仅会持久的保存到文件系统中，而且，`CSS` 的更改保存在文件系统后，立即就被浏览器选中并显示在你的页面上。**并不需要手动刷新。**

敲黑板：我们 `没有使用额外的工具` - 没有 `webpack` 的热更新模块或者其他东西 - 只有一个本地服务以及 `DevTools' workspace` 而已。
![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/12/29/167f5b37d2051cca~tplv-t2oaga2asx-jj-mark:3326:0:0:0:q75.awebp)

# 补充
	2025年02月27日23:18:37
甚至控制面板还可以调出layers，
+ 可以3D效果查看页面的层级
+ 勾选Paints查看渲染过后的样式

控制面板有太多可以玩的了

	2025年06月13日10:03:52
+ 可以直接使用copy函数复制某个变量到 剪切板。`copy(a)`
+ Network面板的请求的initiator 面板可以查看请求的function call，以此查看调用栈由哪些代码发起。
	+ 这个是在看公司合规考试怎么直接完成进度的时候用到的，找到相关的api文件之后 直接发给ai 问答案就好了 嘻嘻

	2025年06月16日21:36:07
+ Network面板 [原文链接](https://mp.weixin.qq.com/s/X4dQ4NqDF3UmNCZ4nqDX_A?poc_token=HAH-T2ijqz-lJoMfbg6dOQApr4LW1GaLtIBQSZhh)
![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL03Nrr2xwNL7NagpmUwe8Qs1ibicfU8cDBuyMEvIrAqdv0pPp4ibm4YXgQcuwQhibDOIKtBZPanRtU55GQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)
Filters 控制的展示：
> Controls行的最后的配置 小齿轮图标可以展开很多配置

使用大请求行 - 默认情况下，Requests Table一个资源只显示很小的一行。选中Use large resource rows(使用大资源行)按钮可以显示两个文本字段：主要字段和次要字段。
捕获屏幕截图 - 将鼠标悬停在某个屏幕截图上的时候，Timeline/Waterfall(时间轴)会显示一条垂直的黄线，指示该帧是何时被捕获的
显示概述 - 展示页面整个生命周期的各个阶段（Overview 区域）的耗时（蓝色绿色的那些横杠）
![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL03Nrr2xwNL7NagpmUwe8Qs1FWbiasDbicUvgWI6PloqeBpNeFgJ40aUzKunvp4EPbEuIzOGeIia8NDiaw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)
Requests Table 区域:
可以右键列名 调整column展示的信息