import {AffectType} from "../../../../affect/affectType"
import AbilityService from "../../../../check/abilityService"
import DelayCost from "../../../../check/cost/delayCost"
import ManaCost from "../../../../check/cost/manaCost"
import ResponseMessageBuilder from "../../../../request/responseMessageBuilder"
import {SpellMessages} from "../../../../spell/constants"
import {SpellType} from "../../../../spell/spellType"
import {ActionType} from "../../../enum/actionType"
import SpellBuilder from "../../../spellBuilder"
import Spell from "../../spell"

export default function(abilityService: AbilityService): Spell {
  return new SpellBuilder(abilityService)
    .setSpellType(SpellType.WithstandDeath)
    .setAffectType(AffectType.WithstandDeath)
    .setActionType(ActionType.Defensive)
    .setCosts([ new ManaCost(80), new DelayCost(2) ])
    .setApplySpell(async (checkedRequest, affectBuilder) => affectBuilder
      .setTimeout(checkedRequest.mob.level / 8)
      .build())
    .setSuccessMessage(checkedRequest => new ResponseMessageBuilder(
      checkedRequest.mob,
      SpellMessages.WithstandDeath.Success,
      checkedRequest.getTarget())
      .setVerbToRequestCreator("feels")
      .setVerbToTarget("feel")
      .setVerbToObservers("feels")
      .create())
    .create()
}