import { getTestPlayer } from "../../test/player"
import drop, { MESSAGE_FAIL_NO_ITEM } from "./drop"
import { createRequestArgs, Request } from "../../request/request"
import { RequestType } from "../../request/requestType"
import { CheckStatus } from "../check"
import { newEquipment } from "../../item/factory"
import { Equipment } from "../../item/equipment"

describe("drop handler precondition", () => {
  it("should not work if the item is not in the right inventory", async () => {
    const player = getTestPlayer()
    const check = await drop(new Request(player, RequestType.Drop, createRequestArgs("drop foo")))

    expect(check.status).toBe(CheckStatus.Failed)
    expect(check.result).toBe(MESSAGE_FAIL_NO_ITEM)
  })

  it("should be ok if the item is in the mob's inventory", async () => {
    const player = getTestPlayer()
    const item = newEquipment("a shield", "a test shield", Equipment.Shield)
    player.sessionMob.inventory.addItem(item)

    const check = await drop(new Request(player, RequestType.Drop, createRequestArgs("drop shield")))

    expect(check.status).toBe(CheckStatus.Ok)
    expect(check.result).toBe(item)
  })
})
