import Check from "../../../check/check"
import CheckBuilderFactory from "../../../check/checkBuilderFactory"
import CheckedRequest from "../../../check/checkedRequest"
import {Disposition} from "../../../mob/enum/disposition"
import MobService from "../../../mob/mobService"
import MobLocation from "../../../mob/model/mobLocation"
import {Request} from "../../../request/request"
import {RequestType} from "../../../request/requestType"
import Response from "../../../request/response"
import match from "../../../support/matcher/match"
import Action from "../../action"
import {Messages} from "../../constants"
import {ActionPart} from "../../enum/actionPart"

export default class ScanAction extends Action {
  constructor(
    private readonly checkBuilderFactory: CheckBuilderFactory,
    private readonly mobService: MobService) {
    super()
  }

  public check(request: Request): Promise<Check> {
    return this.checkBuilderFactory.createCheckBuilder(request, Disposition.Standing).create()
  }

  public invoke(checkedRequest: CheckedRequest): Promise<Response> {
    const mobLocation = this.mobService.locationService.getLocationForMob(checkedRequest.mob)
    const mobLocations = this.mobService
      .findMobsByArea(mobLocation.room.area)
      .filter(location => match(location.mob.name, checkedRequest.request.getSubject()))
    return checkedRequest.respondWith().success(
      `mobs nearby:\n${mobLocations.reduce((previous: string, current: MobLocation) =>
        previous + current.mob.name + " at " + current.room.name + "\n", "")}`)
  }

  public getActionParts(): ActionPart[] {
    return [ ActionPart.Action, ActionPart.MobInArea ]
  }

  public getRequestType(): RequestType {
    return RequestType.Scan
  }

  /* istanbul ignore next */
  public getHelpText(): string {
    return Messages.Help.NoActionHelpTextProvided
  }
}
