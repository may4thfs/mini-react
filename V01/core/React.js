// v2 react -> vdom(js obj) -> real dom
// vdom 的概念；用 js 对象描述一个节点：{type, props, children}
// 实现：这里利用(createTextNode / createElement)函数动态创建虚拟 dom，然后通过 render 函数将虚拟 dom 渲染成真实 dom

function createTextNode(text) {
	return {
		type: "TEXT_ELEMENT",
		props: {
			nodeValue: text,
			children: []
		}
	}
}

function createElement(type, props, ...children) {
	return {
		type,
		props: {
			...props,
			// * 这里需要判断 children 是否是对象，如果是对象就直接添加到 children 数组中，否则创建一个文本节点
			children: children.map((child) => (typeof child === "object" ? child : createTextNode(child)))
		}
	}
}

// 分析这两段原生代码的步骤：1. 它们都是创建一个节点 2. 通过 props 属性来描述节点的属性 3. 将自己 append 被添加到父节点下
// const dom = document.createElement(App.type)
// dom.id = App.props.id
// document.querySelector("#root").append(dom)

// const textNode = document.createTextNode("")
// textNode.nodeValue = textEl.props.nodeValue
// dom.append(textNode)

// 根据分析，将上面的代码封装成一个 render 函数

/**
 * render 函数实现了一个简单的虚拟 DOM 渲染机制，可以将一个虚拟 DOM 对象渲染到真实的 DOM 树中。
 * @param {*} el 虚拟 DOM 对象
 * @param {*} container 真实的 DOM 节点
 */
function render(el, container) {
	// 1. 创建节点
	const dom =
		el.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(el.type)

	// 2. 设置属性，比如 id, class, style 等
	Object.keys(el.props).forEach((key) => {
		// 这里需要排除 children 属性，因为 children 是一个数组，需要单独处理
		if (key !== "children") {
			dom[key] = el.props[key]
		}
	})

	// 递归渲染子节点
	// children 可能有多个，所以需要遍历
	const children = el.props.children || []
	children.forEach((child) => {
		render(child, dom)
	})

	// 3. 添加到父节点
	container.append(dom)
}

const React = {
	render,
	createElement
}

export default React
