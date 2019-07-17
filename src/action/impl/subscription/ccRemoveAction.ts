import Check from "../../../check/check"
import CheckBuilderFactory from "../../../check/factory/checkBuilderFactory"
import {PaymentMethodEntity} from "../../../player/entity/paymentMethodEntity"
import PlayerRepository from "../../../player/repository/player"
import PaymentService from "../../../player/service/paymentService"
import {RequestType} from "../../../request/enum/requestType"
import Request from "../../../request/request"
import Response from "../../../request/response"
import RequestService from "../../../request/service/requestService"
import Maybe from "../../../support/functional/maybe/maybe"
import {Messages} from "../../constants"
import {ActionPart} from "../../enum/actionPart"
import Action from "../action"

export default class CcRemoveAction extends Action {
  constructor(
    private readonly checkBuilderFactory: CheckBuilderFactory,
    private readonly playerRepository: PlayerRepository,
    private readonly paymentService: PaymentService) {
    super()
  }

  public check(request: Request): Promise<Check> {
    return this.checkBuilderFactory.createCheckBuilder(request)
      .create()
  }

  public getActionParts(): ActionPart[] {
    return [ ActionPart.Action ]
  }

  public getHelpText(): string {
    return Messages.Help.NoActionHelpTextProvided
  }

  public getRequestType(): RequestType {
    return RequestType.CCRemove
  }

  public async invoke(requestService: RequestService): Promise<Response> {
    const mob = requestService.getMob()
    return new Maybe<Response>(await this.playerRepository.findOneByMob(mob))
      .do(player => {
        if (!player.paymentMethods) {
          return requestService.respondWith().fail("You have no payment methods to remove")
        }
        const nickname = requestService.getSubject()
        return new Maybe<Response>(player.paymentMethods.find((paymentMethod: PaymentMethodEntity) =>
          paymentMethod.nickname === nickname))
          .do(async paymentMethod => {
            const result = await this.paymentService.removePaymentMethod(player, paymentMethod)
            return result ?
              requestService.respondWith().success(`Payment method "${paymentMethod.nickname}" removed.`) :
              requestService.respondWith().fail("An error occurred while removing payment method")
          })
          .or(() => requestService.respondWith().fail("That payment method was not found"))
          .get()
      })
      .or(() => requestService.respondWith().error("An error occurred"))
      .get()
  }

}
