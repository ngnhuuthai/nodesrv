import {ActionPart} from "../../action/enum/actionPart"
import Action from "../../action/impl/action"
import {MobEntity} from "../../mob/entity/mobEntity"
import LocationService from "../../mob/service/locationService"
import {RoomEntity} from "../../room/entity/roomEntity"
import Maybe from "../../support/functional/maybe"
import match from "../../support/matcher/match"
import InputContext from "../context/inputContext"
import {RequestType} from "../enum/requestType"
import Request from "../request"

export default class RequestBuilder {
  constructor(
    private readonly actions: Action[],
    private readonly locationService: LocationService,
    private readonly mob: MobEntity,
    private readonly room?: RoomEntity) {}

  public create(requestType: RequestType, input: string = requestType.toString()): Request {
    return new Request(
      this.mob,
      this.room as RoomEntity,
      new InputContext(requestType, input),
      this.getTargetFromRequest(requestType, input))
  }

  private getTargetFromRequest(requestType: RequestType, input: string): MobEntity | undefined {
    const actionParts = new Maybe(this.actions.find((a: Action) => a.isAbleToHandleRequestType(requestType)))
      .do(action => action.getActionParts())
      .or(() => [])
      .get() as ActionPart[]
    if (!actionParts.some(actionPart => actionPart === ActionPart.Hostile)) {
      return
    }
    const words = input.split(" ")
    const word = words.find(() => {
      const latest = actionParts.shift()
      return latest === ActionPart.Hostile
    })
    if (!word) {
      return
    }
    return this.locationService
      .getMobsByRoom(this.room as RoomEntity)
      .find((mob: MobEntity) => match(mob.name, word))
  }
}
