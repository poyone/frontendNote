import { useState } from "react";
import './selector.css'

/**
 * 这里的知识点主要是 tabIndex & onBlur onFocus
 * 通过tabIndex让组件可以聚焦 & 失焦，从而触发onBlur onFocus
 * 这样就不用其他监听器来确定是否点击selector以外 以及 是否需要关闭selector
 */

const exampleData = {
  configA: {
    name: "waibibabu",
    age: 28,
    gender: "male"
  },
  configAS: {
    name: "tangbubulibo",
    age: 28,
    gender: "male"
  },
  configAD: {
    name: "makabaka",
    age: 28,
    gender: "male"
  }
}

type SelectOptionProps = {
  name: string
  age: number
  gender: string
  onSelect: (v: string) => void
}

function SelectOption(props: SelectOptionProps) {

  return <div 
    onClick={() => props.onSelect(props.name)}
    className="option">
    <span>{`I'm ${props.name} a ${props.gender} in ${props.age} years old`}</span>
  </div>
}

export default function Selector() {
  const [selected, setSelected] = useState('')
  const [isFocus, setIsFocus] = useState(false)

  return <div 
    tabIndex={0}
    onFocus={() => setIsFocus(true)}
    onBlur={() => setIsFocus(false)}
    className="selector">
    <div className="displayer">Current: {selected}</div>
    <div className={`optionContainer ${isFocus? "show": "hide"}`}>
      {Object.values(exampleData).map(
        config => <SelectOption key={config.name} {...config} onSelect={setSelected} />)}
    </div>
  </div>
}