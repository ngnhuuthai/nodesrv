import {inject, injectable} from "inversify"
import {AffectType} from "../../../affect/enum/affectType"
import Check from "../../../check/check"
import TimeService from "../../../gameService/timeService"
import {ItemEntity} from "../../../item/entity/itemEntity"
import ItemService from "../../../item/service/itemService"
import ResponseBuilder from "../../../messageExchange/builder/responseBuilder"
import {RequestType} from "../../../messageExchange/enum/requestType"
import Request from "../../../messageExchange/request"
import Response from "../../../messageExchange/response"
import RequestService from "../../../messageExchange/service/requestService"
import {MobEntity} from "../../../mob/entity/mobEntity"
import {PlayerMobEntity} from "../../../mob/entity/playerMobEntity"
import {onlyLiving} from "../../../mob/enum/disposition"
import {isAbleToSee} from "../../../mob/race/sight"
import LocationService from "../../../mob/service/locationService"
import {RegionEntity} from "../../../region/entity/regionEntity"
import {Weather} from "../../../region/enum/weather"
import WeatherService from "../../../region/service/weatherService"
import {RoomEntity} from "../../../room/entity/roomEntity"
import withValue from "../../../support/functional/withValue"
import {Types} from "../../../support/types"
import Describeable from "../../../type/describeable"
import {Messages} from "../../constants"
import {ActionPart} from "../../enum/actionPart"
import Action from "../action"

@injectable()
export default class LookAction extends Action {
  private static async createBuilderFromTarget(
    request: Request, builder: ResponseBuilder, describeable?: Describeable): Promise<Response | undefined> {
    return describeable && request.mob.canSee(describeable) ? await builder.info(describeable.describe()) : undefined
  }

  private static getRoomDescription(room: RoomEntity, playerMob?: PlayerMobEntity): string {
    const exitDescription = !playerMob || playerMob.autoExit ?
      `\nExits [${room.getExitsString()}]` : ``
    return `(${room.id}) ${room.name}

${room.description}
${exitDescription}`
  }

  constructor(
    @inject(Types.LocationService) private readonly locationService: LocationService,
    @inject(Types.ItemService) private readonly itemService: ItemService,
    @inject(Types.TimeService) private readonly timeService: TimeService,
    @inject(Types.WeatherService) private readonly weatherService: WeatherService) {
    super()
  }

  public check(request: Request): Promise<Check> {
    return !request.mob.affect().isBlind() &&
      (this.somethingIsGlowing(request) ||
      this.isAbleToSee(request.mob, request.getRoomRegion())) ? Check.ok() : Check.fail(Messages.Look.Fail)
  }

  public invoke(requestService: RequestService): Promise<Response> {
    return requestService.getSubject() ?
      this.lookAtSubject(requestService.getRequest(), requestService.respondWith()) :
      withValue(requestService.getRequest(), request =>
        requestService.respondWith().info(
          LookAction.getRoomDescription(request.getRoom(), request.mob.playerMob)
          + this.reduceMobs(requestService.getMob(), this.locationService.getMobsByRoom(request.getRoom()))
          + request.getRoom().inventory.toString("is here.")))
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

  protected reduceMobs(mob: MobEntity, mobs: MobEntity[]): string {
    return mobs.filter(onlyLiving)
      .filter(m => mob.canSee(m))
      .reduce((previous: string, current: MobEntity) =>
        previous + (current !== mob ? "\n" + current.look() : ""), "")
  }

  protected async lookAtSubject(request: Request, builder: ResponseBuilder) {
    return await LookAction.createBuilderFromTarget(request, builder, request.getTargetMobInRoom()) ||
      await LookAction.createBuilderFromTarget(
        request, builder, this.itemService.findItem(request.getRoom().inventory, request.getSubject())) ||
      await LookAction.createBuilderFromTarget(
      request, builder, this.itemService.findItem(request.mob.inventory, request.getSubject())) ||
      await builder.error(Messages.Look.NotFound)
  }

  protected isAbleToSee(mob: MobEntity, region: RegionEntity) {
    return isAbleToSee(
      mob.race().sight,
      this.timeService.getCurrentTime(),
      region.terrain,
      this.weatherService.getWeatherForRegion(region)
        .or(() => Weather.Clear)
        .get())
  }

  private somethingIsGlowing(request: Request) {
    return request.mob.equipped.find((item: ItemEntity) => item.affect().has(AffectType.Glow))
      || request.getRoom().inventory.find((item: ItemEntity) => item.affect().has(AffectType.Glow))
  }
}
