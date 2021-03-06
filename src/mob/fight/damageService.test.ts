import {createTestAppContainer} from "../../app/factory/testFactory"
import TestRunner from "../../support/test/testRunner"
import {Types} from "../../support/types"
import DamageService from "./damageService"
import {DamageType} from "./enum/damageType"

let testRunner: TestRunner

beforeEach(async () => {
  testRunner = (await createTestAppContainer()).get<TestRunner>(Types.TestRunner)
})

describe("damage service", () => {
  it("reports the damage type of a mob that is unequipped", async () => {
    // when
    const mobBuilder = await testRunner.createMob()

    // then
    expect(new DamageService(mobBuilder.mob).getDamageType()).toBe(DamageType.Bash)
  })

  it("reports the damage type of a mob that is equipped", async () => {
    // when
    const mobBuilder = await testRunner.createMob()
    mobBuilder.equip(testRunner.createWeapon()
      .asAxe()
      .build())

    // then
    expect(new DamageService(mobBuilder.mob).getDamageType()).toBe(DamageType.Slash)
  })
})
