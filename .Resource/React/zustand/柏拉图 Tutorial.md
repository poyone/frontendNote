zustand主要是替代context(任意state改变整个context作用范围re-render)管理状态
useMemo useCallback解决的问题是计算缓存
总结下来有三种类型的使用
1. 基本使用：调用创建好的`store`hook,获取必要的state
2. 特性方法：根据`create`创建的对象调用其各种方法，比如`subscribe`,`get\setState`
3. 中间件：使用内置的middleware来定义`store`的行为，比如`immer`,`persist`
类型定义
总结下来，所有的`store`都有两种行为
1. `state`记录
2. `action`对`state`做修改的function
> 建议把store和action分离

# 01 QS

1. zustand可以自动浅拷贝第一层的obj，就不用手动写扩展运算符了
2. `export const useBearStore = create<TBearStoreState>()((set) => ({`
对create增加类型需要给一个括号，原本就是直接调用create函数，现在还要在调用括号前加一个括号
3. 调用hook的解构，如果你就是偷懒直接使用解构语法，那么这个hook中的任意state update，都会引起组件update
而使用zustand就是为了解决context无故更新的问题
4. zustand中是可以直接使用async函数的
# 02 get set immer middleware
> 通常我们也可以称store里面的function 为action
> 如此便可把XXStore成为 state + action的定义，就两种类型

```jsx
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
type TCatStoreState = {
  cats: {
    bigCats: number;
    smallCats: number;
  };
  increaseBigCats: () => void;
  increaseSmallCats: () => void;
  summary: () => void;
};
export const useCatStore = create<TCatStoreState>()(
  immer((set, get) => ({
    cats: {
      bigCats: 0,
      smallCats: 0,
    },
    increaseBigCats: () =>
      set((state) => {
        state.cats.bigCats++;
      }),
    increaseSmallCats: () =>
      set((state) => {
        state.cats.smallCats++;
      }),
    summary: () => {
      const total = get().cats.bigCats + get().cats.smallCats;
      return `There are ${total} cats in total. `;
    },
  }))
);
```
# 03 selector

> create的返回值就是一个selectorHook，你在其他地方调用的时候可以通过selector选择某个状态

这个主要是解决你的全解构state，但是只需要部分state，导致不必要的re-render的情况
官方写的`createSelectors`函数有点难理解

# 04 一次选择多个状态 & shallow

1. 使用对象，键值的方式
```jsx
const { increaseBigCats, increaseSmallCats } = useCatStore(
  (state) => ({
    increaseBigCats: state.increaseBigCats,
    increaseSmallCats: state.increaseSmallCats,
  }),
  shallow
);
```
2. 使用数组的方式
```jsx
const [increaseBigCats, increaseSmallCats] = useCatStore(
  (state) => [state.increaseBigCats, state.increaseSmallCats],
  shallow
);
```
shallow的作用就是浅对比，如果第一层的值没有改变，就认为这个obj没有变化
比较的是下面的这个
```jsx
{
  increaseBigCats: state.increaseBigCats,
  increaseSmallCats: state.increaseSmallCats,
}
```
你也可以自己写一个比较函数
# 05 devtools

1. 安装redux devtools
2. 使用`import { devtools } from "zustand/middleware";` 来包裹store
```jsx
export const useCatStore = createSelectors(
  create<TCatStoreState>()(
    immer(
      devtools(
        (set, get) => ({
          cats: {
            bigCats: 0,
            smallCats: 0,
          },
          increaseBigCats: () =>
            set((state) => {
              state.cats.bigCats++;
            }),
          increaseSmallCats: () =>
            set((state) => {
              state.cats.smallCats++;
            }),
          summary: () => {
            const total = get().cats.bigCats + get().cats.smallCats;
            return `There are ${total} cats in total. `;
          },
        }),
        {
          enabled: true,
          name: "cat store",
        }
      )
    )
  )
);
```
+ 如果有`immer`，把`devtools`把写在其里面第一层即可
+ `enabled: true`是控制debug开关，product的时候可以统一设置`false`来关闭
+ chrome的界面中你需要选择正确的instance，可以使用`Autoselect instance`
  + 也可以为你的store命名，然后选择。也可以通过`name`参数命名
# 06 persist状态保存

除了使用localStorage，zustand还封装了一个`persist`中间件帮助你保存状态
+ 因为是middleware，所以使用起来也是将create store包一包，不过它的==第二个参数是必选项，至少需要`name`参数==
+ 默认是保存在localStorage，也可以在第二个参数配置`storage`保存在session/async... storage
  + 使用zustand内置的`createJSONStorage`func
+ `partialize`可以保存部分状态用起来跟`set`函数一样 
  + 获取一个总的`state`，然后你可以`filter` `includes`，或者直接写需要的`state`
+ 清除`storage`并不是重置`state`
  + `<button onClick={useBearStore.persist.clearStorage}>`这里可以将storage清除，但是当前页面的memory里面state还是最新值
  + 所以如果你是写一个reset button，onClick应该有对state的重置
+ 中间件的包裹顺序为：`immer -> devtools -> persist`
```jsx
export const useBearStore = create<TBearStoreState>()(
  persist(
    (set) => ({
      bears: 0,
      color: "red",
      size: "big",
      increasePopulation: () =>
        set((state) => ({
          bears: state.bears + 1,
        })),
      removeAllBears: () => set({ bears: 0 }),
    }),
    {
      name: "bear store",
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !["size", "color"].includes(key)
          )
        ),
    }
  )
);
```
# 07 subscribe

## subscribe

与subscribe对应的是reactive，reactive也就是react doc里面的响应式的。
subscribe为什么需要放在useEffect中，必须嘛？
考虑下zustand其实是为了优化context的场景，如果你的这个state需要props drill，那么你有两种方案：
+ 一个是使用context
+ 一个是逐层传递state
任意改变都会造成这个子组件re-render，
1. 订阅器
  + 这时你可以通过`useEffect`初次挂载这个`subscribe`订阅器，就像是`addEventListener`一样(也需要remove)
  + `subscribe`的返回值就是一个`unsub`可以作为clean up func执行
  + `subscribe`里面的state的任意变化都会让`subscribe`里的代码运行一遍，但是并不会造成Component的渲染
  + 然后zustand就会在只有符合条件的时候调用这个`subscribe`订阅器里面的代码，修改组件里的一些值 重渲染
2. 条件，prevState nextState
  在subscribe中你可能根据前一个状态& 后一个状态来决定是否需要调用subscribe
  这也是一个你需不需要subscribe的考虑因素
```jsx
function App() {
  return (
    <div className="container">
      <h1>Zustand Tutorial</h1>
      <div>
        <BearBox />
        <FoodBox />
      </div>
    </div>
  );
}
export const FoodBox = () => {
  const { fish, addOneFish, removeOneFish, removeAllFish } = useFoodStore();
  return (
    <div className="box">
      <h1>Food Box</h1>
      <p>fish: {fish}</p>
      <div>
        <button onClick={addOneFish}>add one fish</button>
        <button onClick={removeOneFish}>remove one fish</button>
        <button onClick={removeAllFish}>remove all fish</button>
      </div>
    </div>
  );
};
export const BearBox = () => {
  const { bears, increasePopulation, removeAllBears } = useBearStore();
  const fish = useFoodStore((state) => state.fish);
  return (
    <div className="box" style={{ backgroundColor: fish > 5 ? "lightpink" : "lightgreen" }}>
      <h1>Bear Box</h1>
      <p>bears: {bears}</p>
      <p>{Math.random()}</p>
      <div>
        <button onClick={increasePopulation}>add bear</button>
        <button onClick={removeAllBears}>remove all bears</button>
        <button onClick={useBearStore.persist.clearStorage}>
          clear storage
        </button>
      </div>
    </div>
  );
};
```
这里每次food的改变都会造成foodbox re-render(通过随机数观察)但是其实我们之关系，当food > 5这个点
于是你可以通过`subscribe`和`useState`来解决
+ `subscribe`订阅的状态每次改变都会造成代码运行，但是不会触发组件re-render
+ `setState`改变状态会造成组件基于最新值渲染
+ 所以在`subscribe`条件分支中`setState`可以让组件按需渲染
```jsx
export const BearBox = () => {
  const { bears, increasePopulation, removeAllBears } = useBearStore();
  const [bgColor, setBgColor] = useState<"lightgreen" | "lightpink" | undefined>(undefined);
  useEffect(() => {
    const unsub = useFoodStore.subscribe((state, prevState) => {
      if (prevState.fish <= 5 && state.fish > 5) {
        setBgColor("lightgreen");
      } else if (prevState.fish > 5 && state.fish <= 5) {
        setBgColor("lightpink");
      }
    });
    
    return unsub;
  }, []);
  return (
    <div className="box" style={{ backgroundColor: bgColor }}>
    ...
  )
```
注意到此时随机数就稳定下来了
> 这个也可以通过`memo`做到
## 中间件subscribeWithSelector

+ 假设你只关心部分state，就可以使用`subscribeWithSelector`来订阅部分state
+ 这个中间件有三个参数
  + `selector`
  + `listener`
    + 订阅部分你关系的`state`
  + `options`
    + `equalityFn`: `shallow`,（浅比较）
    + `fireImmediately`: `true`,（第一次调用的时候是否执行订阅器里的代码）
+ 中间件的包裹顺序为：`immer -> devtools -> subscribeWithSelector -> persist`
```jsx
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
type TFoodStoreState = {
  fish: number;
  addOneFish: () => void;
  removeOneFish: () => void;
  removeAllFish: () => void;
};
export const useFoodStore = create<TFoodStoreState>()(
  subscribeWithSelector((set) => ({
    fish: 0,
    mouse: 0,
    addOneFish: () => set((state) => ({ fish: state.fish + 1 })),
    removeOneFish: () => {
      set((state) => ({ fish: state.fish - 1 }));
    },
    removeAllFish: () => {
      set({ fish: 0 });
    },
  }))
);
```
```jsx
useEffect(() => {
  const unsub = useFoodStore.subscribe(
    // selector
    (state) => state.fish,
    // listener
    (fish, prevFish) => {
      // 之前和现在的值相等，就代表是第一次load
      if (fish == prevFish) { 
        if (fish <= 5) {
          setBgColor("lightpink");
        } else {
          setBgColor("lightgreen");
        }
      }
      if (prevFish <= 5 && fish > 5) {
        setBgColor("lightgreen");
      } else if (prevFish > 5 && fish <= 5) {
        setBgColor("lightpink");
      }
    },
    // options
    {
      equalityFn: shallow,
      fireImmediately: true,
    }
  );
  return unsub;
}, []);
```
# 08 getState setState

1. `setState`可以在component中(不在也可以)直接操作store(之前你得把它定义在create里面)
2. `getState`是non reactive的值，类似useRef，不会触发组件更新

3. 这里是zustand最佳实践，通过`getState setState`来分离`store` `action`，让代码更加简洁易懂
```jsx
import { create } from "zustand";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
const initialFoodValue = {
  fish: 0,
  mouse: 0,
};
export const useFoodStore = create<typeof initialFoodValue>()(
  devtools(
    subscribeWithSelector(
      persist(() => initialFoodValue, { name: "food store" })
    ),
    { name: "food store" }
  )
);
export const addOneFish = () =>
  useFoodStore.setState((state) => ({ fish: state.fish + 1 }));
export const removeOneFish = () =>
  useFoodStore.setState((state) => ({ fish: state.fish - 1 }));
export const removeAllFish = () => useFoodStore.setState({ fish: 0 });
```
+ `typeof initialFoodValue`可以动态接收`initialFoodValue`的类型，方便增删`initialFoodValue`的类型

