import { inject, injectable } from "inversify"
import {EventType} from "../../event/enum/eventType"
import EventConsumer from "../../event/interface/eventConsumer"
import EventResponse from "../../event/messageExchange/eventResponse"
import DeathEvent from "../../mob/event/deathEvent"
import LocationService from "../../mob/service/locationService"
import {RoomEntity} from "../../room/entity/roomEntity"
import {Types} from "../../support/types"

@injectable()
export default class ResetPlayerMobOnDeathEventConsumer implements EventConsumer {
  constructor(
    @inject(Types.LocationService) private readonly locationService: LocationService,
    @inject(Types.StartRoom) private readonly startRoom: RoomEntity) {}

  public getConsumingEventTypes(): EventType[] {
    return [ EventType.MobDeath ]
  }

  public async isEventConsumable(event: DeathEvent): Promise<boolean> {
    return event.death.mobKilled.isPlayerMob()
  }

  public async consume(event: DeathEvent): Promise<EventResponse> {
    const mob = event.death.mobKilled
    mob.hp = 0
    const location = this.locationService.getLocationForMob(mob)
    location.room = this.startRoom
    return EventResponse.none(event)
  }
}
