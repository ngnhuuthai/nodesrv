import {AffectEntity} from "../../affect/entity/affectEntity"
import {AffectType} from "../../affect/enum/affectType"
import {newAffect} from "../../affect/factory/affectFactory"
import {MobEntity} from "../../mob/entity/mobEntity"
import {getTestMob} from "../../support/test/mob"
import {CheckType} from "../enum/checkType"
import CheckComponent from "./checkComponent"

describe("createDefaultCheckFor component", () => {
  it("should be required if a fail message has provided", () => {
    // given
    const checkComponent = new CheckComponent(CheckType.Unspecified, true, true, "this has a fail message")

    // expect
    expect(checkComponent.isRequired).toBeTruthy()
  })

  it("should not be required with no fail message", () => {
    // given
    const checkComponent = new CheckComponent(CheckType.Unspecified, true, true)

    // expect
    expect(checkComponent.isRequired).toBeFalsy()
  })

  it("should be able to use a function as the thing being evaluated", () => {
    // given
    const checkComponentTrue = new CheckComponent(CheckType.Unspecified, true, () => true)
    const checkComponentFalse = new CheckComponent(CheckType.Unspecified, true, () => false)

    // expect
    expect(checkComponentTrue.getThing()).toBeTruthy()
    expect(checkComponentFalse.getThing()).toBeFalsy()
  })

  it("should re-evaluate thing for subsequent requests (not cache the first result)", () => {
    // given
    const checkComponent = new CheckComponent(CheckType.HasAffect, true, (m: MobEntity) =>
      m.affects.find((a: AffectEntity) => a.affectType === AffectType.Noop))
    const mob = getTestMob()

    // expect
    expect(checkComponent.getThing(mob)).toBeFalsy()

    // and when
    mob.affects.push(newAffect(AffectType.Noop))

    // then
    expect(checkComponent.getThing(mob)).toBeTruthy()
  })

  it("negative evaluation should work", () => {
    // given
    const checkComponent = new CheckComponent(CheckType.HasAffect, false, (m: MobEntity) =>
      m.affects.find((a: AffectEntity) => a.affectType === AffectType.Noop))
    const mob = getTestMob()

    // expect
    expect(checkComponent.getThing(mob)).toBeTruthy()
  })
})
