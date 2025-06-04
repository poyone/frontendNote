# 为什么要脱离？

虽然ref和effect表面是react的hook，但是他们是帮助你脱离react的f(state) => UI的工具

1.  ref
2.  effect

第四章和第三章连接紧密
第三章作为render phase的主要参与，是我们构建UI最基础的地方
第四章是commit phase的主要部分，对于dom已经render后，我们可以通过ref连接dom，effect连接一些外部系统

第三章作为第二章的进阶，可以帮助理解state的很多行为。
第四章辅助第三章，帮助我们完成react之外的一些控制

# ref

这里的 ref 指向一个数字，但是，像 [state](https://zh-hans.react.dev/learn/state-a-components-memory) 一样，你可以让它指向任何东西：字符串、对象，甚至是函数。与 state 不同的是，ref 是一个普通的 JavaScript 对象，具有可以被读取和修改的 `current` 属性。

请注意，**组件不会在每次递增时重新渲染。** 与 state 一样，React 会在每次重新渲染之间保留 ref。但是，设置 state 会重新渲染组件，更改 ref 不会！

## 何时使用ref

- 存储 [timeout ID](https://developer.mozilla.org/docs/Web/API/setTimeout)
- 存储和操作 [DOM 元素](https://developer.mozilla.org/docs/Web/API/Element)
- 存储不需要被用来计算 JSX 的其他对象。

## ref操作dom

==在 React 中没有内置的方法来做这些事情==，所以你需要一个指向 DOM 节点的 **ref** 来实现。

1. 限制组件ref只暴露部分功能，你可以用 [`useImperativeHandle`](https://zh-hans.react.dev/reference/react/useImperativeHandle) 来做到这一点
2. 更新dom和ref操作的异步问题使用`flushSync
	+ 官方示例是说你有一个arr click增加一个item，你希望使用`listRef.current.lastChild.scrollIntoView` 当增加后立马滚动到位置，那么就可以用`flushSync` [用 flushSync 同步更新 state](https://zh-hans.react.dev/learn/manipulating-the-dom-with-refs#flushing-state-updates-synchronously-with-flush-sync)

# effect

## effect的定位

React 组件中的两种逻辑类型：
1. 渲染代码：props 和 state 转换为页面上显示的 JSX
2. 事件处理程序handler：由用户输入动作影响state，引起“副作用”，改变页面

Effect 允许你指定由渲染自身，而不是特定事件引起的副作用。
比如建立起一个服务器连接，组件卸载后清理这个链接等，不需要用户来操作引起更新的事情。

## 如何理解effect

之前，你是从组件的角度思考的。当你从组件的角度思考时，很容易将 Effect 视为在特定时间点触发的“回调函数”或“生命周期事件”，例如“渲染后”或“卸载前”。这种思维方式很快变得复杂，所以最好避免使用。
相反，始终专注于单个启动/停止周期。无论组件是挂载、更新还是卸载，都不应该有影响。只需要描述如何开始同步和如何停止。如果做得好，==Effect 将能够在需要时始终具备启动和停止的弹性==。

## 一般使用场景

1. 对dom、api的操作应该放在useEffect中：
	因为他们是UI渲染以外的副作用行为(他们依赖dom能否成功渲染(浏览器)、api能否正确返回(服务方)，这种react职责外的功能)
```jsx
useEffect(() => {
  function handleScroll(e) {
    console.log(window.scrollX, window.scrollY);
  }
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

2. 管理非React的组件：
	如果你插入某些不是react的组件，也需要使用useEffect来管理这些组件

3. 在useEffect中fetch数据：
	这一点很常见，但是也限制了它必须在客户端请求，这基本就告别了ssr。
	+ 你可以考虑框架的fetch机制
	+ 或者使用React Query、useSWR、React Router来解决

## 依赖项数组

### 基本

+ 依赖数组可以包含多个依赖项。只有当你指定的 所有 依赖项的值都与上一次渲染时完全相同，React 才会跳过重新运行该 Effect。
+ 任何值都可以作为依赖项，ref也可以

### 如何理解依赖项

是你的代码依赖 依赖项，而不要排除一些依赖项来控制如何驱动effect
如果有你不想要的依赖项考虑将他们移动到effect外，或者使用effectEvent
而不是镇压编辑器警告

### 底层用Object.is比较依赖

React 使用 Object.is 来比较依赖项的值。
Object.is 的作用
+ 它是 JavaScript 的严格值比较方法，与 `===` 类似，但处理了两种特殊情况：
	+ NaN 的比较：`Object.is(NaN, NaN)` 返回 true，而 `NaN === NaN` 返回 false。
	+ 0 和 -0 的区分：`Object.is(+0, -0)` 返回 false，而 `+0 === -0` 返回 true。
+ 对于其他基本类型（如字符串、数字、布尔值），行为与 === 一致。
```jsx
// 依赖项为 NaN（不会重复触发）
useEffect(() => {
  console.log('NaN 变化');
}, [NaN]); // 仅在组件挂载时执行一次
// 依赖项为对象（引用变化时触发）
const obj = { id: 1 };
useEffect(() => {
  console.log('对象变化');
}, [obj]); // 每次渲染时 obj 都是新对象，effect 会重复执行
```

### ref做依赖项以及stable value

在某些情况下，React 知道 一个值永远不会改变，即使它在组件内部声明。
例如，从 useState 返回的 set 函数和从 useRef 返回的 ref 对象是 稳定的 ——它们保证在重新渲染时不会改变。
稳定值==Stable values==不是响应式的，因此可以从列表中省略它们。包括它们是允许的：它们不会改变，所以无关紧要。

### 多个effect依赖同一个值

其实这个跟setState差不多，如果一个handler里面有多个update state的操作，会被都加入Queue中，都执行完了再render
如果多个useEffect有相同的依赖项，他们会按照定义的顺序执行，渲染相关代码计算完之后就可以开始渲染了。而不是说执行一个Effect渲染再执行另外一个Effect

### 使用闭包移除依赖

我们知道setXX函数有两种用法，一种是传入value 一种是传入func
+ 传入value的方式必定要读取state，于是必须要添加依赖项
+ 传入func的部分其实是闭包，这个func隐式地连接到了旧state

像下面这样，useEffect就不用监听count了
```jsx
import { useState, useEffect } from 'react';

export default function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('✅ 创建定时器');
    const id = setInterval(() => {
      console.log('⏰ Interval');
      setCount(count => count + 1);
    }, 1000);
    return () => {
      console.log('❌ 清除定时器');
      clearInterval(id);
    };
  }, []);

  return <h1>计数器: {count}</h1>
}
```

## 清理函数

==React 会在每次 Effect 重新运行之前调用清理函数，并在组件卸载（被移除）时最后一次调用清理函数==。
```jsx
import { useState, useEffect } from 'react';
import { createConnection } from './chat.js';
export default function ChatRoom() {
  useEffect(() => {
    const connection = createConnection();
    connection.connect();
    return () => connection.disconnect();
  }, []);
  return <h1>欢迎来到聊天室！</h1>;
}
✅ 连接中……
❌ 连接断开。
✅ 连接中……
```
在生产环境下，你只会看到 "✅ 连接中……" 打印一次。
这是因为重新挂载组件只会在开发环境下发生，以此帮助你找到需要清理的 Effect。
React 总是在执行下一轮渲染的 Effect 之前清理上一轮渲染的 Effect 的clean up函数

## race condition跟独立effect
> 这里很容易想象成是链式的，但是由于有clean up的存在，你应该把他想象成独立的
> 每次都是干净的状态才对，不纯净就是代码没有遵循react的风格

记住，==每次Effect运行都是一个完全隔离的闭包==，类似于每次state触发都是独立的一样。

这段代码中有一个 bug。试试先选择 Alice，再选择 Bob，接着立即选择 Taylor。
如果操作得足够快，你会观察到这个 bug：虽然 Taylor 被选中了，但下面的一段却说：“这是 Bob 的传记。”
```jsx
import { useState, useEffect } from 'react';
import { fetchBio } from './api.js';
export default function Page() {
  const [person, setPerson] = useState('Alice');
  const [bio, setBio] = useState(null);
  useEffect(() => {
    setBio(null);
    fetchBio(person).then(result => {
      setBio(result);
    });
    return () => setBio(null);
  }, [person]);
  return (
    <>
      <select value={person} onChange={e => {
        setPerson(e.target.value);
      }}>
        <option value="Alice">Alice</option>
        <option value="Bob">Bob</option>
        <option value="Taylor">Taylor</option>
      </select>
      <hr />
      <p><i>{bio ?? '加载中……'}</i></p>
    </>
  );
}
```
当你等待bob的时候切换到Taylor的时候：
1. 这里的过程是bob的fetch还在进行，不过响应你的操作是最优先的
2. 于是react会执行清理函数，卸载组件
3. 切换到Taylor，假设他的response还先一步bob返回，那你就先看到Taylor了
4. 然后bob的终于响应了，于是又更新成bob了

```jsx
  useEffect(() => {
    let ignore = false;
    setBio(null);
    fetchBio(person).then(result => {
      if (!ignore) {
        setBio(result);
      }
    });
    return () => ignore = true;
  }, [person]);
```
由于切换人物会造成组件卸载，于是clean up函数会立即执行
所以当fetch数据来的时候`if (!ignore)`是过不去的。

+ 另外你也可以使用`AbortController`来做清理函数


## 总结

+ 组件可以挂载、更新和卸载。
+ 每个 Effect 与周围组件有着独立的生命周期。
+ 每个 Effect 描述了一个独立的同步过程，可以 开始 和 停止。
+ 在编写和读取 Effect 时，要独立地考虑每个 Effect（如何开始和停止同步），而不是从组件的角度思考（如何挂载、更新或卸载）。
+ 在组件主体内声明的值是“响应式”的。
+ 响应式值应该重新进行同步 Effect，因为它们可以随着时间的推移而发生变化。
+ 检查工具验证在 Effect 内部使用的所有响应式值都被指定为依赖项。
+ 检查工具标记的所有错误都是合理的。总是有一种方法可以修复代码，同时不违反规则。


