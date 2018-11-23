import { Disposition } from "../../mob/enum/disposition"
import { newMobReset } from "../../mob/factory"
import FightTable from "../../mob/fight/fightTable"
import LocationService from "../../mob/locationService"
import MobService from "../../mob/mobService"
import { default as MobTable } from "../../mob/mobTable"
import { getMobRepository } from "../../mob/repository/mob"
import RoomTable from "../../room/roomTable"
import ResetService from "../../service/reset/resetService"
import { getTestMob } from "../../test/mob"
import { getTestRoom } from "../../test/room"
import Respawner from "./respawner"

describe("respawner", () => {
  it("should reset dispositions for dead mobs", async () => {
    // setup
    const startRoom = getTestRoom()
    const currentRoom = getTestRoom()

    // dead
    const mob1 = getTestMob()

    // dead
    const mob2 = getTestMob()

    // not dead
    const mob3 = getTestMob()

    const mobRepository = await getMobRepository()
    await mobRepository.save([mob1, mob2, mob3])

    // given
    const locationService = new LocationService([])
    const mobTable = new MobTable([])
    const mobService = new MobService(
      mobTable,
      mobRepository,
      new FightTable(),
      locationService)
    const respawner = new Respawner(
      mobService,
      RoomTable.new([currentRoom, startRoom]),
      new ResetService([
        newMobReset(mob1, startRoom),
        newMobReset(mob2, startRoom),
        newMobReset(mob3, startRoom),
      ], []))
    await respawner.seedMobTable()
    mobTable.getMobs().forEach(mob => {
      mob.disposition = Disposition.Dead
      mobService.locationService.updateMobLocation(mob, currentRoom)
    })

    // when
    await respawner.notify([])

    const mobs = mobService.mobTable.getMobs()
    expect(mobs.every(mob =>
      mob.disposition === Disposition.Standing && locationService.getLocationForMob(mob).room === startRoom))
  })
})
