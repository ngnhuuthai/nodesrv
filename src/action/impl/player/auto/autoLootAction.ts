import {inject, injectable} from "inversify"
import CheckBuilderFactory from "../../../../check/factory/checkBuilderFactory"
import {RequestType} from "../../../../messageExchange/enum/requestType"
import Response from "../../../../messageExchange/response"
import RequestService from "../../../../messageExchange/service/requestService"
import {Types} from "../../../../support/types"
import {Messages} from "../../../constants"
import SimpleAction from "../../simpleAction"

@injectable()
export default class AutoLootAction extends SimpleAction {
  constructor(@inject(Types.CheckBuilderFactory) checkBuilderFactory: CheckBuilderFactory) {
    super(checkBuilderFactory, RequestType.AutoLoot, Messages.Help.NoActionHelpTextProvided)
  }

  public invoke(requestService: RequestService): Promise<Response> {
    const mob = requestService.getMob()
    mob.playerMob.autoLoot = !mob.playerMob.autoLoot
    return requestService.respondWith().success(`Auto-loot toggled ${mob.playerMob.autoLoot ? "on" : "off"}.`)
  }
}
