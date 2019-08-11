import Check from "../../../check/check"
import {CheckType} from "../../../check/enum/checkType"
import CheckBuilderFactory from "../../../check/factory/checkBuilderFactory"
import {ItemEntity} from "../../../item/entity/itemEntity"
import {ItemType} from "../../../item/enum/itemType"
import {RequestType} from "../../../request/enum/requestType"
import Request from "../../../request/request"
import Response from "../../../request/response"
import RequestService from "../../../request/service/requestService"
import {ConditionMessages, Messages} from "../../constants"
import {ActionPart} from "../../enum/actionPart"
import Action from "../action"

export default class OpenItemAction extends Action {
  constructor(private readonly checkBuilderFactory: CheckBuilderFactory) {
    super()
  }

  public check(request: Request): Promise<Check> {
    return this.checkBuilderFactory.createCheckBuilder(request)
      .require(
        request.getSubject(),
        ConditionMessages.All.Arguments.Open,
        CheckType.HasArguments)
      .require(
        () => request.mob.inventory.findItemByName(request.getSubject()),
        ConditionMessages.Open.Fail.NotFound,
        CheckType.HasTarget)
      .capture()
      .require(
        (item: ItemEntity) => item.itemType === ItemType.Container,
        ConditionMessages.Open.Fail.NotAContainer)
      .require(
        (item: ItemEntity) => !item.container.isOpen,
        ConditionMessages.Open.Fail.AlreadyOpen)
      .create()
  }

  public invoke(requestService: RequestService): Promise<Response> {
    const item = requestService.getResult<ItemEntity>(CheckType.HasTarget)
    item.container.isOpen = true

    return requestService.respondWith().success(
      Messages.OpenContainer.Success, {
        item: item.name,
        openVerb: "open",
      }, {
        item: item.name,
        openVerb: "opens",
      })
  }

  public getActionParts(): ActionPart[] {
    return [ ActionPart.Action, ActionPart.Thing ]
  }

  public getRequestType(): RequestType {
    return RequestType.Open
  }

  /* istanbul ignore next */
  public getHelpText(): string {
    return Messages.Help.NoActionHelpTextProvided
  }
}
