import { inject, injectable } from "inversify"
import Check from "../../../../check/check"
import CheckBuilderFactory from "../../../../check/factory/checkBuilderFactory"
import {RequestType} from "../../../../messageExchange/enum/requestType"
import Request from "../../../../messageExchange/request"
import Response from "../../../../messageExchange/response"
import RequestService from "../../../../messageExchange/service/requestService"
import {Types} from "../../../../support/types"
import {Messages} from "../../../constants"
import {ActionPart} from "../../../enum/actionPart"
import Action from "../../action"

@injectable()
export default class AutoAssistAction extends Action {
  constructor(@inject(Types.CheckBuilderFactory) private readonly checkBuilderFactory: CheckBuilderFactory) {
    super()
  }

  public check(request: Request): Promise<Check> {
    return this.checkBuilderFactory.createCheckBuilder(request).create()
  }

  public getActionParts(): ActionPart[] {
    return [ ActionPart.Action ]
  }

  public getHelpText(): string {
    return Messages.Help.NoActionHelpTextProvided
  }

  public getRequestType(): RequestType {
    return RequestType.AutoAssist
  }

  public invoke(requestService: RequestService): Promise<Response> {
    const mob = requestService.getMob()
    mob.playerMob.autoAssist = !mob.playerMob.autoAssist
    return requestService.respondWith().success(`Auto-assist toggled ${mob.playerMob.autoAssist ? "on" : "off"}.`)
  }
}
