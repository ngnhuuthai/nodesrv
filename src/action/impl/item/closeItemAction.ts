import Check from "../../../check/check"
import CheckBuilderFactory from "../../../check/checkBuilderFactory"
import CheckedRequest from "../../../check/checkedRequest"
import {CheckType} from "../../../check/checkType"
import {ItemType} from "../../../item/itemType"
import {Item} from "../../../item/model/item"
import { Request } from "../../../request/request"
import {RequestType} from "../../../request/requestType"
import Response from "../../../request/response"
import Action from "../../action"
import {Messages} from "../../constants"
import {ConditionMessages } from "../../constants"
import {ActionPart} from "../../enum/actionPart"

export default class CloseItemAction extends Action {
  private static getItem(request: Request) {
    return request.mob.inventory.findItemByName(request.getSubject())
  }

  constructor(private readonly checkBuilderFactory: CheckBuilderFactory) {
    super()
  }

  public check(request: Request): Promise<Check> {
    return this.checkBuilderFactory.createCheckBuilder(request)
      .require(
        request.getSubject(),
        ConditionMessages.All.Arguments.Close,
        CheckType.HasArguments)
      .requireTarget(
        () => CloseItemAction.getItem(request),
        ConditionMessages.Close.Fail.NotFound)
      .capture()
      .require(
        (item: Item) => item.itemType === ItemType.Container,
        ConditionMessages.Close.Fail.ItemIsNotAContainer)
      .require(
        (item: Item) => !item.container.isClosed,
        ConditionMessages.Close.Fail.AlreadyClosed)
      .require((item: Item) => item.container.isCloseable,
        ConditionMessages.Close.Fail.CannotClose)
      .create()
  }

  public invoke(checkedRequest: CheckedRequest): Promise<Response> {
    const item = checkedRequest.getCheckTypeResult(CheckType.HasTarget)
    item.container.isClosed = true

    return checkedRequest.respondWith().success(
      Messages.CloseContainer.Success,
      {
          closeVerb: "close",
          item: item.name,
        },
      {
          closeVerb: "closes",
          item: item.name,
        })
  }

  public getActionParts(): ActionPart[] {
    return [ ActionPart.Action, ActionPart.Thing ]
  }

  public getRequestType(): RequestType {
    return RequestType.Close
  }

  /* istanbul ignore next */
  public getHelpText(): string {
    return Messages.Help.NoActionHelpTextProvided
  }
}