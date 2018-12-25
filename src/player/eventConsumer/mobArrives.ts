import MobEvent from "../../event/event/mobEvent"
import EventConsumer from "../../event/eventConsumer"
import {EventResponse} from "../../event/eventResponse"
import {EventType} from "../../event/eventType"
import LocationService from "../../mob/locationService"
import {Mob} from "../../mob/model/mob"
import {Room} from "../../room/model/room"
import {GameServer} from "../../server/server"

export default class MobArrives implements EventConsumer {
  constructor(
    private readonly gameServer: GameServer,
    private readonly locationService: LocationService) {}

  public getConsumingEventTypes(): EventType[] {
    return [EventType.MobArrived]
  }

  public consume(event: MobEvent): EventResponse {
    this.announceArrival(event.mob, event.context as Room)
    return EventResponse.None
  }

  private announceArrival(mob: Mob, roomArrived: Room) {
    const mobs = this.locationService.getMobsByRoom(roomArrived)
    this.gameServer.clients.forEach(client => {
      if (client.isLoggedIn() && mobs.includes(client.getSessionMob()) && client.getSessionMob() !== mob) {
        client.sendMessage(mob.name + " has arrived.")
      }
    })
  }
}
