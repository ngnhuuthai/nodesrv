import {inject, injectable} from "inversify"
import Check from "../../../../check/check"
import {CheckType} from "../../../../check/enum/checkType"
import CheckBuilderFactory from "../../../../check/factory/checkBuilderFactory"
import {RequestType} from "../../../../messageExchange/enum/requestType"
import Request from "../../../../messageExchange/request"
import Response from "../../../../messageExchange/response"
import RequestService from "../../../../messageExchange/service/requestService"
import {MobEntity} from "../../../../mob/entity/mobEntity"
import {isBanned} from "../../../../mob/enum/standing"
import MobService from "../../../../mob/service/mobService"
import {getAuthorizationLevelName, getNextPromotion} from "../../../../player/authorizationLevels"
import {AuthorizationLevel} from "../../../../player/enum/authorizationLevel"
import Maybe from "../../../../support/functional/maybe/maybe"
import {format} from "../../../../support/string"
import {Types} from "../../../../support/types"
import {
  MESSAGE_FAIL_BANNED,
  MESSAGE_FAIL_CANNOT_PROMOTE_IMMORTALS,
  Messages,
} from "../../../constants"
import {ActionPart} from "../../../enum/actionPart"
import Action from "../../action"

@injectable()
export default class PromoteAction extends Action {
  constructor(
    @inject(Types.CheckBuilderFactory) private readonly checkBuilderFactory: CheckBuilderFactory,
    @inject(Types.MobService) private readonly mobService: MobService) {
    super()
  }

  public check(request: Request): Promise<Check> {
    const mob = this.mobService.mobTable.find((m: MobEntity) => m.name === request.getSubject()) as MobEntity
    return this.checkBuilderFactory.createCheckBuilder(request)
      .requireMob()
      .capture()
      .requirePlayer(mob)
      .require(
        () => getNextPromotion(mob),
        format(Messages.Promote.Fail.NoMorePromotions, mob.name),
        CheckType.AuthorizationLevel)
      .requireImmortal(request.getAuthorizationLevel())
      .require((m: MobEntity) => !isBanned(m.getStanding()), MESSAGE_FAIL_BANNED)
      .not().requireImmortal(
        Maybe.doIf(mob, () => mob.getAuthorizationLevel()),
        MESSAGE_FAIL_CANNOT_PROMOTE_IMMORTALS)
      .create()
  }

  public invoke(requestService: RequestService): Promise<Response> {
    const target = requestService.getResult<MobEntity>()
    const authorizationLevel = requestService.getResult<AuthorizationLevel>(CheckType.AuthorizationLevel)
    target.playerMob.authorizationLevel = authorizationLevel
    return requestService.respondWith().success(
        `You promoted ${target.name} to ${getAuthorizationLevelName(authorizationLevel)}.`)
  }

  public getActionParts(): ActionPart[] {
    return [ ActionPart.Action, ActionPart.Target ]
  }

  public getRequestType(): RequestType {
    return RequestType.Promote
  }

  /* istanbul ignore next */
  public getHelpText(): string {
    return Messages.Help.NoActionHelpTextProvided
  }
}
