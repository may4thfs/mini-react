import React from "./core/React.js"

// 在这个例子中，`count` 被定义在组件外部，作为一个全局变量。这是因为在这个简化的 React 模型中，没有使用 React 的 `useState` Hook 来管理状态，而是直接操作了全局变量 `count` 来模拟状态的更新。

// 在真实的 React 应用中，我们通常不会这样做，因为这样的代码很难维护和理解，也容易引发 bug。我们通常会使用 `useState` 或 `useReducer` Hook 来管理组件的状态。

// 这个例子可能是为了演示 React 的更新机制，而简化了状态管理的部分。在点击按钮后，`count` 的值会增加，然后调用 `React.update()` 来触发组件的重新渲染。
let count = 10
let props = { id: "111" }
function Counter({ num }) {
  function handleClick() {
    console.log("click")
    count++ // 模拟 state 更新
    props = {} // 模拟 props 删除
    React.update()
  }

  return (
    <div {...props}>
      count: {count}
      <button onClick={handleClick}>click</button>
    </div>
  )
}

function CounterContainer() {
  return <Counter></Counter>
}

function App() {
  return (
    <div>
      hi-mini-react
      <Counter num={10}></Counter>
      {/* <Counter num={20}></Counter> */}
    </div>
  )
}

export default App
