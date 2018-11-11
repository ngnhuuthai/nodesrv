import { Column, Entity, Generated, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import * as v4 from "uuid"
import { AffectType } from "../../affect/affectType"
import { applyAffectModifier } from "../../affect/applyAffect"
import { Affect } from "../../affect/model/affect"
import { newAttributes, newEmptyAttributes, newHitroll, newStats, newVitals } from "../../attributes/factory"
import { default as Attributes } from "../../attributes/model/attributes"
import Vitals from "../../attributes/model/vitals"
import { Equipped } from "../../item/model/equipped"
import { Inventory } from "../../item/model/inventory"
import { AuthorizationLevel } from "../../player/authorizationLevel"
import { Player } from "../../player/model/player"
import roll from "../../random/dice"
import { Room } from "../../room/model/room"
import { BaseRegenModifier } from "../../server/observers/constants"
import { Skill } from "../../skill/model/skill"
import { SkillType } from "../../skill/skillType"
import { Spell } from "../../spell/model/spell"
import { BASE_KILL_EXPERIENCE } from "../constants"
import { Disposition } from "../disposition"
import { newMob } from "../factory"
import { Gender } from "../gender"
import modifierNormalizer from "../multiplierNormalizer"
import { modifiers } from "../race/constants"
import { Race } from "../race/race"
import { Role } from "../role"
import { SpecializationType } from "../specialization/specializationType"
import { Standing } from "../standing"
import { Trigger } from "../trigger"
import { PlayerMob } from "./playerMob"
import Reset from "./reset"

@Entity()
export class Mob {
  @PrimaryGeneratedColumn()
  public id: number

  @Column("text")
  @Generated("uuid")
  public uuid: string = v4()

  @Column("text")
  public name: string

  @Column("text", { nullable: true })
  public description: string

  public shortDescription
  @Column("text", { nullable: true })

  @Column("text")
  public race: Race

  @Column("text", { nullable: true })
  public specialization: SpecializationType

  @Column("integer")
  public level: number = 1

  @Column("boolean", { default: false })
  public wanders: boolean = false

  @Column("boolean", { default: false })
  public isPlayer: boolean = false

  @Column("integer", { default: 0 })
  public gold: number = 0

  @Column("text", { default: Gender.Unspecified })
  public gender: Gender = Gender.Unspecified

  @Column("text", { nullable: true })
  public disposition = Disposition.Standing

  @Column("integer", { default: Role.None })
  public role: Role = Role.None

  @OneToMany((type) => Affect, (affect) => affect.mob, { cascadeInsert: true, eager: true })
  public affects: Affect[] = []

  @OneToOne((type) => Vitals, { cascadeInsert: true, eager: true })
  @JoinColumn()
  public vitals: Vitals = new Vitals()

  @OneToMany(
    (type) => Attributes, (attributes) => attributes.mob, { cascadeInsert: true, cascadeUpdate: true, eager: true })
  public attributes: Attributes[] = []

  @ManyToOne((type) => Room, (room) => room.mobs)
  public room: Room

  @ManyToOne((type) => Player, (player) => player.mobs)
  public player: Player

  @OneToOne((type) => Inventory, { cascadeInsert: true, eager: true })
  @JoinColumn()
  public inventory = new Inventory()

  @OneToOne((type) => Equipped, { cascadeInsert: true, cascadeUpdate: true, eager: true })
  @JoinColumn()
  public equipped = new Equipped()

  @OneToMany((type) => Skill, (skill) => skill.mob, { cascadeInsert: true, cascadeUpdate: true, eager: true })
  public skills: Skill[] = []

  @OneToMany((type) => Spell, (spell) => spell.mob, { cascadeInsert: true, cascadeUpdate: true, eager: true })
  public spells: Spell[] = []

  @OneToOne((type) => PlayerMob,
    (playerMob) => playerMob.mob,
    { nullable: true, cascadeInsert: true, cascadeUpdate: true })
  public playerMob: PlayerMob

  @OneToOne(type => Reset, { eager: true })
  @JoinColumn()
  public reset: Reset = new Reset()

  public getAuthorizationLevel(): AuthorizationLevel {
    return this.playerMob ? this.playerMob.authorizationLevel : AuthorizationLevel.None
  }

  public getStanding(): Standing {
    return this.playerMob ? this.playerMob.standing : Standing.Good
  }

  public getExperienceFromKilling(mob: Mob) {
    const levelDelta = mob.level - this.level
    return BASE_KILL_EXPERIENCE * modifierNormalizer(levelDelta)
  }

  public getCombinedAttributes(): Attributes {
    let attributes = newEmptyAttributes()
    this.attributes.forEach((a) => attributes = attributes.combine(a))
    this.equipped.inventory.items.forEach((i) => attributes = attributes.combine(i.attributes))
    modifiers.forEach((modifier) => attributes = modifier(this.race, attributes))
    if (this.playerMob) {
      attributes.combine(this.playerMob.trainedAttributes)
    }

    return attributes
  }

  public addAffect(affect: Affect) {
    const current = this.getAffect(affect.affectType)
    if (!current) {
      this.affects.push(affect)
      affect.mob = this
    }
  }

  public getAffect(affectType: AffectType) {
    return this.affects.find((a) => a.affectType === affectType)
  }

  public isMerchant(): boolean {
    return !this.isPlayer && this.role === Role.Merchant
  }

  // @todo fully implement
  public copy(): Mob {
    const mob = newMob(
      this.name,
      this.description,
      this.race,
      newVitals(this.vitals.hp, this.vitals.mana, this.vitals.mv),
      newAttributes(
        newVitals(this.vitals.hp, this.vitals.mana, this.vitals.mv),
        newStats(0, 0, 0, 0, 0, 0),
        newHitroll(0, 0),
      ),
      this.wanders)
    mob.role = this.role
    return mob
  }

  public regen(): void {
    const combined = this.getCombinedAttributes()
    const regenModifier = applyAffectModifier(
      this.affects.map(a => a.affectType),
      Trigger.Tick,
      BaseRegenModifier)
    this.vitals.hp += roll(8, (combined.vitals.hp * regenModifier) / 8)
    this.vitals.mana += roll( 8, (combined.vitals.mana * regenModifier) / 8)
    this.vitals.mv += roll(8, (combined.vitals.mv * regenModifier) / 8)
    if (this.playerMob) {
      this.playerMob.regen()
    }
    this.normalizeVitals()
  }

  public normalizeVitals() {
    const combined = this.getCombinedAttributes()
    if (this.vitals.hp > combined.vitals.hp) {
      this.vitals.hp = combined.vitals.hp
    }
    if (this.vitals.mana > combined.vitals.mana) {
      this.vitals.mana = combined.vitals.mana
    }
    if (this.vitals.mv > combined.vitals.mv) {
      this.vitals.mv = combined.vitals.mv
    }
  }

  public setPlayerMob(playerMob: PlayerMob) {
    this.playerMob = playerMob
    playerMob.mob = this
  }

  public findSkill(skillType: SkillType) {
    return this.skills.find(s => s.skillType === skillType)
  }

  public toString(): string {
    return this.name
  }
}
