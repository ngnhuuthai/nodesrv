import { Room } from "../room/model/room"
import { Mob } from "./model/mob"
import MobLocation from "./model/mobLocation"

export default class LocationService {
  constructor(private mobLocations: MobLocation[]) {}

  public addMobLocation(mobLocation: MobLocation) {
    this.mobLocations.push(mobLocation)
  }

  public updateMobLocation(mob: Mob, room: Room) {
    return this.mobLocations.find(mobLocation => {
      if (mobLocation.mob.uuid === mob.uuid) {
        mobLocation.room = room
        return true
      }
    })
  }

  public getLocationForMob(mob: Mob): MobLocation {
    return this.mobLocations.find(mobLocation => mobLocation.mob === mob)
  }

  public removeMob(mob: Mob): void {
    this.mobLocations = this.mobLocations.filter(mobLocation => mobLocation.mob !== mob)
  }

  public getMobsByRoom(room: Room) {
    return this.mobLocations.filter(mobLocation => mobLocation.room === room).map(mobLocation => mobLocation.mob)
  }
}
