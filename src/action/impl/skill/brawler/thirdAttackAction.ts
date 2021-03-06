import AbilityService from "../../../../check/service/abilityService"
import {RequestType} from "../../../../messageExchange/enum/requestType"
import {SkillType} from "../../../../mob/skill/skillType"
import SkillBuilder from "../../../builder/skillBuilder"
import {ActionType} from "../../../enum/actionType"
import Skill from "../../skill"

export default function(abilityService: AbilityService): Skill {
  return new SkillBuilder(abilityService, SkillType.ThirdAttack)
    .setRequestType(RequestType.Noop)
    .setActionType(ActionType.Defensive)
    .create()
}
