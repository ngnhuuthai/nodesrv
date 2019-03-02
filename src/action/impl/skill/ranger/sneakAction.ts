import {AffectType} from "../../../../affect/affectType"
import {newAffect} from "../../../../affect/factory"
import Check from "../../../../check/check"
import CheckedRequest from "../../../../check/checkedRequest"
import {CheckType} from "../../../../check/checkType"
import Cost from "../../../../check/cost/cost"
import {CostType} from "../../../../check/cost/costType"
import {getSizeModifier} from "../../../../mob/race/sizeModifier"
import SpecializationLevel from "../../../../mob/specialization/specializationLevel"
import {SpecializationType} from "../../../../mob/specialization/specializationType"
import roll from "../../../../random/dice"
import {Request} from "../../../../request/request"
import {RequestType} from "../../../../request/requestType"
import ResponseMessage from "../../../../request/responseMessage"
import {ConditionMessages as PreconditionMessages, Costs, SkillMessages, Thresholds} from "../../../../skill/constants"
import {SkillType} from "../../../../skill/skillType"
import {Messages} from "../../../constants"
import {ActionPart} from "../../../enum/actionPart"
import {ActionType} from "../../../enum/actionType"
import Skill from "../../../skill"

export default class SneakAction extends Skill {
  public check(request: Request): Promise<Check> {
    return this.checkBuilderFactory.createCheckTemplate(request)
      .perform(this)
      .not().requireFight(PreconditionMessages.All.Fighting)
      .create()
  }

  public roll(checkedRequest: CheckedRequest): boolean {
    const mob = checkedRequest.mob
    const skill = checkedRequest.getCheckTypeResult(CheckType.HasSkill)
    return roll(1, mob.level) + roll(2, skill.level) - getSizeModifier(mob.race, 10, -10) > Thresholds.Sneak
  }

  public applySkill(checkedRequest: CheckedRequest): void {
    const mob = checkedRequest.mob
    mob.addAffect(newAffect(AffectType.Sneak, mob.level))
  }

  public getFailureMessage(checkedRequest: CheckedRequest): ResponseMessage {
    return new ResponseMessage(
      checkedRequest.mob,
      SkillMessages.Sneak.Fail)
  }

  public getSuccessMessage(checkedRequest: CheckedRequest): ResponseMessage {
    return new ResponseMessage(
      checkedRequest.mob,
      SkillMessages.Sneak.Success)
  }

  public getActionType(): ActionType {
    return ActionType.Defensive
  }

  public getSpecializationLevel(specializationType: SpecializationType): SpecializationLevel {
    if (specializationType === SpecializationType.Warrior) {
      return new SpecializationLevel(SpecializationType.Warrior, 10)
    } else if (specializationType === SpecializationType.Ranger) {
      return new SpecializationLevel(SpecializationType.Ranger, 4)
    } else if (specializationType === SpecializationType.Cleric) {
      return new SpecializationLevel(SpecializationType.Cleric, 45)
    }

    return new SpecializationLevel(SpecializationType.Mage, 45)
  }

  public getCosts(): Cost[] {
    return [
      new Cost(CostType.Mv, Costs.Sneak.Mv),
      new Cost(CostType.Delay, Costs.Sneak.Delay),
    ]
  }

  public getSkillType(): SkillType {
    return SkillType.Sneak
  }

  public getAffectType(): AffectType {
    return AffectType.Sneak
  }

  /* istanbul ignore next */
  public getActionParts(): ActionPart[] {
    return [ActionPart.Action]
  }

  public getRequestType(): RequestType {
    return RequestType.Sneak
  }

  /* istanbul ignore next */
  public getHelpText(): string {
    return Messages.Help.NoActionHelpTextProvided
  }
}
