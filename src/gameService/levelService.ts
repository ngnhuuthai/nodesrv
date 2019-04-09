import Attributes from "../attributes/model/attributes"
import {MAX_MOB_LEVEL} from "../mob/constants"
import Gain from "../mob/gain"
import {Mob} from "../mob/model/mob"
import {RaceType} from "../mob/race/enum/raceType"
import {Specialization} from "../mob/specialization/specialization"
import {getRandomIntFromRange, percentRoll} from "../support/random/helpers"

export default class LevelService {
  private static getGainFromStat(value: number): number {
    switch (value) {
      case 18:
        return 1
      case 20:
        return 2
      case 22:
        return 3
      case 24:
        return 4
      case 25:
        return 5
      default:
        return 0
    }
  }

  private static calculateHpGainFromCon(attributes: Attributes, specialization: Specialization): number {
    return ((3 * LevelService.getGainFromStat(attributes.stats.con)) +
      getRandomIntFromRange(...specialization.getHpGainRange())) / 3
  }

  private static calculateHpGainFromStr(attributes: Attributes, specialization: Specialization): number {
    return ((3 * LevelService.getGainFromStat(attributes.stats.str)) +
      getRandomIntFromRange(...specialization.getHpGainRange())) / 4
  }

  constructor(private readonly mob: Mob) {}

  public calculateHpGain() {
    const attributes = this.mob.attribute().combine()
    const specialization = this.mob.specialization()
    return LevelService.calculateHpGainFromCon(attributes, specialization) +
      LevelService.calculateHpGainFromStr(attributes, specialization) +
      this.mob.race().size - 2
  }

  public calculateManaGain() {
    const attributes = this.mob.attribute().combine()
    const race = this.mob.raceType
    let amount = (attributes.stats.int * 0.2) * (1 + (percentRoll() / 100) + (percentRoll() / 100))
      + (attributes.stats.wis * 0.1) * (1 + percentRoll() / 100)

    if (race === RaceType.Elf || race === RaceType.Halfling) {
      amount *= 1.1
    }

    if (race === RaceType.Faerie) {
      amount *= 1.25
    }

    amount *= this.mob.specialization().getManaGainModifier()

    return amount
  }

  public calculateMvGain() {
    return 3 +
      LevelService.getGainFromStat(this.mob.attribute().getDex()) +
      (this.mob.raceType === RaceType.Giant ? -1 : 0)
  }

  public calculatePracticeGain(): number {
    return this.mob.attribute().getWis() / 5
  }

  public canMobLevel(): boolean {
    return this.mob.playerMob && this.mob.playerMob.experienceToLevel <= 0
      && this.mob.level < MAX_MOB_LEVEL
  }

  public gainLevel(): Gain {
    const gain = new Gain(
      this.mob.level + 1,
      this.calculateHpGain(),
      this.calculateManaGain(),
      this.calculateMvGain(),
      this.calculatePracticeGain())
    this.mob.attributes.push(gain.createAttributes())
    this.mob.playerMob.experienceToLevel =
      this.mob.playerMob.experiencePerLevel + this.mob.playerMob.experienceToLevel
    this.mob.level = gain.newLevel
    this.mob.playerMob.practices += gain.practices
    this.mob.playerMob.trains++

    return gain
  }
}
