import { getTestMob } from "../../support/test/mob"
import Cleric from "../specialization/impl/cleric"
import { assignSpecializationToMob } from "./mobService"

describe("mob service", () => {
  it("should be able to assign a specializationType to a mob", () => {
    // setup
    const mob = getTestMob()

    // expect
    expect(mob.skills.length).toBe(0)
    expect(mob.spells.length).toBe(0)

    // when
    assignSpecializationToMob(mob, new Cleric())

    // then
    expect(mob.specializationType).not.toBeUndefined()
    expect(mob.skills.length).toBeGreaterThan(0)
    expect(mob.spells.length).toBeGreaterThan(0)
  })

  it("should apply attributes to a mob", () => {
    // setup
    const mob = getTestMob()
    const attributeCount = mob.attributes.length

    // when
    assignSpecializationToMob(mob, new Cleric())

    // then
    expect(mob.attributes.length).toBe(attributeCount + 1)
  })
})
