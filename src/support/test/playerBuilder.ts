import {inject} from "inversify"
import {ItemEntity} from "../../item/entity/itemEntity"
import {MobEntity} from "../../mob/entity/mobEntity"
import {Standing} from "../../mob/enum/standing"
import {newSkill} from "../../mob/skill/factory"
import {SkillType} from "../../mob/skill/skillType"
import {SpecializationType} from "../../mob/specialization/enum/specializationType"
import SpecializationService from "../../mob/specialization/service/specializationService"
import {newSpell} from "../../mob/spell/factory"
import {SpellType} from "../../mob/spell/spellType"
import {PlayerEntity} from "../../player/entity/playerEntity"
import {AuthorizationLevel} from "../../player/enum/authorizationLevel"
import {Types} from "../types"
import MobBuilder from "./mobBuilder"

export default class PlayerBuilder {
  constructor(
    @inject(Types.SpecializationService) private readonly specializationService: SpecializationService,
    public readonly player: PlayerEntity) {}

  public setSpecializationType(specializationType: SpecializationType): PlayerBuilder {
    this.player.sessionMob.specializationType = specializationType
    return this
  }

  public setTrains(amount: number): PlayerBuilder {
    this.player.sessionMob.playerMob.trains = amount
    return this
  }

  public setPractices(amount: number): PlayerBuilder {
    this.player.sessionMob.playerMob.practices = amount
    return this
  }

  public equip(item: ItemEntity): PlayerBuilder {
    this.player.sessionMob.equipped.addItem(item)
    return this
  }

  public addItem(item: ItemEntity): PlayerBuilder {
    this.player.sessionMob.inventory.addItem(item)
    return this
  }

  public getItems(): ItemEntity[] {
    return this.player.sessionMob.inventory.items
  }

  public addSkill(skillType: SkillType, level: number = 1): PlayerBuilder {
    this.player.sessionMob.skills.push(newSkill(skillType, level))
    return this
  }

  public addSpell(spellType: SpellType, level: number = 1): PlayerBuilder {
    this.player.sessionMob.spells.push(newSpell(spellType, level))
    return this
  }

  public setHunger(hunger: number) {
    this.player.sessionMob.playerMob.hunger = hunger
  }

  public setStanding(standing: Standing): PlayerBuilder {
    this.player.sessionMob.playerMob.standing = standing
    return this
  }

  public setAuthorizationLevel(authorizationLevel: AuthorizationLevel): PlayerBuilder {
    this.player.sessionMob.playerMob.authorizationLevel = authorizationLevel
    return this
  }

  public setLevel(level: number): PlayerBuilder {
    this.player.sessionMob.level = level
    return this
  }

  public setGold(amount: number): PlayerBuilder {
    this.player.sessionMob.gold = amount
    return this
  }

  public setBounty(amount: number): PlayerBuilder {
    this.player.sessionMob.playerMob.bounty = amount
    return this
  }

  public setHp(amount: number): PlayerBuilder {
    this.player.sessionMob.hp = amount
    return this
  }

  public setMv(amount: number): PlayerBuilder {
    this.player.sessionMob.mv = amount
    return this
  }

  public setExperienceToLevel(amount: number): PlayerBuilder {
    this.player.sessionMob.playerMob.experienceToLevel = amount
    return this
  }

  public getExperienceToLevel(): number {
    return this.player.sessionMob.playerMob.experienceToLevel
  }

  public getMobBuilder(): MobBuilder {
    return new MobBuilder(this.specializationService, this.getMob())
  }

  public getMob(): MobEntity {
    return this.player.sessionMob
  }

  public getMobLevel(): number {
    return this.player.sessionMob.level
  }

  public getMobName(): string {
    return this.player.sessionMob.name
  }

  public get(): PlayerEntity {
    return this.player
  }
}
