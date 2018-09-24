import { Disposition } from "../../mob/disposition"
import { RequestType } from "../../request/requestType"
import TestBuilder from "../../test/testBuilder"
import { CheckStatus } from "../check/checkStatus"
import { MESSAGE_FAIL_ALREADY_ASLEEP, MESSAGE_FAIL_DEAD } from "./constants"
import sleep from "./sleep"

describe("sleep actions precondition", () => {
  it("should not be able to sleep if already sleeping", async () => {
    // given
    const testBuilder = new TestBuilder()
    await testBuilder.withPlayer((player) => player.sessionMob.disposition = Disposition.Sleeping)

    // when
    const check = await sleep(testBuilder.createRequest(RequestType.Sleep))

    // then
    expect(check.status).toBe(CheckStatus.Failed)
    expect(check.result).toBe(MESSAGE_FAIL_ALREADY_ASLEEP)
  })

  it("should not be able to sleep if dead", async () => {
    // given
    const testBuilder = new TestBuilder()
    await testBuilder.withPlayer((player) => player.sessionMob.disposition = Disposition.Dead)

    // when
    const check = await sleep(testBuilder.createRequest(RequestType.Sleep))

    // then
    expect(check.status).toBe(CheckStatus.Failed)
    expect(check.result).toBe(MESSAGE_FAIL_DEAD)
  })
})