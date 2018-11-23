import { Disposition } from "../../mob/enum/disposition"
import { RequestType } from "../../request/requestType"
import { ResponseStatus } from "../../request/responseStatus"
import TestBuilder from "../../test/testBuilder"
import { Messages } from "./constants"
import sleep from "./sleep"

describe("sleep action action", () => {
  it("should change the mob's disposition to sleeping", async () => {
    // given
    const testBuilder = new TestBuilder()
    await testBuilder.withPlayer()

    // when
    const response = await sleep(testBuilder.createOkCheckedRequest(RequestType.Sleep))

    // then
    expect(response.status).toBe(ResponseStatus.Success)
    expect(response.message.getMessageToRequestCreator()).toBe(Messages.Sleep.Success)
    expect(testBuilder.player.sessionMob.disposition).toBe(Disposition.Sleeping)
  })
})
