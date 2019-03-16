import {AffectType} from "../../../../../affect/affectType"
import CheckedRequest from "../../../../../check/checkedRequest"
import {CheckType} from "../../../../../check/checkType"
import Cost from "../../../../../check/cost/cost"
import DelayCost from "../../../../../check/cost/delayCost"
import ManaCost from "../../../../../check/cost/manaCost"
import ResponseMessage from "../../../../../request/responseMessage"
import {SpellMessages} from "../../../../../spell/constants"
import {SpellType} from "../../../../../spell/spellType"
import {Messages} from "../../../../constants"
import {ActionType} from "../../../../enum/actionType"
import Spell from "../../../../spell"

export default class InvisibilityAction extends Spell {
  public applySpell(checkedRequest: CheckedRequest): void {
    this.applyAffectType(checkedRequest)
  }

  public getAffectType(): AffectType {
    return AffectType.Invisible
  }

  public getSpellType(): SpellType {
    return SpellType.Invisibility
  }

  public getActionType(): ActionType {
    return ActionType.Defensive
  }

  public getCosts(): Cost[] {
    return [
      new ManaCost(5),
      new DelayCost(1),
    ]
  }

  public getSuccessMessage(checkedRequest: CheckedRequest): ResponseMessage {
    const target = checkedRequest.getCheckTypeResult(CheckType.HasTarget)
    return new ResponseMessage(
      checkedRequest.mob,
      SpellMessages.Invisibility.Success,
      { target: target === checkedRequest.mob ? "you" : target,
        verb: target === checkedRequest.mob ? "fade" : "fades" },
      { target: "you", verb: "fade" },
      { target, verb: "fades" })
  }

  /* istanbul ignore next */
  public getHelpText(): string {
    return Messages.Help.NoActionHelpTextProvided
  }
}
