import {AffectType} from "../../../../affect/enum/affectType"
import DelayCost from "../../../../check/cost/delayCost"
import ManaCost from "../../../../check/cost/manaCost"
import MvCost from "../../../../check/cost/mvCost"
import AbilityService from "../../../../check/service/abilityService"
import {Disposition} from "../../../../mob/enum/disposition"
import {Costs} from "../../../../mob/skill/constants"
import {SkillType} from "../../../../mob/skill/skillType"
import SkillBuilder from "../../../builder/skillBuilder"
import {ConditionMessages} from "../../../constants"
import {ActionPart} from "../../../enum/actionPart"
import {ActionType} from "../../../enum/actionType"
import {createApplyAbilityResponse} from "../../../factory/responseFactory"
import Skill from "../../skill"

export default function(abilityService: AbilityService): Skill {
  return new SkillBuilder(abilityService, SkillType.Garotte)
    .setActionType(ActionType.SneakAttack)
    .setAffectType(AffectType.Sleep)
    .setActionParts([ ActionPart.Action, ActionPart.Target ])
    .setTouchesTarget()
    .setCosts([
      new MvCost(Costs.Garotte.Mv),
      new ManaCost(Costs.Garotte.Mana),
      new DelayCost(Costs.Garotte.Delay),
    ])
    .setApplySkill(async (requestService, affectBuilder) => {
      requestService.setMobDisposition(Disposition.Sleeping)
      return createApplyAbilityResponse(affectBuilder
        .setTimeout(Math.max(1, requestService.getMobLevel() / 12))
        .build())
      })
    .setSuccessMessage(requestService =>
      requestService.createResponseMessage(ConditionMessages.Garotte.Success)
        .setVerbToRequestCreator("passes")
        .setVerbToTarget("pass")
        .setVerbToObservers("passes")
        .create())
    .setFailMessage(requestService =>
      requestService.createResponseMessage(ConditionMessages.Garotte.Fail)
        .setVerbToRequestCreator("fail")
        .setVerbToTarget("fails")
        .setVerbToObservers("fails")
        .create())
    .create()
}
