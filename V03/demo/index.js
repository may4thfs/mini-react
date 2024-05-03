let taskId = 0
function workloop(deadline) {
  taskId++

  let shouldYield = false
  // 任务分割：如果当前帧剩余时间小于 1ms，则跳出循环，让出主线程
  while (!shouldYield) {
    // run task
    console.log(`taskId:${taskId} run task`)
    // dom

    shouldYield = deadline.timeRemaining() < 1
  }

  requestIdleCallback(workloop)
}

requestIdleCallback(workloop)

// 浏览器 API：requestIdleCallback 在主线程空闲时执行传入的回调函数
// deadline.timeRemaining()：当前闲置周期的剩余时间
