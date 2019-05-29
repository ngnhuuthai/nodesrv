import AttributeBuilder from "../builder/attributeBuilder"
import Attributes from "../model/attributes"

export function newStartingAttributes(hp: number, mana: number, mv: number, level: number = 1): Attributes {
  return new AttributeBuilder()
    .setVitals(hp, mana, mv)
    .setStats(15, 15, 15, 15, 15, 15)
    .setHitRoll(1 + Math.floor(level / 3), 1 + Math.ceil(level / 2))
    .build()
}

export function newEmptyAttributes(): Attributes {
  return new AttributeBuilder()
    .setVitals(0, 0, 0)
    .setStats(0, 0, 0, 0, 0, 0)
    .setHitRoll(0, 0)
    .build()
}
