import AbilityService from "../../../../check/abilityService"
import DelayCost from "../../../../check/cost/delayCost"
import MvCost from "../../../../check/cost/mvCost"
import {Mob} from "../../../../mob/model/mob"
import ResponseMessageBuilder from "../../../../request/responseMessageBuilder"
import {SkillMessages} from "../../../../skill/constants"
import {SkillType} from "../../../../skill/skillType"
import {ActionPart} from "../../../enum/actionPart"
import {ActionType} from "../../../enum/actionType"
import SkillBuilder from "../../../skillBuilder"
import Skill from "../../skill"

export default function(abilityService: AbilityService): Skill {
  return new SkillBuilder(abilityService, SkillType.Peek)
    .setActionType(ActionType.SneakAttack)
    .setActionParts([ ActionPart.Action, ActionPart.Target ])
    .setCosts([
      new MvCost(10),
      new DelayCost(1),
    ])
    .setSuccessMessage(checkedRequest =>
      new ResponseMessageBuilder(
        checkedRequest.mob,
        SkillMessages.Peek.Success,
        checkedRequest.getTarget())
        .addReplacement(
          "inventory",
          (checkedRequest.getTarget() as Mob).inventory.items.reduce(
            (previous, current) => previous + current.name + "\n", ""))
        .create())
    .create()
}