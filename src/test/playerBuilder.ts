import {newItem} from "../item/factory"
import {ItemType} from "../item/itemType"
import Container from "../item/model/container"
import {Item} from "../item/model/item"
import {Mob} from "../mob/model/mob"
import {AuthorizationLevel} from "../player/authorizationLevel"
import {Player} from "../player/model/player"
import {newSkill} from "../skill/factory"
import {SkillType} from "../skill/skillType"
import {newSpell} from "../spell/factory"
import {SpellType} from "../spell/spellType"

export default class PlayerBuilder {
  constructor(public readonly player: Player) {}

  public withKey(canonicalId: string): Item {
    const item = newItem(ItemType.Key, "a key", "a key")
    item.canonicalId = canonicalId
    this.player.sessionMob.inventory.addItem(item)
    return item
  }

  public withContainer(): Item {
    const item = newItem(ItemType.Container, "a small leather satchel", "description")
    item.container = new Container()
    this.player.sessionMob.inventory.addItem(item)
    return item
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
    this.player.sessionMob.vitals.hp = amount
    return this
  }

  public getMob(): Mob {
    return this.player.sessionMob
  }
}
