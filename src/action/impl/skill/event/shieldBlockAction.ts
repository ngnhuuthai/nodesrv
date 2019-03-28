import AbilityService from "../../../../check/abilityService"
import {CheckType} from "../../../../check/checkType"
import {percentRoll} from "../../../../random/helpers"
import {RequestType} from "../../../../request/requestType"
import {SkillType} from "../../../../skill/skillType"
import {ActionType} from "../../../enum/actionType"
import SkillBuilder from "../../../skillBuilder"
import Skill from "../../skill"

export default function(abilityService: AbilityService): Skill {
  return new SkillBuilder(abilityService, SkillType.ShieldBlock)
    .setRoll(checkedRequest =>
      checkedRequest.getCheckTypeResult(CheckType.HasSkill).level / 10 > percentRoll())
    .setRequestType(RequestType.Noop)
    .setActionType(ActionType.Defensive)
    .create()
}