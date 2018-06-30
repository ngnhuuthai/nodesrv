import { AffectType } from "../../affect/affectType"
import { newAffect } from "../../affect/factory"
import { RequestType } from "../../request/requestType"
import TestBuilder from "../../test/testBuilder"
import { CheckStatus } from "../check"
import drop, { MESSAGE_FAIL_NO_ITEM } from "./drop"

describe("drop handler precondition", () => {
  it("should not work if the item is not in the right inventory", async () => {
    // given
    const testBuilder = new TestBuilder()
    testBuilder.withPlayer()

    // when
    const check = await drop(testBuilder.createRequest(RequestType.Drop, "drop foo"))

    // then
    expect(check.status).toBe(CheckStatus.Failed)
    expect(check.result).toBe(MESSAGE_FAIL_NO_ITEM)
  })

  it("should be ok if the item is in the mob's inventory", async () => {
    // given
    const testBuilder = new TestBuilder()
    const equipment = testBuilder.withPlayer().withTestEquipment()

    // when
    const check = await drop(testBuilder.createRequest(RequestType.Drop, "drop cap"))

    // then
    expect(check.status).toBe(CheckStatus.Ok)
    expect(check.result).toBe(equipment)
  })

  it("should fail if the item is cursed", async () => {
    // given
    const testBuilder = new TestBuilder()
    const equipment = testBuilder.withPlayer().withTestEquipment()
    equipment.affects.push(newAffect(AffectType.Curse))

    // when
    const check = await drop(testBuilder.createRequest(RequestType.Drop, "drop cap"))

    // then
    expect(check.status).toBe(CheckStatus.Failed)
    expect(check.result).toContain("curse")
  })
})
