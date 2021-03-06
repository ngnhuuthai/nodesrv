import {createTestAppContainer} from "../../app/factory/testFactory"
import {createMobMoveEvent} from "../../event/factory/eventFactory"
import EventService from "../../event/service/eventService"
import {RoomEntity} from "../../room/entity/roomEntity"
import {Direction} from "../../room/enum/direction"
import TestRunner from "../../support/test/testRunner"
import {Types} from "../../support/types"
import {Fight} from "../fight/fight"
import MobService from "../service/mobService"

let testRunner: TestRunner
let mobService: MobService
let eventService: EventService
let room: RoomEntity

beforeEach(async () => {
  const app = await createTestAppContainer()
  testRunner = app.get<TestRunner>(Types.TestRunner)
  mobService = app.get<MobService>(Types.MobService)
  eventService = app.get<EventService>(Types.EventService)
  room = app.get<RoomEntity>(Types.StartRoom)
})

describe("aggressive mob event consumer", () => {
  it("arriving in a room with an aggressive mob should trigger a fight", async () => {
    // setup
    const player = await testRunner.createPlayer()

    // given
    const mob = await testRunner.createMob()
    mob.setAggressive()

    // when
    await eventService.publish(
      createMobMoveEvent(player.getMob(), room, room, 1, Direction.Noop))

    // then
    const fight = mobService.findFightForMob(player.getMob()).get()
    expect(fight).toBeDefined()
    expect(fight).toBeInstanceOf(Fight)
  })

  it("don't attack non-players", async () => {
    // setup
    const mob1 = (await testRunner.createMob()).get()

    // given
    const mob2 = await testRunner.createMob()
    mob2.setAggressive()

    // when
    await eventService.publish(createMobMoveEvent(mob1, room, room, 1, Direction.Noop))

    // then
    const fight = mobService.findFightForMob(mob1).get()
    expect(fight).not.toBeDefined()
  })

  it("if an aggressive mob has a lower level than the target, don't initiate an attack", async () => {
    // setup
    const player = await testRunner.createPlayer()

    // given
    const mob2 = (await testRunner.createMob()).setAggressive().get()
    player.setLevel(mob2.level + 1)

    // when
    await eventService.publish(
      createMobMoveEvent(player.getMob(), room, room, 1, Direction.Noop))

    // then
    const fight = mobService.findFightForMob(player.getMob()).get()
    expect(fight).not.toBeDefined()
  })
})
