
最近写的Dialog & Selector组件都有涉及到事件传播机制的问题 & 一个onFocus的点
有如下两点
+ 内部的点击事件都会逐层上传，每一个监听相应事件的父组件都会响应
+ onFocus是将焦点聚焦在组件，并不会自动移除焦点，使用起来要小心，推荐用onClick代替

> Selector
```tsx
import { ReactElement, useState } from "react";
import { useChatStore } from "../../stores/store";
import './selector.css'
/**
 * label + displayer 
 *       + option container
 * @description tabIndex + onFocus + onBlur
 */
export type DeviceCardProps = {
  "manage-ip": string
  "username": string
  "password": string
  "dip": string
  "pattern": string
  "interface": string
  "jump-host"?: string
  "jump-username"?: string
  "jump-password"?: string
}
type SelectorProps = {
  tabIndex: number
  label?: string
  options: {
    [key: string]: DeviceCardProps
  }
}
type OptionProps = {
  onSelect: (v: string) => void
  optionText: string
  optionValue: string | object
}
function Option({ optionText, optionValue, onSelect }: OptionProps): ReactElement {
  return <>
    <div 
      onClick={() => onSelect(optionText)}
      className="option">
      <span data-value={optionValue} >{optionText}</span>
    </div>
  </>
}
export default function Selector({ tabIndex, label = 'Available Devices', options }: SelectorProps): ReactElement {
  const [isFocus, setIsFocus] = useState(false)
  const [selected, setSelected] = useState('')
  return <>
    <div
      tabIndex={tabIndex}
      onFocus={() => setIsFocus(!isFocus)}
      onBlur={() => setIsFocus(false)}
      className="selector">
      <span>{label}</span>
      <div className="wrapper">
        <div className="displayer">{selected}</div>
        <div
          onClick={() => setIsFocus(false)}
          className={`options-conatainer ${isFocus ? "show" : "hide"}`}>
          {Object.entries(options).map(([configLabel, config], index) =>
            <Option
              key={index + configLabel}
              onSelect={setSelected}
              optionText={configLabel}
              optionValue={config} />
          )}
        </div>
      </div>
    </div>
  </>
}
export const ExampleSelector = () => {
  const configs = useChatStore((s) => s.deviceConfigs)
  return <Selector tabIndex={0} options={configs} />
}
```
这个是最初的版本使用`onFocus`来处理变化，最初是false来关闭options，当focus的时候取反，打开options
之后再options中选中时候再关闭options
但是问题是，当选中option关闭之后，其实焦点还是留在`selector`中的，并没有触发`onBlur`
因此当你没有点击`selector`之外来触发`onBlur`，再次点击`selector`也不会触发`onFocus`
因此需要换成`onClick`

但是当你换成`onClick`之后就会发现，`selector`里面options的点击会触发`selector`的点击事件
这个时候就需要`stopPropagation`来阻止事件冒泡了。
将`onFocus`换成`onClick`观察点击事件的触发
```jsx
onClick={() => {
  setIsFocus(!isFocus)
  console.log("clicked selector")
}}
```