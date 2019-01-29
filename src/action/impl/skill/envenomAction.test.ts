import { MAX_PRACTICE_LEVEL } from "../../../mob/constants"
import { RequestType } from "../../../request/requestType"
import { Messages } from "../../../skill/constants"
import { SkillType } from "../../../skill/skillType"
import doNTimes from "../../../support/functional/times"
import MobBuilder from "../../../test/mobBuilder"
import TestBuilder from "../../../test/testBuilder"
import Action from "../../action"

const COMMAND = "envenom axe"
const iterations = 100
let testBuilder: TestBuilder
let mobBuilder: MobBuilder
let action: Action

beforeEach(async () => {
  testBuilder = new TestBuilder()
  mobBuilder = testBuilder.withMob().withLevel(20)
  action = await testBuilder.getActionDefinition(RequestType.Envenom)
})

async function doAction(input: string, target: any) {
  return action.handle(testBuilder.createRequest(RequestType.Envenom, input, target))
}

describe("envenom skill action", () => {
  it("should fail at low levels", async () => {
    // given
    const axe = mobBuilder.withAxeEq()
    mobBuilder.withSkill(SkillType.Envenom)

    // when
    const responses = await doNTimes(iterations, () => doAction(COMMAND, axe))

    // then
    expect(responses.filter(response => response.isFailure()).length).toBeGreaterThanOrEqual(iterations * 0.9)
  })

  it("should succeed sometimes with sufficient practice", async () => {
    // setup
    const axe = mobBuilder.withAxeEq()
    mobBuilder.withSkill(SkillType.Envenom, MAX_PRACTICE_LEVEL)

    // when
    const responses = await doNTimes(iterations, async () => {
      axe.affects = []
      return doAction(COMMAND, axe)
    })

    // then
    expect(responses.filter(response => response.isSuccessful()).length).toBeGreaterThan(1)
  })

  it("should not be able to envenom a non weapon", async () => {
    // setup
    mobBuilder.withSkill(SkillType.Envenom)

    // given
    const eq = mobBuilder.withHelmetEq()

    // when
    const response = await doAction("envenom cap", eq)

    // then
    expect(response.isSuccessful()).toBeFalsy()
    expect(response.message.getMessageToRequestCreator()).toBe(Messages.Envenom.Error.NotAWeapon)
  })

  it("should only be able to envenom bladed weapons", async () => {
    // setup
    mobBuilder.withSkill(SkillType.Envenom, MAX_PRACTICE_LEVEL)

    // given
    const weapon = mobBuilder.withMaceEq()

    // when
    const response = await doAction("envenom mace", weapon)

    // then
    expect(response.isSuccessful()).toBeFalsy()
    expect(response.message.getMessageToRequestCreator()).toBe(Messages.Envenom.Error.WrongWeaponType)
  })

  it("generates accurate messages", async () => {
    // setup
    const axe = mobBuilder.withAxeEq()
    mobBuilder.withSkill(SkillType.Envenom, MAX_PRACTICE_LEVEL)

    // when
    const responses = await doNTimes(iterations, () => doAction(COMMAND, axe))

    // then
    const successResponse = responses.find(response => response.isSuccessful()).message
    expect(successResponse.getMessageToRequestCreator())
      .toBe("you successfully envenom a toy axe.")
    expect(successResponse.getMessageToTarget())
      .toBe(`${mobBuilder.mob.name} successfully envenoms a toy axe.`)
    expect(successResponse.getMessageToObservers())
      .toBe(`${mobBuilder.mob.name} successfully envenoms a toy axe.`)

    const failResponse = responses.find(response => !response.isSuccessful()).message
    expect(failResponse.getMessageToRequestCreator())
      .toBe("you fail to envenom a toy axe.")
    expect(failResponse.getMessageToTarget())
      .toBe(`${mobBuilder.mob.name} fails to envenom a toy axe.`)
    expect(failResponse.getMessageToObservers())
      .toBe(`${mobBuilder.mob.name} fails to envenom a toy axe.`)
  })
})