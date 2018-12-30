import { getPlayerRepository } from "../../player/repository/player"
import {getConnection, initializeConnection} from "../../support/db/connection"
import { getTestClient } from "../../test/client"
import { PersistPlayers } from "./persistPlayers"

beforeAll(async () => initializeConnection())
afterAll(async () => (await getConnection()).close())

describe("persistPlayers", () => {
  it("should save any player models passed in", async () => {
    // setup
    const persistPlayers = new PersistPlayers(await getPlayerRepository())

    // given
    const clients = [
      await getTestClient(),
      await getTestClient(),
      await getTestClient(),
    ]

    // when
    await persistPlayers.notify(clients)

    // then
    clients.forEach(client => expect(client.player.id).toBeGreaterThan(0))
  })
})
