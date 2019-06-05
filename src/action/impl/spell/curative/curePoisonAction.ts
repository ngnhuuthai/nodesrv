import {AffectType} from "../../../../affect/enum/affectType"
import DelayCost from "../../../../check/cost/delayCost"
import ManaCost from "../../../../check/cost/manaCost"
import AbilityService from "../../../../check/service/abilityService"
import {Mob} from "../../../../mob/model/mob"
import {SpecializationType} from "../../../../mob/specialization/enum/specializationType"
import {SpellMessages} from "../../../../spell/constants"
import {SpellType} from "../../../../spell/spellType"
import SpellBuilder from "../../../builder/spellBuilder"
import {ActionType} from "../../../enum/actionType"
import Spell from "../../spell"

export default function(abilityService: AbilityService): Spell {
  return new SpellBuilder(abilityService)
    .setSpellType(SpellType.CurePoison)
    .setActionType(ActionType.Defensive)
    .setCosts([
      new ManaCost(20),
      new DelayCost(1),
    ])
    .setApplySpell(async requestService => {
      const target = requestService.getTarget() as Mob
      target.affect().remove(AffectType.Poison)
    })
    .setSuccessMessage(requestService =>
      requestService.createResponseMessage(SpellMessages.CurePoison.Success)
        .setVerbToRequestCreator("feels")
        .setVerbToTarget("feel")
        .setVerbToObservers("feels")
        .create())
    .setSpecializationType(SpecializationType.Cleric)
    .create()
}
