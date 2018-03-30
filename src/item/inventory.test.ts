import { Inventory } from "./model/inventory"
import { Item } from "./model/item"

describe("inventory model", () => {
  it("should be able to find an item", () => {
    const inventory = new Inventory()
    const item1 = new Item()
    item1.name = "foo"
    const item2 = new Item()
    item2.name = "bar"
    inventory.addItem(item1)
    inventory.addItem(item2)

    expect(inventory.find((item) => item.matches("foo"))).toBe(item1)
    expect(inventory.find((item) => item.matches("bar"))).toBe(item2)
    expect(inventory.find((item) => item.matches("baz"))).toBeUndefined()
  })
})