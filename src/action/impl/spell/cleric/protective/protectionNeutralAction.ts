import {AffectType} from "../../../../../affect/affectType"
import AbilityService from "../../../../../check/abilityService"
import {CheckType} from "../../../../../check/checkType"
import DelayCost from "../../../../../check/cost/delayCost"
import ManaCost from "../../../../../check/cost/manaCost"
import ResponseMessage from "../../../../../request/responseMessage"
import {SpellMessages} from "../../../../../spell/constants"
import {SpellType} from "../../../../../spell/spellType"
import {ActionType} from "../../../../enum/actionType"
import Spell from "../../../../spell"
import AffectSpellBuilder from "../../affectSpellBuilder"

export default function(abilityService: AbilityService): Spell {
  return new AffectSpellBuilder(abilityService)
    .setSpellType(SpellType.ProtectionNeutral)
    .setAffectType(AffectType.ProtectionNeutral)
    .setActionType(ActionType.Defensive)
    .setCosts([
      new ManaCost(10),
      new DelayCost(1),
    ])
    .setSuccessMessage(checkedRequest => {
      const target = checkedRequest.getCheckTypeResult(CheckType.HasTarget)
      return new ResponseMessage(
        checkedRequest.mob,
        SpellMessages.ProtectionNeutral.Success,
        {
          target: target === checkedRequest.mob ? "you" : target,
          verb: target === checkedRequest.mob ? "are" : "is",
        },
        { target: "you", verb: "are" },
        { target, verb: "is" })
    })
    .setCreateAffect((checkedRequest, affectBuilder) => affectBuilder
      .setTimeout(checkedRequest.mob.level / 8)
      .build())
    .create()
}
