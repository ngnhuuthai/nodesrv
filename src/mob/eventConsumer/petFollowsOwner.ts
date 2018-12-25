import MobEvent from "../../event/event/mobEvent"
import EventConsumer from "../../event/eventConsumer"
import {EventResponse} from "../../event/eventResponse"
import {EventType} from "../../event/eventType"
import {Room} from "../../room/model/room"
import LocationService from "../locationService"
import {Mob} from "../model/mob"

export default class PetFollowsOwner implements EventConsumer {
  constructor(private readonly locationService: LocationService) {}

  public getConsumingEventTypes(): EventType[] {
    return [EventType.MobLeft]
  }

  public consume(event: MobEvent): EventResponse {
    this.followIfPetOfMob(event.mob, event.context as Room)
    return EventResponse.None
  }

  private followIfPetOfMob(mob: Mob, roomLeft: Room) {
    const location = this.locationService.getLocationForMob(mob)
    const sourceMobs = this.locationService.getMobsByRoom(roomLeft)
    sourceMobs.forEach(sourceMob => {
      if (sourceMob.traits.isPet && mob.pet === sourceMob) {
        this.locationService.updateMobLocation(sourceMob, location.room)
      }
    })
  }
}
