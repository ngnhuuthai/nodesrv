import { RequestType } from "../../request/requestType"
import TestBuilder from "../../test/testBuilder"
import equipped from "./equipped"

describe("equipped", () => {
  it("should describe the items worn by a mob", async () => {
    // setup
    const  testBuilder = new TestBuilder()
    const playerBuilder = await testBuilder.withPlayer()
    const helmet = playerBuilder.equip().withHelmetEq()
    const axe = playerBuilder.withAxeEq()

    // when
    const response = await equipped(testBuilder.createRequest(RequestType.Equipped))

    // then
    expect(response.message).toContain(helmet.name)
    expect(response.message).not.toContain(axe.name)
  })
})