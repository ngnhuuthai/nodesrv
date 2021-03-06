import {inject, injectable} from "inversify"
import Check from "../../../check/check"
import CheckBuilderFactory from "../../../check/factory/checkBuilderFactory"
import {RequestType} from "../../../messageExchange/enum/requestType"
import Request from "../../../messageExchange/request"
import Response from "../../../messageExchange/response"
import RequestService from "../../../messageExchange/service/requestService"
import {Types} from "../../../support/types"
import {ConditionMessages, Messages} from "../../constants"
import {ActionPart} from "../../enum/actionPart"
import Action from "../action"

@injectable()
export default class RoomInfoAction extends Action {
  constructor(
    @inject(Types.CheckBuilderFactory) private readonly checkBuilderFactory: CheckBuilderFactory) {
    super()
  }

  public getRequestType(): RequestType {
    return RequestType.RoomInfo
  }

  public getActionParts(): ActionPart[] {
    return [ ActionPart.Action ]
  }

  public getHelpText(): string {
    return Messages.Help.NoActionHelpTextProvided
  }

  public check(request: Request): Promise<Check> {
    return this.checkBuilderFactory.createCheckBuilder(request)
      .requireFromActionParts(this.getActionParts())
      .not().requireFight(ConditionMessages.All.Mob.Fighting)
      .create()
  }

  public invoke(requestService: RequestService): Promise<Response> {
    const room = requestService.getRoom()
    return requestService.respondWith().info(room.name + " is " +
      (room.isOwnable ? "not " : "") +  "public." +
      (room.owner ? ` The room is owned by ${room.owner.name}.` : " The room is not owned."))
  }
}
