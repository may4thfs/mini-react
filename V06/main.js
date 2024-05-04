// v1 静态创建
// 如何让它"app"显示到页面上呢？ --- 最简单的做法如下6行代码：
// 实现：在 ID 为 "root" 的元素中添加一个新的子 div 元素，这个 div 元素的 ID 为 "app"，并包含一个文本节点，其内容为 "app"。
// const dom = document.createElement("div")
// dom.id = "app"
// document.querySelector("#root").append(dom) // append 添加到父节点的子列表的末尾。

// const textNode = document.createTextNode("")
// textNode.nodeValue = "app"
// dom.append(textNode)

// v2 动态创建 react -> vdom(js obj) -> real dom
// vdom 的概念 -- 用 js 对象描述一个节点：{type, props, children}
// 实现：
//   - 利用(createTextNode / createElement)函数动态创建虚拟 dom
//   - 然后通过 render 函数将虚拟 dom 渲染成真实 dom

import ReactDOM from "./core/ReactDom.js"
import App from "./App.jsx"

ReactDOM.createRoot(document.getElementById("root")).render(App)
