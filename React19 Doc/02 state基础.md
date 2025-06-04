# 事件监听器

1. 事件处理器：`onClick`对应`dom.addEventListener('click', func)`，[react有对应的表不能随便写](https://react.dev/reference/react-dom/components/common)
2. 事件委托：React 实际上并不会为每个元素单独添加事件监听器，而是在文档的根节点（React 17 之前是 document，17 之后是 React 应用的根 DOM 节点）上为每种事件类型添加一个监听器。
3. 唯一参数 事件对象：事件处理函数接收一个 `事件对象(event object)` 作为唯一的参数

与渲染函数不同，事件处理函数不需要是 `纯函数` 因此它是用来 `更改` 某些值的绝佳位置。
但是，为了更改某些信息，你首先需要某种方式存储它。在 React 中，这是通过 `state（组件的记忆）` 来完成的。
> 接下来就是state了

# state理解

```jsx
import { useState } from 'react';

function App() {
  let localVariable = 0
  const [count, setCount] = useState(0);

  const handleClick = () => {
	localVariable++
    setCount(count + 1);
  };  

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={handleClick}>点击增加</button>
    </div>
  );
}
```

## 1. state保留了状态

`state`是react提供的保留组件状态的hook：
相对应的是local variable局部变量，在每次react渲染的时候会重置掉。

## 2. 负责渲染的是哪些代码

所谓的渲染，代码上由两部分：
+ 具体的逻辑计算部分，这部分每次触发state update都会基于最新的state重新执行
```js
let localVariable = 0
const [count, setCount] = useState(0);

const handleClick = () => {
	localVariable++
	setCount(count + 1);
}; 
```
+ 渲染的html部分
```jsx
<div>
  <p>计数: {count}</p>
  <button onClick={handleClick}>点击增加</button>
</div>
```

## 3. state如同一张快照

理解state如同快照有三个部分

1. set函数触发UI基于新的state更新
2. 每一个state是单独存在的，就像闭包一样

当 React 调用你的组件时，它会为特定的那一次渲染提供一张 state 快照。
```jsx
setNumber(count + 1); // setNumber(0 + 1);
setNumber(count + 1); // setNumber(0 + 1);
setNumber(count + 1); // setNumber(0 + 1);
```
你的组件会在其 JSX 中返回一张包含==一整套新的 props== 和==事件处理函数==的 UI 快照 ，其中**所有的值都是 根据那一次渲染中 state 的值 被计算出来的**！

> 更新state会生成全新的props和handler(内存地址不同

3. 利用微任务在同步函数执行之后执行的特性可以先触发`setXx`执行，再执行我的函数吗？不可以
```jsx
import { useState } from 'react';
export default function Counter() {
  const [number, setNumber] = useState(0);
  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setTimeout(() => {
          alert(number);
        }, 3000);
        setNumber(number + 5);
      }}>+5</button>
    </>
  )
}
```
尝试**利用宏任务将alert推迟到渲染之后执行**，这样理论上number就应该是最新值
但是react的快照就是实打实的快照，setTimeout的环境已经被绑定到了上次的快照中，**不会因为这个异步的技巧被改变**。
一个 state 变量的值永远不会在一次渲染的内部发生变化， 即使其事件处理函数的代码是异步的。

## 4. setXx 传入值 & 函数 & 渲染队列

点菜的服务员不会在你说第一道菜的时候就跑到厨房！
相反，他们会让你把菜点完，让你修改菜品，甚至会帮桌上的其他人点菜。
 ![|400](https://zh-hans.react.dev/images/docs/illustrations/i_react-batching.png)

1. 批处理：React 会等到事件处理函数中的==所有代码==都运行完毕再处理你的 state 更新**。
	因此，一般将state的更新写在handler的最下面就好了
	暗示自己本次触发是基于当前状态而不是下一次。
```jsx
function handleClick() {
	setTimeout(() => console.log(number), 3000);
	setNumber(number + 5);
}
```

2. 传入函数：在下次渲染前迭代更新一个 state 
	其实源码中setState就是有对 func和非func区分，
	比如 n => n + 1 被称为 更新函数。当你将它传递给一个 state 设置函数时：
	1. React 会==将此函数加入队列==，以便在事件处理函数中的所有其他代码运行后进行处理。
	2. 在下一次渲染期间，React 会==遍历队列并给你更新之后的最终 state==。
```jsx
setNumber(n => n + 1); // setNumber(0 => 0 + 1);
setNumber(n => n + 1); // setNumber(1 => 1 + 1);
setNumber(n => n + 1); // setNumber(2 => 2 + 1);
```

3. 同时存在set value和func 会如何？
```jsx
<button onClick={() => {
  setNumber(number + 5);
  setNumber(n => n + 1);
}}>
```
	会按照代码顺序依次加入到更新队列，按照顺序修改n的值。
	上面的例子会先更新为5，之后更新为6

4. 简化版的setState Queue原理：最后的一个文档最后的一个challenge
```jsx
export function getFinalState(baseState, queue) {
  let finalState = baseState;

  for (let update of queue) {
    typeof update === 'function'
      ? finalState = update(finalState)
      : finalState = update
  }

  return finalState;
}
```

## 5. 只有state更新会触发渲染？

![](https://poysblog-1323001667.cos.ap-shanghai.myqcloud.com/blog/202501132152909.png)

1. 有两种原因会导致组件的渲染:
	+ 组件的 初次渲染。
	+ 组件（或者其祖先之一）的 状态发生了改变。
2. 在你触发渲染后，React 会调用你的组件来确定要在屏幕上显示的内容。“渲染中” 即 React 在调用你的组件。
	+ 在进行初次渲染时, React 会调用根组件。
	+ 对于后续的渲染, React 会调用内部状态更新触发了渲染的函数组件。
3. 在渲染（调用）你的组件之后，React 将会修改 DOM。
	+ 对于初次渲染，React 会使用 appendChild() DOM API 将其创建的所有 DOM 节点放在屏幕上。
	+ 对于重渲染，React 将应用最少的必要操作（在渲染时计算！），以使得 DOM 与最新的渲染输出相互匹配。
React 仅在渲染之间存在差异时才会更改 DOM 节点。

对于子组件的更新其实有三个触发点
1. state
2. props：父组件传下来的不同就会触发；别忘记每次state更新会创建新的props哦
3. context

## 总结

React 会使 state 的值始终“固定”在一次渲染的各个事件处理函数内部。你无需担心代码运行时 state 是否发生了变化。
+ 设置 state 请求一次新的渲染。
+ React 将 state 存储在组件之外，就像在架子上一样。
+ 当你调用 useState 时，React 会为你提供该次渲染 的一张 state 快照。
+ ==变量==和==事件处理函数==不会在重渲染中“存活”。==每个渲染都有自己的事件处理函数==。
+ 每个渲染（以及其中的函数）始终“看到”的是 React 提供给这个 渲染的 state 快照。
+ 过去创建的事件处理函数拥有的是创建它们的那次渲染中的 state 值。

对于子组件的更新三个点，这个点对于re-render优化至关重要
1. state
2. props：父组件传下来的不同就会触发；别忘记每次state更新会创建新的props哦
3. context
