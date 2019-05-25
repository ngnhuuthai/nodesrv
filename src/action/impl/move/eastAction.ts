import CheckBuilderFactory from "../../../check/factory/checkBuilderFactory"
import LocationService from "../../../mob/service/locationService"
import {RequestType} from "../../../request/enum/requestType"
import {Direction} from "../../../room/enum/direction"
import Move from "../move"

export default class EastAction extends Move {
  constructor(checkBuilderFactory: CheckBuilderFactory, locationService: LocationService) {
    super(checkBuilderFactory, locationService, Direction.East)
  }

  public getRequestType(): RequestType {
    return RequestType.East
  }
}
