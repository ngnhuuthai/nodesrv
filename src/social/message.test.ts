import { Message } from "./message"
import { getTestPlayer } from "./../test/common"
import { Channel } from "./constants"

describe("message", () => {
  it("should include relevant data in getData() request", () => {
    const player = getTestPlayer()
    const messageString = "this is a test message"
    const message = new Message(
      player,
      Channel.Gossip,
      messageString,
    )
    const data = JSON.stringify(message.getData())
    expect(data).toContain(messageString)
    expect(data).toContain(player.getIdentifier())
    expect(data).toContain(Channel.Gossip)
  })
})