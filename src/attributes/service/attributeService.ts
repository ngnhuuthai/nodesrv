import {MobEntity} from "../../mob/entity/mobEntity"
import RaceService from "../../mob/race/raceService"
import AttributesEntity from "../entity/attributesEntity"
import {newEmptyAttributes} from "../factory/attributeFactory"

export default class AttributeService {
  constructor(private readonly mob: MobEntity) {}

  public combine(): AttributesEntity {
    let attributes = newEmptyAttributes()
    this.mob.attributes.forEach(a => attributes = attributes.combine(a))
    this.mob.equipped.items.forEach(i => attributes = attributes.combine(i.attributes))
    attributes = RaceService.combineAttributes(this.mob, attributes)
    if (this.mob.playerMob) {
      attributes = attributes.combine(this.mob.playerMob.trainedAttributes)
    }
    this.mob.affects.filter(affect => affect.attributes)
      .forEach(affect => attributes = attributes.combine(affect.attributes))

    return attributes
  }

  public getHp(): number {
    return this.mob.hp
  }

  public getMaxHp(): number {
    return this.combine().hp
  }

  public getMv(): number {
    return this.mob.mv
  }

  public getMaxMv(): number {
    return this.combine().mv
  }

  public addMv(mv: number) {
    this.mob.mv += mv
    this.normalize()
  }

  public getInt(): number {
    return this.combine().int
  }

  public getWis(): number {
    return this.combine().wis
  }

  public getDex(): number {
    return this.combine().dex
  }

  public normalize(): void {
    const combined = this.combine()
    if (this.mob.hp > combined.hp) {
      this.mob.hp = combined.hp
    }
    if (this.mob.mana > combined.mana) {
      this.mob.mana = combined.mana
    }
    if (this.mob.mv > combined.mv) {
      this.mob.mv = combined.mv
    }
  }
}
