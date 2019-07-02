import AffectBuilder from "../affect/builder/affectBuilder"
import {AffectType} from "../affect/enum/affectType"
import {ItemEntity} from "../item/entity/itemEntity"
import {Equipment} from "../item/enum/equipment"
import {createBuilderDefinition} from "../item/factory/itemFactory"
import any from "./builder/any"
import armor from "./builder/armor"
import container from "./builder/container"
import drink from "./builder/drink"
import food from "./builder/food"
import forge from "./builder/forge"
import fountain from "./builder/fountain"
import furniture from "./builder/furniture"
import light from "./builder/light"
import staff from "./builder/staff"
import wand from "./builder/wand"
import weapon from "./builder/weapon"
import BuilderDefinition from "./builderDefinition"
import {ItemType as ImportItemType} from "./enum/itemType"
import {itemAffectMap} from "./map/itemAffectMap"

export default class ItemBuilder {
  public static new(): ItemBuilder {
    return new ItemBuilder([
      // weapons
      createBuilderDefinition(ImportItemType.Weapon, weapon),
      createBuilderDefinition(ImportItemType.Wand, wand),
      createBuilderDefinition(ImportItemType.Staff, staff),

      // equipment
      createBuilderDefinition(ImportItemType.Armor, armor),
      createBuilderDefinition(ImportItemType.Clothing, armor),
      createBuilderDefinition(ImportItemType.Light, light),
      createBuilderDefinition(ImportItemType.Container, container),

      // consumables
      createBuilderDefinition(ImportItemType.Drink, drink),
      createBuilderDefinition(ImportItemType.Food, food),
      createBuilderDefinition(ImportItemType.Fountain, fountain),

      // fixtures
      createBuilderDefinition(ImportItemType.Forge, forge),
      createBuilderDefinition(ImportItemType.Furniture, furniture),
    ])
  }

  public static applyPoisonIfFlagged(item: ItemEntity, flag: string) {
    if (flag !== "0") {
      item.affects.push(new AffectBuilder(AffectType.Poison).build())
    }

    return item
  }

  private static setItemAffects(item: ItemEntity, flags: string[]) {
    for (const flag of flags) {
      // @ts-ignore
      const f = itemAffectMap[flag]
      if (f) {
        item.affects.push(new AffectBuilder(f).build())
      }
    }

    return item
  }

  private static getEquipmentFromWearFlag(flag: string): Equipment | undefined {
    let realFlag = ""
    if (flag.length === 1) {
      realFlag = flag
    }
    if (flag.length > 1) {
      realFlag = flag.substring(1, 2)
    }
    switch (realFlag) {
      case "B":
        return Equipment.Finger
      case "C":
        return Equipment.Neck
      case "D":
        return Equipment.Torso
      case "E":
        return Equipment.Head
      case "F":
        return Equipment.Legs
      case "G":
        return Equipment.Feet
      case "H":
        return Equipment.Hands
      case "I":
        return Equipment.Arms
      case "J":
        return Equipment.Shield
      case "K":
        return Equipment.About
      case "L":
        return Equipment.Waist
      case "M":
        return Equipment.Wrist
      case "N":
        return Equipment.Weapon
      case "O":
        return Equipment.Hold
      case "P":
        return
      case "Q":
        return Equipment.Float
      case "R":
        return Equipment.Dragging
      default:
        return
    }
  }

  private static addPropertiesToItem(item: ItemEntity, itemData: any) {
    item.level = itemData.level
    item.value = itemData.cost
    item.weight = itemData.weight
    item.material = itemData.material
    item.canonicalId = itemData.id
    item.brief = itemData.brief

    if (itemData.wearFlag) {
      const eq = ItemBuilder.getEquipmentFromWearFlag(itemData.wearFlag)
      if (eq) {
        item.equipment = eq
      }
    }

    if (itemData.extraFlag && itemData.extraFlag !== "0") {
      ItemBuilder.setItemAffects(item, itemData.extraFlag.split(""))
    }
    if (item.name === "pit") {
      item.isTransferable = false
    }

    return item
  }

  private static splitPObjFlags(flags: string) {
    let buf = ""
    const length = flags.length
    let cursor = 0
    const values = []
    let quoting = false
    while (cursor < length) {
      if (flags[cursor] === "'") {
        quoting = !quoting
      } else if (flags[cursor] === " " && !quoting) {
        values.push(buf)
        buf = ""
      } else {
        buf += flags[cursor]
      }

      cursor++
    }
    if (buf) {
      values.push(buf)
    }
    return values
  }

  constructor(private readonly builders: BuilderDefinition[] = []) {}

  public async createItemFromImportData(itemData: any): Promise<ItemEntity> {
    const args = itemData.pObjFlags ? ItemBuilder.splitPObjFlags(itemData.pObjFlags) : []
    const { name, description, type, extraFlag } = itemData
    const prototype = { type, name, description, extraFlag, args }
    const builder = this.builders.find(b => b.itemType === type)
    const flags = args[1] !== undefined ? args[1].split("") : []
    if (builder) {
      return ItemBuilder.setItemAffects(
        ItemBuilder.addPropertiesToItem(builder.itemFactory(prototype), itemData), flags)
    }
    return ItemBuilder.setItemAffects(ItemBuilder.addPropertiesToItem(any(prototype), itemData), flags)
  }
}
