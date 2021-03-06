import {BASE_KILL_EXPERIENCE} from "../constants"
import {MobEntity} from "../entity/mobEntity"
import {SkillType} from "../skill/skillType"
import Death from "./death"
import {AttackResult} from "./enum/attackResult"

export function getSuppressionAttackResultFromSkillType(skill: SkillType): AttackResult {
  if (skill === SkillType.Dodge) {
    return AttackResult.Dodge
  }

  if (skill === SkillType.Parry) {
    return AttackResult.Parry
  }

  if (skill === SkillType.ShieldBlock) {
    return AttackResult.ShieldBlock
  }

  return AttackResult.Miss
}

export function modifierNormalizer(modifier: number) {
  if (modifier < 0) {
    return 1 / (Math.abs(modifier) + 1)
  }

  if (modifier > 10) {
    return 10 + (modifier / 10)
  }

  if (modifier === 0) {
    return 1
  }

  return modifier
}

export class Attack {
  public readonly isDefenderAlive: boolean
  public readonly experience: number = 0

  constructor(
    public readonly attacker: MobEntity,
    public readonly defender: MobEntity,
    public readonly result: AttackResult,
    public readonly damage: number,
    public readonly death?: Death) {
    this.isDefenderAlive = defender.hp >= 0
    if (this.death) {
      this.experience = this.getExperienceFromKilling()
    }
  }

  private getExperienceFromKilling() {
    const levelDelta = this.defender.level - this.attacker.level
    return BASE_KILL_EXPERIENCE * modifierNormalizer(levelDelta)
  }
}
