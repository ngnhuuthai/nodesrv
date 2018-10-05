import { Trigger } from "../mob/trigger"
import { AffectType } from "./affectType"
import { applyAffectModifier } from "./applyAffect"

describe("modifier table", () => {
  it("should apply appropriate modifiers for poison", () => {
    const test = trigger => applyAffectModifier([AffectType.Poison], trigger, 1)

    expect(test(Trigger.DamageModifier)).toBeLessThan(1)
    expect(test(Trigger.DamageAbsorption)).toBeGreaterThan(1)
    expect(test(Trigger.MovementCost)).toBeGreaterThan(1)
  })

  it("should apply appropriate modifiers for shield", () => {
    expect(applyAffectModifier([AffectType.Shield], Trigger.DamageAbsorption, 1)).toBeLessThan(1)
  })
})