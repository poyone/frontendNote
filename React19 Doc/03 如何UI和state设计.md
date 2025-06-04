> 这部分感觉跟设计模式一样，有点讨巧，比较依赖经验，但是也有几条简单好用的rule可以遵循

这张开始是基于一个理念，就像之前说的“纯函数”的理念
声明式UI、命令式UI （declarative UI compares to imperative

声明式类似于编排指令每一步都要写好
命令式类似于老板要求得到结果，不关心过程

这里的差别点在于，react中的命令式像是每次都得到预期的state，最后渲染出预期的UI，而不关心你怎么得到这个state
	还是封装吧。。。

## 推荐思考流程

下面你需要设计一个有input的表单
![](https://zh-hans.react.dev/_next/image?url=%2Fimages%2Fdocs%2Fdiagrams%2Fresponding_to_input_flow.png&w=750&q=75)
以这张图为例
1. 罗列出你的组件到底有几种UI状态
2. 理清这些UI状态之间的转换关系，于此你会得到你需要的state
3. 如果理不清，把所有可能的state都列出来，先实现你的组件
4. 精简删除不必要的state，过多的state可能导致考虑之外的bug

## 两种必须更新state的输入

人为输入。比如点击按钮、在表单中输入内容，或导航到链接。
计算机输入。比如网络请求得到反馈、定时器被触发，或加载一张图片。
以上两种情况中，你必须设置 state 变量 去更新 UI。

## 构建state的原则

+ ==合并总是一起更新的关联的 state==：如果你总是同时更新两个或更多的 state 变量，请考虑将它们合并为一个单独的 state 变量。
+ ==避免互相矛盾的 state==：当 state 结构中存在多个相互矛盾或“不一致”的 state 时，你就可能为此会留下隐患。应尽量避免这种情况。
+ ==避免冗余的 state(有些可以props计算出来)==：如果你能在渲染期间从组件的 props 或其现有的 state 变量中计算出一些信息，则不应将这些信息放入该组件的 state 中。(理清当前渲染code的值是否支持计算)
+ ==尽量使用原始类型==
+ 避免过深的嵌套

[对于使用原始类型，这里举个例子](https://zh-hans.react.dev/learn/choosing-the-state-structure#avoid-duplication-in-state)
你有一个select 组件，传入一个option arr，每个选项都可以被编辑
你设置两个state，一个显示所有option，一个绑定被选择的option
第一个state接受所有options
第二个接受`options[0]`

当你先选定了一个option的时候，如果你再edit它，options arr是可以更新的，但是被选择的哪个option是不会更新的，除非你在选中它一下。

但是如果你这里只是引用option的id的话，options arr更新，你这边也是会”更新的“
```js
const selectedItem = items.find(item =>
	item.id === selectedId
);
```
你只需要这么做。
> 其实这里还是利用了 ”渲染时计算出你需要的状态“这个条件

==这里我们也可以得出，尽量不要依赖react的机制，react更多的推销他们的思考模式== 
==--> 状态(state)驱动 UI 更新，但是因可能少的使用state 、effect==

# UI树和state的重置或保留

+ 只要一个组件还被渲染在 UI 树的相同位置，React 就会保留它的 state。
	+ [这点可以参考这一节的解释| 相同位置的相同组件会使得 state 被保留下来](https://zh-hans.react.dev/learn/preserving-and-resetting-state#same-component-at-the-same-position-preserves-state)
	+ 记住对 React 来说重要的是组件在 UI 树中的位置,而不是在 JSX 中的位置！
```jsx
<Counter />
{showB && <Counter />} 
```
这两个独立的计数器组件，他们会共享同一个state，也就是state被保留了，而不是重置

+ 相同位置的不同组件会使 state 重置
```jsx
<div>
  {isPaused ? (
	<p>待会见！</p> 
  ) : (
	<Counter /> 
  )}
...
</div>
```

+ 使用key在相同位置重置 state
```jsx
{isPlayerA &&
<Counter person="Taylor" />
}
{!isPlayerA &&
<Counter person="Sarah" />
}
```

# 如果嵌套声明组件呢？

我们知道需要把组件定义在最上层，但是如果在某个组件中定义一个组件会怎么样?
```jsx
export default function MyComponent() {
  const [counter, setCounter] = useState(0);

  function MyTextField() {
    const [text, setText] = useState('');
...
```

这里你每次触发`onClick`的时候，都会更新state，导致`MyComponent`里面的代码都执行一遍，然后生辰新的`MyTextField`函数对象，导致`MyTextField`每次都不同，每次都会是默认的state

