import Check from "../../../check/check"
import {CheckType} from "../../../check/enum/checkType"
import CheckBuilderFactory from "../../../check/factory/checkBuilderFactory"
import EventService from "../../../event/service/eventService"
import {MobEntity} from "../../../mob/entity/mobEntity"
import {Disposition} from "../../../mob/enum/disposition"
import {RequestType} from "../../../request/enum/requestType"
import {ResponseStatus} from "../../../request/enum/responseStatus"
import Request from "../../../request/request"
import Response from "../../../request/response"
import RequestService from "../../../request/service/requestService"
import {
  ConditionMessages,
  Messages,
} from "../../constants"
import {ActionPart} from "../../enum/actionPart"
import Action from "../action"

export default class KillAction extends Action {
  constructor(
    private readonly checkBuilderFactory: CheckBuilderFactory,
    private readonly eventService: EventService) {
    super()
  }

  public check(request: Request): Promise<Check> {
    return this.checkBuilderFactory.createCheckBuilder(request, Disposition.Standing)
      .requireFromActionParts(request, this.getActionParts())
      .capture()
      .require((target: MobEntity) => request.mob !== target, ConditionMessages.All.Mob.CannotAttackSelf)
      .not().requireFight(ConditionMessages.All.Mob.Fighting)
      .create()
  }

  public async invoke(requestService: RequestService): Promise<Response> {
    const target = requestService.getResult(CheckType.HasTarget)
    const event = await this.eventService.publish(requestService.createAttackEvent(target))
    if (event.isSatisfied()) {
      return requestService.respondWith().response(ResponseStatus.ActionFailed, event.context)
    }

    return requestService.respondWith().success(
      Messages.Kill.Success,
      { screamVerb: "scream", attackVerb: "attack", target },
      { screamVerb: "screams", attackVerb: "attacks", target: "you" },
      { screamVerb: "screams", attackVerb: "attacks", target })
  }

  public getActionParts(): ActionPart[] {
    return [ ActionPart.Action, ActionPart.Hostile ]
  }

  public getRequestType(): RequestType {
    return RequestType.Kill
  }

  /* istanbul ignore next */
  public getHelpText(): string {
    return Messages.Help.NoActionHelpTextProvided
  }
}
