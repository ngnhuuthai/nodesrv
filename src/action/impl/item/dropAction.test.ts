import { AffectType } from "../../../affect/enum/affectType"
import { newAffect } from "../../../affect/factory/affectFactory"
import {createTestAppContainer} from "../../../app/factory/testFactory"
import { ItemEntity } from "../../../item/entity/itemEntity"
import { RequestType } from "../../../messageExchange/enum/requestType"
import MobBuilder from "../../../support/test/mobBuilder"
import TestRunner from "../../../support/test/testRunner"
import {Types} from "../../../support/types"

let testRunner: TestRunner
let mobBuilder: MobBuilder
let equipment: ItemEntity

beforeEach(async () => {
  testRunner = (await createTestAppContainer()).get<TestRunner>(Types.TestRunner)
  mobBuilder = await testRunner.createMob()
  equipment = testRunner.createItem()
    .asHelmet()
    .build()
  mobBuilder.addItem(equipment)
})

describe("drop request action", () => {
  it("should be able to drop an item", async () => {
    // when
    const response = await testRunner.invokeAction(RequestType.Drop, "drop cap")

    // then
    const message = response.getMessageToRequestCreator()
    expect(message).toContain("you drop")
    expect(message).toContain(equipment.name)
    expect(testRunner.getStartRoom().getItemCount()).toBe(1)
    expect(mobBuilder.getItems()).toHaveLength(0)
  })

  it("an item with MeltDrop affect should destroy on drop", async () => {
    // given
    equipment.affect().add(newAffect(AffectType.MeltDrop))

    // when
    const response = await testRunner.invokeAction(RequestType.Drop, "drop cap")

    // then
    const message = response.getMessageToRequestCreator()
    expect(message).toContain("you drop")
    expect(message).toContain(equipment.name)
  })
})
