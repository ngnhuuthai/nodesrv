import {ActionPart} from "../../action/enum/actionPart"
import Request from "../../messageExchange/request"
import CheckBuilder from "../builder/checkBuilder"
import {CheckType} from "../enum/checkType"
import ActionPartCheck from "./actionPartCheck"

export default class FreeFormActionPartCheck implements ActionPartCheck {
  public getActionPart(): ActionPart {
    return ActionPart.FreeForm
  }

  public addToCheckBuilder(checkBuilder: CheckBuilder, request: Request, actionParts: ActionPart[]): void {
    const position = actionParts.indexOf(ActionPart.FreeForm)
    const freeForm = request.getContextAsInput().words.splice(position).join(" ")
    checkBuilder.require(
      freeForm,
      "value was required",
      CheckType.FreeForm)
  }
}
