import match from "../support/matcher/match"
import { Inventory } from "./model/inventory"
import { Item } from "./model/item"

export default class ItemTable {
  constructor(public items: Item[]) {}

  public findByInventory(inventory: Inventory): Item[] {
    return this.items.filter(i => i.inventory.id === inventory.id)
  }

  public findItemByInventory(inventory: Inventory, name: string): Item {
    return this.items.find(i => i.inventory.id === inventory.id && match(i.name, name))
  }

  public add(item: Item) {
    this.items.push(item)
  }

  public remove(item: Item) {
    const i = this.items.indexOf(item)
    this.items.splice(i, 1)
  }
}
