import { Mob } from "../../../mob/model/mob"
import { getMobRepository } from "../../../mob/repository/mob"
import { getTestClient } from "../../../test/client"
import { default as FinalComplete } from "../complete"
import Request from "../request"
import { ResponseStatus } from "../responseStatus"
import Complete from "./complete"

describe("create mob auth step: complete", () => {
  it("should proceed to the final step unconditionally", async () => {
    // given
    const client = await getTestClient()

    // when
    const response = await new Complete(client.player).processRequest(new Request(client, ""))

    // then
    expect(response.status).toBe(ResponseStatus.OK)
    expect(response.authStep).toBeInstanceOf(FinalComplete)
  })

  it("should persist the mob", async () => {
    // given
    const client = await getTestClient()

    // expect
    expect(client.player.sessionMob.id).toBeUndefined()

    // when
    await new Complete(client.player).processRequest(new Request(client, ""))

    // then
    expect(client.player.sessionMob.id).not.toBeUndefined()

    // and
    const repository = await getMobRepository()
    expect(await repository.findOne(client.player.sessionMob.uuid)).toBeInstanceOf(Mob)
  })
})
