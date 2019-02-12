import {cloneDeep} from "lodash"
import Check from "../../../check/check"
import CheckBuilderFactory from "../../../check/checkBuilderFactory"
import CheckedRequest from "../../../check/checkedRequest"
import {CheckType} from "../../../check/checkType"
import EventService from "../../../event/eventService"
import {EventType} from "../../../event/eventType"
import ItemEvent from "../../../item/event/itemEvent"
import {Item} from "../../../item/model/item"
import {Disposition} from "../../../mob/enum/disposition"
import {Mob} from "../../../mob/model/mob"
import {Request} from "../../../request/request"
import {RequestType} from "../../../request/requestType"
import Response from "../../../request/response"
import Action from "../../action"
import {ConditionMessages, Messages, Messages as ActionMessages} from "../../constants"
import {ActionPart} from "../../enum/actionPart"

export default class BuyAction extends Action {
  constructor(
    private readonly checkBuilderFactory: CheckBuilderFactory,
    private readonly eventService: EventService) {
    super()
  }

  public check(request: Request): Promise<Check> {
    const subject = request.getSubject()
    return this.checkBuilderFactory.createCheckBuilder(request, Disposition.Standing)
      .require(subject, ConditionMessages.All.Arguments.Buy)
      .requireMerchant()
      .require((mob: Mob) =>
        mob.inventory.findItemByName(subject), ConditionMessages.Buy.MerchantNoItem, CheckType.HasItem)
      .capture()
      .require((item: Item) => request.mob.gold > item.value, ConditionMessages.Buy.CannotAfford)
      .create()
  }

  public async invoke(checkedRequest: CheckedRequest): Promise<Response> {
    const request = checkedRequest.request
    const item = cloneDeep(checkedRequest.check.result)
    request.mob.inventory.addItem(item)
    request.mob.gold -= item.value
    await this.eventService.publish(new ItemEvent(EventType.ItemCreated, item))
    const replacements = {
      item,
      value: item.value,
    }
    return request
      .respondWith()
      .success(ActionMessages.Buy.Success,
        { verb: "buy", ...replacements },
        { verb: "buys", ...replacements })
  }

  public getActionParts(): ActionPart[] {
    return [ ActionPart.Action, ActionPart.ItemWithRoomMob ]
  }

  public getRequestType(): RequestType {
    return RequestType.Buy
  }

  public getHelpText(): string {
    return Messages.Help.NoActionHelpTextProvided
  }
}
