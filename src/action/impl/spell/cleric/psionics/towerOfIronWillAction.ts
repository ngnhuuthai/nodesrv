import {AffectType} from "../../../../../affect/affectType"
import AbilityService from "../../../../../check/abilityService"
import {CheckType} from "../../../../../check/checkType"
import DelayCost from "../../../../../check/cost/delayCost"
import ManaCost from "../../../../../check/cost/manaCost"
import DamageSourceBuilder from "../../../../../mob/damageSourceBuilder"
import ResponseMessage from "../../../../../request/responseMessage"
import {SpellMessages} from "../../../../../spell/constants"
import {SpellType} from "../../../../../spell/spellType"
import {ActionType} from "../../../../enum/actionType"
import Spell from "../../../../spell"
import SpellBuilder from "../../spellBuilder"

export default function(abilityService: AbilityService): Spell {
  return new SpellBuilder(abilityService)
    .setSpellType(SpellType.TowerOfIronWill)
    .setAffectType(AffectType.TowerOfIronWill)
    .setActionType(ActionType.Defensive)
    .setCosts([
      new ManaCost(20),
      new DelayCost(1),
    ])
    .setSuccessMessage(checkedRequest => {
      const target = checkedRequest.getCheckTypeResult(CheckType.HasTarget)
      return new ResponseMessage(
        checkedRequest.mob,
        SpellMessages.TowerOfIronWill.Success,
        { target: target === checkedRequest.mob ? "your" : `${target}'s` },
        { target: "your" },
        { target: `${target}'s` })
    })
    .setApplySpell((checkedRequest, affectBuilder) => affectBuilder
      .setTimeout(checkedRequest.mob.level / 7)
      .setResist(new DamageSourceBuilder().enableMental().get())
      .build())
    .create()
}
