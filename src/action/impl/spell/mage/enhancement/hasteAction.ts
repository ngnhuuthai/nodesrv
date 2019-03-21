import AffectBuilder from "../../../../../affect/affectBuilder"
import {AffectType} from "../../../../../affect/affectType"
import AbilityService from "../../../../../check/abilityService"
import {CheckType} from "../../../../../check/checkType"
import DelayCost from "../../../../../check/cost/delayCost"
import ManaCost from "../../../../../check/cost/manaCost"
import {Mob} from "../../../../../mob/model/mob"
import ResponseMessage from "../../../../../request/responseMessage"
import {SpellMessages} from "../../../../../spell/constants"
import {SpellType} from "../../../../../spell/spellType"
import {ActionType} from "../../../../enum/actionType"
import Spell from "../../../../spell"
import AffectSpellBuilder from "../../affectSpellBuilder"

export default function(abilityService: AbilityService): Spell {
  return new AffectSpellBuilder(abilityService)
    .setSpellType(SpellType.Haste)
    .setActionType(ActionType.Defensive)
    .setCosts([
      new ManaCost(20),
      new DelayCost(1),
    ])
    .setSuccessMessage(checkedRequest => {
      const target = checkedRequest.getCheckTypeResult(CheckType.HasTarget) as Mob
      return new ResponseMessage(
        checkedRequest.mob,
        SpellMessages.Haste.Success,
        {
          target: target === checkedRequest.mob ? "you" : target,
          verb: target === checkedRequest.mob ? "begin" : "begins",
        },
        { target: "you", verb: "begin" },
        { target, verb: "begins" })
    })
    .setCreateAffect(checkedRequest =>
      new AffectBuilder(AffectType.Haste).setLevel(checkedRequest.mob.level).build())
    .create()
}
