import AbilityService from "../../../../check/service/abilityService"
import {DamageType} from "../../../../mob/fight/enum/damageType"
import {SpecializationType} from "../../../../mob/specialization/enum/specializationType"
import {SpellType} from "../../../../mob/spell/spellType"
import roll from "../../../../support/random/dice"
import Spell from "../../spell"
import attackAction from "./attackAction"

export default function(abilityService: AbilityService): Spell {
  return attackAction(
    abilityService,
    SpellType.LightningBolt,
    DamageType.Electric,
    (_, specializationType) =>
      roll(2, 6 + (specializationType === SpecializationType.Mage ? 2 : 0)),
    "bolt of lightning")
}
