import {createTestAppContainer} from "../../app/factory/testFactory"
import {EventType} from "../../event/enum/eventType"
import {createClientEvent} from "../../event/factory/eventFactory"
import EventConsumer from "../../event/interface/eventConsumer"
import StateService from "../../gameService/stateService"
import {RoomEntity} from "../../room/entity/roomEntity"
import {getTestMob} from "../../support/test/mob"
import {Types} from "../../support/types"
import LoggedInEventConsumer from "./loggedInEventConsumer"

describe("logged in client event consumer", () => {
  it("invokes 'look' action on login", async () => {
    // setup
    const mob = getTestMob()
    const mockClient = jest.fn(() => ({
      getSessionMob: () => mob,
      player: { lastLogin: null },
      sendMessage: jest.fn(),
    }))
    const app = await createTestAppContainer()
    app.get<StateService>(Types.StateService).setTime(12)
    const room = app.get<RoomEntity>(Types.StartRoom)
    const client = mockClient() as any

    // given
    const loggedIn = app.getAll<EventConsumer>(Types.EventConsumerTable)
      .find(eventConsumer =>
        eventConsumer instanceof LoggedInEventConsumer) as EventConsumer

    // when
    const eventResponse = await loggedIn.consume(createClientEvent(EventType.ClientLogin, client))

    // then
    expect(eventResponse.context.getMessageToRequestCreator()).toContain(room.name)
  })
})
