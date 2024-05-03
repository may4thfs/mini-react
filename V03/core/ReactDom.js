import React from "./React.js"

// 当前的小目标：让 mini-react 的 API 和 react 的 API 一样 ===》ReactDOM
// ReactDOM.createRoot(document.getElementByid("root")).render(<App />))

const ReactDom = {
  createRoot(container) {
    return {
      render: (App) => {
        React.render(App, container)
      }
    }
  }
}

export default ReactDom
