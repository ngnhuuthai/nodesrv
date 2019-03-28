import AbilityService from "../../../../check/abilityService"
import {CheckType} from "../../../../check/checkType"
import DelayCost from "../../../../check/cost/delayCost"
import ManaCost from "../../../../check/cost/manaCost"
import roll from "../../../../random/dice"
import ResponseMessageBuilder from "../../../../request/responseMessageBuilder"
import {SpellMessages} from "../../../../spell/constants"
import {SpellType} from "../../../../spell/spellType"
import {ActionType} from "../../../enum/actionType"
import SpellBuilder from "../../../spellBuilder"
import Spell from "../../spell"

export default function(abilityService: AbilityService): Spell {
  return new SpellBuilder(abilityService)
    .setSpellType(SpellType.CureSerious)
    .setActionType(ActionType.Defensive)
    .setCosts([
      new ManaCost(15),
      new DelayCost(1),
    ])
    .setSuccessMessage(checkedRequest => new ResponseMessageBuilder(
      checkedRequest.mob,
      SpellMessages.CureSerious.Success,
      checkedRequest.getCheckTypeResult(CheckType.HasTarget))
      .setVerbToRequestCreator("feels")
      .setVerbToTarget("feel")
      .setVerbToObservers("feels")
      .create())
    .setApplySpell(async checkedRequest => {
      const target = checkedRequest.getCheckTypeResult(CheckType.HasTarget)
      target.vitals.hp += roll(2, 8)
    })
    .create()
}