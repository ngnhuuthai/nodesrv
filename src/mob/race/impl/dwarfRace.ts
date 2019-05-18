import AttributeBuilder from "../../../attributes/attributeBuilder"
import {newStats} from "../../../attributes/factory"
import {SkillType} from "../../../skill/skillType"
import {Vulnerability} from "../../enum/vulnerability"
import {createDamageModifier} from "../../fight/damageModifier"
import {DamageType} from "../../fight/enum/damageType"
import {SpecializationType} from "../../specialization/enum/specializationType"
import {Appetite} from "../enum/appetite"
import {Eyesight} from "../enum/eyesight"
import {RaceType} from "../enum/raceType"
import {Size} from "../enum/size"
import Race from "../race"
import RaceBuilder from "../raceBuilder"

export default function(): Race {
  return new RaceBuilder(RaceType.Dwarf)
    .setSize(Size.S)
    .setAppetite(Appetite.Large)
    .setSight(Eyesight.Good)
    .setDamageAbsorption([
      createDamageModifier(DamageType.Mental, Vulnerability.Vulnerable),
      createDamageModifier(DamageType.Poison, Vulnerability.Resist),
      createDamageModifier(DamageType.Bash, Vulnerability.Resist)])
    .setPreferredSpecializations([
      SpecializationType.Warrior,
      SpecializationType.Cleric,
    ])
    .setAttributes(
      new AttributeBuilder()
        .setStats(newStats(2, -2, 1, -1, 1, 0))
        .build())
    .setStartingSkills([
      SkillType.Axe,
      SkillType.Berserk,
    ])
    .setCreationPoints(6)
    .create()
}
