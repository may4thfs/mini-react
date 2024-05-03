// v2 动态创建 react -> vdom(js obj) -> real dom
// vdom 的概念 -- 用 js 对象描述一个节点：{type, props, children}
// 实现：
//   - 利用(createTextNode / createElement)函数动态创建虚拟 dom
//   - 然后通过 render 函数将虚拟 dom 渲染成真实 dom

/**
 * 创建一个文本节点
 * @param {string} text 文本内容
 * @returns  返回一个文本节点对象
 */
function createTextNode(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  }
}

/**
 * 创建一个虚拟 DOM 对象
 * @param {string} type 节点类型
 * @param {*} props 节点属性
 * @param  {...any} children 子节点
 * @returns 返回一个虚拟 DOM 对象
 */
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      // * 这里需要判断 child 是否是 string，如果是 string，就创建一个文本节点，否则就直接使用 child
      children: children.map((child) => {
        return typeof child === "string" ? createTextNode(child) : child
      })
    }
  }
}

// 问题：如何创建一个真实的 DOM 节点？
// 分析这两段（创建节点的）原生代码步骤：1. 它们都是创建一个节点 2. 通过 props 属性来描述节点的属性 3. 将自己 append 被添加到父节点下
// const dom = document.createElement(App.type)
// dom.id = App.props.id
// document.querySelector("#root").append(dom)

// const textNode = document.createTextNode("")
// textNode.nodeValue = textEl.props.nodeValue
// dom.append(textNode)

// 根据分析，将上面的代码封装成一个 render 函数

/**
 * render 函数实现了一个简单的虚拟 DOM 渲染机制，可以将一个虚拟 DOM 对象（转成真实节点）渲染到真实的 DOM 树中。
 * @param {*} el 虚拟 DOM 对象
 * @param {*} container 真实的 DOM 节点
 */
function render(el, container) {
  // 1. 创建节点（区分类型）
  const dom =
    el.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(el.type)

  // 2. 设置属性，比如 id, class, style 等
  // 目的：复制 el.props 对象中的所有属性到 dom 对象中，但是排除了 children 属性。这是因为 children 属性是一个数组，需要单独处理
  Object.keys(el.props).forEach((key) => {
    if (key !== "children") {
      dom[key] = el.props[key]
    }
  })

  // 遍历这个数组中的每个子元素，并递归调用 render 函数将这些子元素渲染到新创建的DOM节点中
  const children = el.props.children || []
  children.forEach((child) => {
    render(child, dom)
  })

  // 3. 将节点添加到父节点中
  container.append(dom)
}

const React = {
  render,
  createElement
}

export default React
