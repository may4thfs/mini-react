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
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el]
    }
  }
}

// 任务单元
let nextWorkOfUnit = null
function workLoop(deadline) {
  let shouldYield = false
  // 任务分割：如果当前帧剩余时间小于 1ms 以及当前任务有值，则跳出循环，让出主线程
  while (!shouldYield && nextWorkOfUnit) {
    // 执行当前任务单元后返回下一个任务单元
    nextWorkOfUnit = performanceWorkUnit(nextWorkOfUnit)
    shouldYield = deadline.timeRemaining() < 1
  }

  requestIdleCallback(workLoop)
}

/** 封装函数createDom，updateProps，initChildren */

/**
 * 创建一个真实的 DOM 节点
 * @param {*} type 节点类型
 * @returns
 */
function createDom(type) {
  return type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(type)
}

/**
 * 将虚拟 DOM 对象的属性更新到真实的 DOM 节点上
 * @param {*} dom 真实的 DOM 节点
 * @param {*} props 节点属性
 */
function updateProps(dom, props) {
  Object.keys(props).forEach((key) => {
    if (key !== "children") {
      dom[key] = props[key]
    }
  })
}

/**
 * 构建一个虚拟 DOM 树的链表结构。
 * * 这个结构可以帮助我们在后续的渲染和更新过程中，更方便地遍历和操作虚拟 DOM 树。
 * * fiber 对象是一个链表结构，包含了当前节点的所有信息。特别是 parent，child，sibling 这三个指针，用来构建节点之间的关系
 * @param {*} fiber 当前 fiber 节点
 */
function initChildren(fiber) {
  const children = fiber.props.children
  let prevChild = null // 记录上一个子节点
  children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      child: null,
      parent: fiber,
      sibling: null,
      dom: null // 存储与 fiber 对应的真实 DOM 节点
    }

    // 将第一个节点设置为父节点的 child 属性，其他节点设置为上一个节点的 sibling 属性。这样就形成了一个链表结构。
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevChild.sibling = newFiber
    }

    // 更新 prevChild，以便在下一次循环中，可以将新的节点添加到链表中。
    prevChild = newFiber
  })
}

/**
 * 执行任务单元
 * @param {*} fiber 当前任务单元
 * @returns 返回下一个要执行的任务
 */
function performanceWorkUnit(fiber) {
  // 根据设计，初次进来 fiber.dom 真实节点已存在（如root），所以这里会跳过，直接进入 initChildren
  if (!fiber.dom) {
    // 1. 创建真实 dom，并添加到真实 dom 父节点
    // 同时将真实 DOM 节点保存到 fiber.dom 属性上
    const dom = (fiber.dom = createDom(fiber.type))
    fiber.parent.dom.append(dom)

    // 2. 处理 props，将 props 属性更新到真实 DOM 节点上
    updateProps(dom, fiber.props)
  }

  // 3. 转换链表，设置好指针（规则：child，sibling，parent）
  initChildren(fiber)

  // 4. 返回下一个要执行的任务
  // 优先级：child -> sibling -> parent.sibling（父节点的兄弟节点）
  if (fiber.child) {
    return fiber.child
  }

  if (fiber.sibling) {
    return fiber.sibling
  }

  return fiber.parent?.sibling
}

requestIdleCallback(workLoop)

const React = {
  render,
  createElement
}

export default React
