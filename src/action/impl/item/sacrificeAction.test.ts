import { AffectType } from "../../../affect/enum/affectType"
import {createTestAppContainer} from "../../../app/factory/testFactory"
import { RequestType } from "../../../messageExchange/enum/requestType"
import TestRunner from "../../../support/test/testRunner"
import {Types} from "../../../support/types"
import { ConditionMessages } from "../../constants"

let testRunner: TestRunner

beforeEach(async () => {
  testRunner = (await createTestAppContainer()).get<TestRunner>(Types.TestRunner)
})

describe("sacrifice action", () => {
  it("destroys the item", async () => {
    // setup
    const item = testRunner.createItem().asShield().build()
    const mobBuilder = await testRunner.createMob()

    // when
    await testRunner.invokeAction(RequestType.Sacrifice, `sacrifice '${item.name}'`)

    // then
    expect(testRunner.getStartRoom().getItemCount()).toBe(0)
    expect(mobBuilder.getGold()).toBeGreaterThan(0)
  })

  it("cannot sacrifice an item affected by NoSac", async () => {
    const item = testRunner.createItem()
      .asShield()
      .addAffect(AffectType.NoSacrifice)
      .build()

    const response = await testRunner.invokeAction(RequestType.Sacrifice, `sacrifice ${item.name}`)

    expect(response.getMessageToRequestCreator()).toBe(ConditionMessages.All.Item.CannotSacrifice)
    expect(testRunner.getStartRoom().getItemCount()).toBe(1)
  })
})
