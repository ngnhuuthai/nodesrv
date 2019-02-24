import {RequestType} from "../../../request/requestType"
import TestBuilder from "../../../test/testBuilder"

describe("equipped", () => {
  it("should describe the items worn by a mob", async () => {
    // setup
    const  testBuilder = new TestBuilder()
    const action = await testBuilder.getAction(RequestType.Equipped)
    const playerBuilder = await testBuilder.withPlayer()
    const helmet = testBuilder.withItem()
      .asHelmet()
      .equipToPlayerBuilder(playerBuilder)
      .build()
    const axe = testBuilder.withWeapon()
      .asAxe()
      .addToPlayerBuilder(playerBuilder)
      .build()

    // when
    const response = await action.handle(testBuilder.createRequest(RequestType.Equipped))

    // then
    const message = response.message.getMessageToRequestCreator()
    expect(message).toContain(helmet.name)
    expect(message).not.toContain(axe.name)
  })
})
