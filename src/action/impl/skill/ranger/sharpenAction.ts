import {AffectType} from "../../../../affect/affectType"
import {newPermanentAffect} from "../../../../affect/factory"
import {Affect} from "../../../../affect/model/affect"
import AttributeBuilder from "../../../../attributes/attributeBuilder"
import {newHitroll} from "../../../../attributes/factory"
import Check from "../../../../check/check"
import CheckedRequest from "../../../../check/checkedRequest"
import {CheckType} from "../../../../check/checkType"
import Cost from "../../../../check/cost/cost"
import {CostType} from "../../../../check/cost/costType"
import {DamageType} from "../../../../damage/damageType"
import Weapon from "../../../../item/model/weapon"
import roll from "../../../../random/dice"
import {Request} from "../../../../request/request"
import {RequestType} from "../../../../request/requestType"
import ResponseMessage from "../../../../request/responseMessage"
import {ActionMessages, ConditionMessages as PreconditionMessages, Costs, Thresholds} from "../../../../skill/constants"
import {SkillType} from "../../../../skill/skillType"
import collectionSearch from "../../../../support/matcher/collectionSearch"
import {Messages} from "../../../constants"
import {ActionPart} from "../../../enum/actionPart"
import {ActionType} from "../../../enum/actionType"
import Skill from "../../../skill"

export default class SharpenAction extends Skill {
  public check(request: Request): Promise<Check> {
    const item = collectionSearch(request.mob.inventory.items, request.getSubject())

    return this.checkBuilderFactory.createCheckTemplate(request)
      .perform(this)
      .not().requireFight(PreconditionMessages.All.Fighting)
      .require(item, PreconditionMessages.All.NoItem, CheckType.HasItem)
      .capture()
      .require(
        item.affects.find((affect: Affect) => affect.affectType === AffectType.Sharpened) === undefined,
        PreconditionMessages.Sharpen.AlreadySharpened)
      .require(
        item instanceof Weapon,
        PreconditionMessages.Sharpen.NotAWeapon)
      .require(
        item.damageType === DamageType.Slash,
        PreconditionMessages.Sharpen.NotABladedWeapon)
      .create()
  }

  public roll(checkedRequest: CheckedRequest): boolean {
    const skill = checkedRequest.getCheckTypeResult(CheckType.HasSkill)
    return roll(1, skill.level / 10) > Thresholds.Sharpen
  }

  public applySkill(checkedRequest: CheckedRequest): void {
    const [ skill, target ] = checkedRequest.results(CheckType.HasSkill, CheckType.HasTarget)
    target.affects.push(newPermanentAffect(
      AffectType.Sharpened,
      new AttributeBuilder()
        .setHitRoll(newHitroll(1, roll(1, skill.level / 10) + 1))
        .build()))
  }

  public getFailureMessage(checkedRequest: CheckedRequest): ResponseMessage {
    const target = checkedRequest.getCheckTypeResult(CheckType.HasTarget)
    return new ResponseMessage(
      checkedRequest.mob,
      ActionMessages.Sharpen.Failure,
      { verb: "fail", target },
      { verb: "fail", target },
      { verb: "fails", target })
  }

  public getSuccessMessage(checkedRequest: CheckedRequest): ResponseMessage {
    const target = checkedRequest.getCheckTypeResult(CheckType.HasTarget)
    return new ResponseMessage(
      checkedRequest.mob,
      ActionMessages.Sharpen.Success,
      { verb: "sharpen", target },
      { verb: "sharpen", target },
      { verb: "sharpens", target })
  }

  public getActionType(): ActionType {
    return ActionType.Neutral
  }

  public getCosts(): Cost[] {
    return [
      new Cost(CostType.Mana, Costs.Sharpen.Mana),
      new Cost(CostType.Mv, Costs.Sharpen.Mv),
      new Cost(CostType.Delay, Costs.Sharpen.Delay),
    ]
  }

  public getSkillType(): SkillType {
    return SkillType.Sharpen
  }

  public getAffectType(): AffectType {
    return AffectType.Sharpened
  }

  public getActionParts(): ActionPart[] {
    return [ActionPart.Action, ActionPart.ItemInInventory]
  }

  public getRequestType(): RequestType {
    return RequestType.Sharpen
  }

  /* istanbul ignore next */
  public getHelpText(): string {
    return Messages.Help.NoActionHelpTextProvided
  }
}