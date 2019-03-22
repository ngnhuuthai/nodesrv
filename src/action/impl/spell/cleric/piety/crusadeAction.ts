import {AffectType} from "../../../../../affect/affectType"
import AttributeBuilder from "../../../../../attributes/attributeBuilder"
import {newHitroll} from "../../../../../attributes/factory"
import AbilityService from "../../../../../check/abilityService"
import {CheckType} from "../../../../../check/checkType"
import DelayCost from "../../../../../check/cost/delayCost"
import ManaCost from "../../../../../check/cost/manaCost"
import ResponseMessage from "../../../../../request/responseMessage"
import {SpellMessages} from "../../../../../spell/constants"
import {SpellType} from "../../../../../spell/spellType"
import {ActionType} from "../../../../enum/actionType"
import SpellBuilder from "../../spellBuilder"

export default function(abilityService: AbilityService) {
  return new SpellBuilder(abilityService)
    .setSpellType(SpellType.Crusade)
    .setAffectType(AffectType.Crusade)
    .setActionType(ActionType.Defensive)
    .setCosts([
      new ManaCost(20),
      new DelayCost(1),
    ])
    .setSuccessMessage(checkedRequest => {
      const target = checkedRequest.getCheckTypeResult(CheckType.HasTarget)
      return new ResponseMessage(
        checkedRequest.mob,
        SpellMessages.Crusade.Success,
        {
          target: target === checkedRequest.mob ? "you" : target,
          verb: target === checkedRequest.mob ? "are" : "is",
        },
        { target: "you", verb: "are" },
        { target, verb: "is" })
    })
    .setApplySpell((checkedRequest, affectBuilder) => affectBuilder
      .setTimeout(checkedRequest.mob.level / 8)
      .setAttributes(new AttributeBuilder()
        .setHitRoll(newHitroll(1, checkedRequest.mob.level / 8))
        .build())
      .build())
    .create()
}
