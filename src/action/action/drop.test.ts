import { RequestType } from "../../request/requestType"
import TestBuilder from "../../test/testBuilder"
import drop from "./drop"
import getActionCollection from "../actionCollection"
import { Definition } from "../definition/definition"
import { Room } from "../../room/model/room"
import { Mob } from "../../mob/model/mob"
import { Equipment } from "../../item/equipment"
import { Item } from "../../item/model/item"
import { AffectType } from "../../affect/affectType"
import { newAffect } from "../../affect/factory"
import ResponseAction from "../../request/responseAction"

let testBuilder: TestBuilder
let actionDefinition: Definition
let room: Room
let mob: Mob
let equipment: Item

beforeEach(async () => {
  testBuilder = new TestBuilder()
  room = testBuilder.withRoom().room
  const playerBuilder = await testBuilder.withPlayer()
  mob = playerBuilder.player.sessionMob
  equipment = playerBuilder.withHelmetEq()
  const actionCollection = getActionCollection(await testBuilder.getService())
  actionDefinition = actionCollection.getMatchingHandlerDefinitionForRequestType(RequestType.Drop)
})

describe("drop", () => {
  it("should be able to drop an item", async () => {
    // when
    const response = await actionDefinition.handle(
      testBuilder.createRequest(RequestType.Drop, "drop cap", equipment))

    // then
    const message = response.message.getMessageToRequestCreator()
    expect(message).toContain("you drop")
    expect(message).toContain(equipment.name)
    expect(room.inventory.items).toHaveLength(1)
    expect(mob.inventory.items).toHaveLength(0)
  })

  it("an item with MeltDrop affect should destroy on drop", async () => {
    // given
    equipment.affects.push(newAffect(AffectType.MeltDrop))

    // when
    const response = await actionDefinition.handle(
      testBuilder.createRequest(RequestType.Drop, "drop cap", equipment))

    // then
    const message = response.message.getMessageToRequestCreator()
    expect(message).toContain("you drop")
    expect(message).toContain(equipment.name)
    expect(response.responseAction.wasItemDestroyed()).toBeTruthy()
  })
})
