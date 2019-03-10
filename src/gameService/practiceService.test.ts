import {SpecializationType} from "../mob/specialization/specializationType"
import TestBuilder from "../test/testBuilder"
import PracticeService from "./practiceService"

let testBuilder: TestBuilder
const practiceService = new PracticeService()

beforeEach(() => {
  testBuilder = new TestBuilder()
})

describe("practice service", () => {
  it("generates accurate practice messages for a warrior", () => {
    // when
    const mob = testBuilder.withMob()
      .setSpecialization(SpecializationType.Warrior)
      .build()

    // then
    expect(practiceService.generateOutputStatus(mob)).toBe(
`skill                   current practiced level

level 1
bash                    1
berserk                 1

level 3
trip                    NA

level 5
enhanced damage         NA

level 6
fast healing            NA

level 7
second attack           NA

level 11
disarm                  NA

level 13
dodge                   NA

level 18
shield bash             NA
`)
  })

  it("generates accurate practice messages for a cleric", () => {
    // when
    const mob = testBuilder.withMob()
      .setSpecialization(SpecializationType.Cleric)
      .build()

    // then
    expect(practiceService.generateOutputStatus(mob)).toBe(
`skill                   current practiced level

level 1
cure light              1

level 5
bless                   NA

level 7
cure serious            NA

level 13
cure poison             NA

level 20
heal                    NA
shield                  NA

level 25
stone skin              NA
`)
  })

  it("generates accurate practice messages for a ranger", () => {
    // when
    const mob = testBuilder.withMob()
      .setSpecialization(SpecializationType.Ranger)
      .build()

    // then
    expect(practiceService.generateOutputStatus(mob)).toBe(
`skill                   current practiced level

level 1
dodge                   1
backstab                1

level 3
dirt kick               NA

level 4
sneak                   NA

level 5
sharpen                 NA
steal                   NA

level 12
second attack           NA

level 15
envenom                 NA

level 16
fast healing            NA

level 25
enhanced damage         NA

level 31
hamstring               NA
`)
  })

  it("generates accurate practice messages for a mage", () => {
    // when
    const mob = testBuilder.withMob()
      .setSpecialization(SpecializationType.Mage)
      .build()

    // then
    expect(practiceService.generateOutputStatus(mob)).toBe(
`skill                   current practiced level

level 1
magic missile           1

level 11
giant strength          NA

level 12
blind                   NA

level 13
lightning bolt          NA

level 17
poison                  NA

level 18
curse                   NA

level 20
detect invisibility     NA

level 25
invisibility            NA

level 30
wrath                   NA
`)
  })
})