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

      children: children.map((child) => {
        const isTextNode =
          typeof child === "string" || typeof child === "number"
        return isTextNode ? createTextNode(child) : child
      })
    }
  }
}

/**
 * render 函数实现了一个简单的虚拟 DOM 渲染机制，可以将一个虚拟 DOM 对象（转成真实节点）渲染到真实的 DOM 树中。
 * @param {*} el 虚拟 DOM 对象
 * @param {*} container 真实的 DOM 节点
 */
function render(el, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [el]
    }
  }

  nextWorkOfUnit = wipRoot
}

// work in progress
// 正在工作中的根节点（在 render 函数中进行了赋值，然后一直在 workLoop 函数中进行构建）
let wipRoot = null
// 当前应用的根节点
let currentRoot = null
// 当前（或者说是上一次渲染完成后的）虚拟DOM（vDOM）树的根节点。
let nextWorkOfUnit = null
function workLoop(deadline) {
  let shouldYield = false
  // 任务分割：如果当前帧剩余时间小于 1ms 或者当前任务没有值，则跳出循环，让出主线程
  while (!shouldYield && nextWorkOfUnit) {
    // 执行当前任务单元后返回下一个任务单元
    nextWorkOfUnit = performanceWorkUnit(nextWorkOfUnit)

    shouldYield = deadline.timeRemaining() < 1
  }

  // 计算结束（没有任务单元，并且整个应用的根节点存在）将所有的 dom 添加到整个应用的根节点上
  // * 添加到视图上的行为，应该只执行一次，所以这里需要判断 wipRoot 是否存在
  if (!nextWorkOfUnit && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

/** 封装函数 commitRoot，commitWork */
/**
 * 将所有的 dom 添加到整个应用的根节点上
 */
function commitRoot() {
  commitWork(wipRoot.child)
  // 在 dom 全部添加完毕之后记录下来。以便在下一次更新时，可以比较新旧 root 的差异
  currentRoot = wipRoot
  // 当 dom 添加到整个应用的根节点上后，将 root 重置
  wipRoot = null
}

/**
 * 递归遍历 Fiber 树，将每个 Fiber 节点对应的真实 DOM 节点添加到其父节点上，从而将整个 Fiber 树渲染到真实的 DOM 树中。
 * * 它是 React 渲染机制的核心部分，负责将虚拟 DOM 渲染到真实 DOM 中。
 * * 在 commitWork 函数中，我们首先处理当前的 fiber 节点，然后递归地处理其子节点（fiber.child），然后处理其兄弟节点（fiber.sibling）。这就是深度优先遍历的过程。
 * @param {*} fiber
 * @returns
 */
function commitWork(fiber) {
  if (!fiber) return

  // 找到当前 fiber 节点的父节点，并确保父节点有一个对应的 DOM 元素。如果父节点没有对应的 DOM 元素，那么就继续向上查找，直到找到一个有 DOM 元素的父节点。
  let fiberParent = fiber.parent
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent
  }

  if (fiber.effectTag === "UPDATE") {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props)
  } else if (fiber.effectTag === "PLACEMENT") {
    // 将当前 fiber 节点的 DOM 元素添加到其父节点的 DOM 元素上
    if (fiber.dom) {
      fiberParent.dom.append(fiber.dom)
    }
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

/** 封装函数createDom，updateProps，reconcileChildren */

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
 * @param {*} nextProps 新节点属性
 * @param {*} prevProps 旧节点属性
 */
function updateProps(dom, nextProps, prevProps) {
  // Object.keys(props).forEach((key) => {
  //   if (key !== "children") {
  //     if (key.startsWith("on")) {
  //       // 处理：删除前两个字符，将剩余的字符串转换为小写 onClick -> click
  //       const eventType = key.slice(2).toLowerCase()
  //       // 添加事件监听
  //       dom.addEventListener(eventType, props[key])
  //     } else {
  //       dom[key] = props[key]
  //     }
  //   }
  // })
  // 比如老的有id，新的没有id，需要删除 {id: 1} {id: undefined}
  // 1. old 有，new 没有，需要删除
  // 遍历老的属性，如果它在新的属性中没有，就需要删除
  Object.keys(prevProps).forEach((key) => {
    if (key !== "children") {
      if (!(key in nextProps)) {
        dom.removeAttribute(key)
      }
    }
  })

  // 2. new 有，old 没有，需要添加
  // 3. new 有，old 有，但是值不同，需要更新
  // 2和3可以合并，因为没有就是 undefined，它和 new[key] 也是不相等
  Object.keys(nextProps).forEach((key) => {
    if (key !== "children") {
      // 如果新旧属性值不同，就更新
      if (nextProps[key] !== prevProps[key]) {
        if (key.startsWith("on")) {
          const eventType = key.slice(2).toLowerCase()
          // 移除之前的事件监听，添加新的事件监听
          dom.removeEventListener(eventType, prevProps[key])
          dom.addEventListener(eventType, nextProps[key])
        } else {
          dom[key] = nextProps[key]
        }
      }
    }
  })
}

/**
 * 构建一个虚拟 DOM 树的链表结构。
 * * 这个结构可以帮助我们在后续的渲染和更新过程中，更方便地遍历和操作虚拟 DOM 树。
 * * fiber 对象是一个链表结构，包含了当前节点的所有信息。特别是 parent，child，sibling 这三个指针，用来构建节点之间的关系
 * * reconcile 使一致，协调，调和
 * @param {*} fiber 当前节点
 * @param {Array} children 当前节点的全部子节点
 */
function reconcileChildren(fiber, children) {
  // 注意：初始化的时候，fiber.alternate 是没有值的，所以使用可选链操作符
  let oldFiber = fiber.alternate?.child

  let prevChild = null // 记录上一个子节点
  children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type

    let newFiber

    // 如果是同一类型，那么 React 就会复用旧的节点（fiber），并更新属性。如果不是同一类型，那么 React 就会销毁旧的节点，并创建一个新的节点。
    if (isSameType) {
      // update 更新
      newFiber = {
        type: child.type,
        props: child.props,
        child: null, // 存储第一个子节点
        parent: fiber,
        sibling: null,
        dom: oldFiber.dom, // 复用旧的 DOM 节点（更新是不会新创建 DOM 节点的）
        effectTag: "UPDATE", // 标记节点的操作类型
        alternate: oldFiber // 将旧的 fiber 节点存储起来
      }
    } else {
      // add 创建
      newFiber = {
        type: child.type,
        props: child.props,
        child: null, // 存储第一个子节点
        parent: fiber,
        sibling: null,
        dom: null, // 存储与 fiber 对应的真实 DOM 节点
        effectTag: "PLACEMENT" // 标记节点的操作类型
      }
    }

    // 在 Fiber 树的同一层级中移动到下一个节点
    if (oldFiber) {
      oldFiber = oldFiber.sibling
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

/** 封装函数 updateFunctionComponent， updateHostComponent*/

/**
 * 处理函数组件
 * @param {*} fiber
 */
function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)]

  // 转换成链表
  reconcileChildren(fiber, children)
}

/**
 * 处理普通节点
 * @param {*} fiber
 */
function updateHostComponent(fiber) {
  // 在首次渲染阶段，创建一个新的 DOM 节点，除了根节点，其他节点都是在这里创建的。
  // 在更新阶段，dom 节点已经存在。我们只需要更新节点的属性，不需要创建新的节点。
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type))

    updateProps(dom, fiber.props, {})
  }

  // 转换成链表
  const children = fiber.props.children
  reconcileChildren(fiber, children)
}

/**
 * 执行任务单元
 * * 一个任务单元就是一个 fiber 对象，它包含了当前节点的所有信息，包括节点的类型、属性、子节点等。
 * @param {*} fiber 当前任务单元
 * @returns 返回下一个要执行的任务
 */
function performanceWorkUnit(fiber) {
  // 1. 根据当前任务单元的类型，执行不同的操作
  const isFunctionComponent = typeof fiber.type === "function"

  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  // 2. 返回下一个要执行的任务
  // 优先级：child -> sibling -> parent.sibling（父节点的兄弟节点）
  if (fiber.child) {
    return fiber.child
  }

  // 检查是否有兄弟节点，如果没有，就继续向上查找父节点的兄弟节点
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling
    nextFiber = nextFiber.parent
  }
}

requestIdleCallback(workLoop)

/**
 * 用于更新组件的状态
 * * 在 React 中，更新组件的状态是通过调用 setState 方法来实现的。在这里，我们暂时简化了这个过程，直接调用 update 方法来更新组件的状态。
 */
function update() {
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot
  }

  nextWorkOfUnit = wipRoot
}

const React = {
  update,
  render,
  createElement
}

export default React
