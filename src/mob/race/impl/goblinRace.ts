import AttributeBuilder from "../../../attributes/attributeBuilder"
import {newStats} from "../../../attributes/factory"
import {SkillType} from "../../../skill/skillType"
import {Vulnerability} from "../../enum/vulnerability"
import {createDamageModifier} from "../../fight/damageModifier"
import {DamageType} from "../../fight/enum/damageType"
import {SpecializationType} from "../../specialization/enum/specializationType"
import {Appetite} from "../enum/appetite"
import {BodyPart, standardPackage} from "../enum/bodyParts"
import {Eyesight} from "../enum/eyesight"
import {RaceType} from "../enum/raceType"
import {Size} from "../enum/size"
import Race from "../race"
import RaceBuilder from "../raceBuilder"

export default function(): Race {
  return new RaceBuilder(RaceType.Goblin)
    .setSize(Size.S)
    .setAppetite(Appetite.Small)
    .setSight(Eyesight.VeryGood)
    .setBodyParts([...standardPackage, BodyPart.Fangs, BodyPart.LongTongue])
    .setDamageAbsorption([
      createDamageModifier(DamageType.Poison, Vulnerability.Invulnerable),
      createDamageModifier(DamageType.Mental, Vulnerability.Vulnerable),
      createDamageModifier(DamageType.Magic, Vulnerability.Vulnerable)])
    .setPreferredSpecializations([
      SpecializationType.Ranger,
    ])
    .setAttributes(
      new AttributeBuilder()
        .setStats(newStats(1, -1, -2, 0, 1, 1))
        .build())
    .setStartingSkills([
      SkillType.Bite,
      SkillType.Sneak,
    ])
    .create()
}
