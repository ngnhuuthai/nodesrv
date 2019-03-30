import {AffectType} from "../../../affect/affectType"
import Check from "../../../check/check"
import CheckedRequest from "../../../check/checkedRequest"
import TimeService from "../../../gameService/timeService"
import ItemService from "../../../item/itemService"
import {Item} from "../../../item/model/item"
import {onlyLiving} from "../../../mob/enum/disposition"
import LocationService from "../../../mob/locationService"
import {Mob} from "../../../mob/model/mob"
import getSight from "../../../mob/race/sight"
import {Region} from "../../../region/model/region"
import {Request} from "../../../request/request"
import {RequestType} from "../../../request/requestType"
import Response from "../../../request/response"
import ResponseBuilder from "../../../request/responseBuilder"
import Maybe from "../../../support/functional/maybe"
import match from "../../../support/matcher/match"
import Action from "../../action"
import {Messages} from "../../constants"
import {ActionPart} from "../../enum/actionPart"

export default class LookAction extends Action {
  constructor(
    private readonly locationService: LocationService,
    private readonly itemService: ItemService,
    private readonly timeService: TimeService) {
    super()
  }

  public check(request: Request): Promise<Check> {
    const room = request.getRoom()

    if (request.mob.getAffect(AffectType.Blind)) {
      return Check.fail(Messages.Look.Fail)
    }

    if (this.somethingIsGlowing(request)) {
      return Check.ok()
    }

    const ableToSee = this.isAbleToSee(request.mob, room.region)

    if (!ableToSee) {
      return Check.fail(Messages.Look.Fail)
    }

    return Check.ok()
  }

  public invoke(checkedRequest: CheckedRequest): Promise<Response> {
    const builder = checkedRequest.respondWith()
    const request = checkedRequest.request

    if (request.getContextAsInput().subject) {
      return this.lookAtSubject(request, builder)
    }

    return builder.info(
      request.room.toString()
      + this.reduceMobs(request.mob, this.locationService.getMobsByRoom(request.room))
      + request.room.inventory.toString("is here."))
  }

  public getActionParts(): ActionPart[] {
    return [ ActionPart.Action, ActionPart.Thing ]
  }

  public getRequestType(): RequestType {
    return RequestType.Look
  }

  /* istanbul ignore next */
  public getHelpText(): string {
    return Messages.Help.NoActionHelpTextProvided
  }

  protected reduceMobs(mob: Mob, mobs: Mob[]): string {
    return mobs.filter(onlyLiving)
      .filter((aMob: Mob) => !aMob.getAffect(AffectType.Invisible) || mob.getAffect(AffectType.DetectInvisible))
      .reduce((previous: string, current: Mob) =>
        previous + (current !== mob ? "\n" + current.brief : ""), "")
  }

  protected lookAtSubject(request: Request, builder: ResponseBuilder) {
    const subject = request.getSubject()
    const mob = this.locationService
      .getMobsByRoom(request.room)
      .find(m => match(m.name, subject))
    if (mob) {
      return builder.info(mob.describe())
    }

    let item = this.itemService.findItem(request.getRoom().inventory, subject)
    if (item) {
      return builder.info(item.describe())
    }

    item = this.itemService.findItem(request.mob.inventory, subject)
    if (item) {
      return builder.info(item.describe())
    }

    return builder.error(Messages.Look.NotFound)
  }

  protected somethingIsGlowing(request: Request) {
    return request.mob.equipped.find(this.isGlowingAffect)
      || request.room.inventory.find(this.isGlowingAffect)
  }

  protected isGlowingAffect(item: Item) {
    return item.affects.find(affect => affect.affectType === AffectType.Glow)
  }

  protected isAbleToSee(mob: Mob, region?: Region) {
    return new Maybe(region)
      .do((r: Region) =>
        getSight(mob.race).isAbleToSee(this.timeService.getCurrentTime(), r.terrain, r.weather))
      .or(() => true)
      .get()
  }
}
