import EventService from "../../event/eventService"
import GameService from "../../gameService/gameService"
import LocationService from "../locationService"
import {Mob} from "../model/mob"
import {Fight} from "./fight"

export default class FightBuilder {
  private readonly locationService: LocationService
  constructor(
    private readonly eventService: EventService,
    private readonly gameService: GameService) {
    this.locationService = gameService.mobService.locationService
  }

  public create(aggressor: Mob, defender: Mob): Fight {
    return new Fight(
      this.gameService,
      this.eventService,
      aggressor,
      defender,
      this.locationService.getLocationForMob(aggressor).room)
  }
}
