import CheckedRequest from "../../../../../check/checkedRequest"
import {CheckType} from "../../../../../check/checkType"
import Cost from "../../../../../check/cost/cost"
import {CostType} from "../../../../../check/cost/costType"
import {DamageType} from "../../../../../damage/damageType"
import roll from "../../../../../random/dice"
import ResponseMessage from "../../../../../request/responseMessage"
import {SpellMessages} from "../../../../../spell/constants"
import {SpellType} from "../../../../../spell/spellType"
import {Messages} from "../../../../constants"
import {ActionType} from "../../../../enum/actionType"
import OffensiveSpell from "../../../../offensiveSpell"
import Spell from "../../../../spell"

export default class MagicMissileAction extends Spell implements OffensiveSpell {
  public applySpell(checkedRequest: CheckedRequest): void {
    const target = checkedRequest.getCheckTypeResult(CheckType.HasTarget)
    target.vitals.hp -= this.calculateBaseDamage()
  }

  public calculateBaseDamage(): number {
    return roll(1, 4)
  }

  public getSpellType(): SpellType {
    return SpellType.MagicMissile
  }

  public getActionType(): ActionType {
    return ActionType.Offensive
  }

  public getCosts(): Cost[] {
    return [
      new Cost(CostType.Mana, 15),
    ]
  }

  public getDamageType(): DamageType {
    return DamageType.Magic
  }

  public getSuccessMessage(checkedRequest: CheckedRequest): ResponseMessage {
    const target = checkedRequest.getCheckTypeResult(CheckType.HasTarget)
    return new ResponseMessage(
      checkedRequest.mob,
      SpellMessages.MagicMissile.Success,
      { target, verb: "is" },
      { verb: "are" },
      { target, verb: "is" })
  }

  /* istanbul ignore next */
  public getHelpText(): string {
    return Messages.Help.NoActionHelpTextProvided
  }
}