const el = document.createElement("div")
el.innerText = "haha"
document.body.append(el)

/**
 * 问题：dom 树特别大的时候，会导致渲染卡顿
 * 原因：
 *  - 以本文件代码为例，当循环量较大时，会导致页面卡顿。这是因为 JS 是单线程的，它在执行这段逻辑的时候，会阻塞页面的渲染。
 *  - 再回到之前 React.js 中写的 render 函数中，也会有类似的问题。它内部会递归地遍历虚拟 dom 树，然后生成真实 dom 树。因此，当虚拟 dom 树较大时，会导致页面卡顿。
 * 解决：
 *  - 之前是将整颗 dom 树一次性渲染到页面上，这样会导致页面卡顿。现在可以将 dom 树分割成多个小部分（比如每部分任务只去渲染两个 dom），然后分批渲染到页面上，这样就不会导致页面卡顿了。
 *  - 具体实现：将任务分割成多个小任务，然后通过 requestIdleCallback 函数去执行这些小任务。
 */
let i = 0
while (i < 10000) {
  i++
}
