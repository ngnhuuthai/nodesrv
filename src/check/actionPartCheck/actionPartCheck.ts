import {ActionPart} from "../../action/enum/actionPart"
import Request from "../../messageExchange/request"
import CheckBuilder from "../builder/checkBuilder"

export default interface ActionPartCheck {
  getActionPart(): ActionPart
  addToCheckBuilder(checkBuilder: CheckBuilder, request: Request, actionParts: ActionPart[]): void
}
