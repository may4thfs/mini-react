import { it, expect, describe } from "vitest"
import React from "../core/React"

describe("createElement", () => {
  // 如果创建的虚拟 DOM 对象与预期的快照完全匹配，那么测试就会通过。如果不匹配，那么 vitest 就会报告一个错误，显示实际的虚拟 DOM 对象和预期的快照之间的差异
  it("should return element vdom and props is null", () => {
    const el = React.createElement("div", null, "hi")

    expect(el).toMatchInlineSnapshot(`
      {
        "props": {
          "children": [
            {
              "props": {
                "children": [],
                "nodeValue": "hi",
              },
              "type": "TEXT_ELEMENT",
            },
          ],
        },
        "type": "div",
      }
    `)
  })

  it("should return element vdom", () => {
    const el = React.createElement("div", { id: "id" }, "hi")

    expect(el).toMatchInlineSnapshot(`
      {
        "props": {
          "children": [
            {
              "props": {
                "children": [],
                "nodeValue": "hi",
              },
              "type": "TEXT_ELEMENT",
            },
          ],
          "id": "id",
        },
        "type": "div",
      }
    `)
  })

  // it("should return vdom for element", () => {
  //   const el = React.createElement("div", null, "hi")

  //   expect(el).toEqual({
  //     type: "div",
  //     props: {
  //       children: [
  //         { type: "TEXT_ELEMENT", props: { nodeValue: "hi", children: [] } }
  //       ]
  //     }
  //   })
  // })
})
