import AttributeBuilder from "../../../attributes/attributeBuilder"
import {newStats} from "../../../attributes/factory"
import {DamageType} from "../../../damage/damageType"
import {SkillType} from "../../../skill/skillType"
import DamageModifier from "../../damageModifier"
import {Vulnerability} from "../../enum/vulnerability"
import {SpecializationType} from "../../specialization/specializationType"
import {Appetite} from "../enum/appetite"
import {Eyesight} from "../enum/eyesight"
import {RaceType} from "../enum/raceType"
import {Size} from "../enum/size"
import Race from "../race"
import RaceBuilder from "../raceBuilder"

export default function(): Race {
  return new RaceBuilder(RaceType.Faerie)
    .setSize(Size.XS)
    .setAppetite(Appetite.Tiny)
    .setSight(Eyesight.Excellent)
    .setDamageAbsorption([
      new DamageModifier(DamageType.Magic, Vulnerability.StrongResist),
      new DamageModifier(DamageType.Bash, Vulnerability.VeryVulnerable)])
    .setPreferredSpecializations([
      SpecializationType.Mage,
      SpecializationType.Cleric,
    ])
    .setAttributes(
      new AttributeBuilder()
        .setStats(newStats(-2, 2, 2, 1, -2, -1))
        .build())
    .setStartingSkills([
      SkillType.Meditation,
      SkillType.Infravision,
    ])
    .create()
}
