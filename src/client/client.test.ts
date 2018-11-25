import { Collection } from "../action/definition/collection"
import doNTimes from "../support/functional/times"
import { Player } from "../player/model/player"
import InputContext from "../request/context/inputContext"
import { Request } from "../request/request"
import { RequestType } from "../request/requestType"
import { default as AuthRequest } from "../session/auth/request"
import { SkillType } from "../skill/skillType"
import { Channel } from "../social/channel"
import { getTestClient, getTestClientLoggedOut } from "../test/client"
import { getTestRoom } from "../test/room"
import TestBuilder from "../test/testBuilder"
import { Client, getDefaultUnhandledMessage } from "./client"
import { MESSAGE_NOT_UNDERSTOOD } from "./constants"

function getNewTestMessageEvent(message = "hello world") {
  return new MessageEvent("test", {data: "{\"request\": \"" + message + "\"}"})
}

let testBuilder: TestBuilder
let client: Client
beforeEach(async () => {
  testBuilder = new TestBuilder()
  client = await testBuilder.withClient()
})

describe("client sanity checks", () => {
  it("has requests sanity check", () => {
    // expect
    expect(client.hasRequests()).toBeFalsy()

    // when
    client.addRequest(new Request(client.getSessionMob(), getTestRoom(), new InputContext(RequestType.Any)))

    // then
    expect(client.hasRequests()).toBeTruthy()
  })

  it("can handle requests sanity check", () => {
    // expect
    expect(client.canHandleRequests()).toBeFalsy()

    // when
    client.addRequest(new Request(client.player.sessionMob, getTestRoom(), new InputContext(RequestType.Any)))

    // then
    expect(client.canHandleRequests()).toBeTruthy()

    // when
    client.player.delay += 1

    // then
    expect(client.canHandleRequests()).toBeFalsy()
  })

  it("create result sanity checks", () => {
    // when
    const messageString = "this is a test"
    const message = client.createMessage(Channel.Gossip, messageString)

    // then
    expect(message.message).toBe(messageString)
  })

  it("send sanity test", () => {
    // setup
    const send = jest.fn()
    const ws = jest.fn(() => ({
      send,
    }))
    client = new Client(ws(), "127.0.0.1", new Collection([], []), jest.fn(), jest.fn(), jest.fn(), jest.fn())

    // expect
    expect(send.mock.calls.length).toBe(0)

    // when
    client.send({})

    // then
    expect(send.mock.calls.length).toBe(1)
  })

  it("on result sanity test", () => {
    // expect
    expect(client.hasRequests()).toBeFalsy()

    // when
    client.ws.onmessage(getNewTestMessageEvent("hello"))

    // then
    expect(client.hasRequests()).toBeTruthy()
  })
})

describe("clients", () => {
  it("should delegate handling requests to the session if not logged in", async () => {
    const newClient = await getTestClientLoggedOut()
    const authStep = newClient.session.getAuthStepMessage()
    newClient.addRequest(new AuthRequest(newClient, "testemail@email.com"))
    await newClient.handleNextRequest()
    expect(newClient.session.getAuthStepMessage()).not.toBe(authStep)
  })

  it("should recognize its own messages as its own and not others", async () => {
    // setup
    const message = client.createMessage(
      Channel.Gossip,
      "this is a test of the public broadcasting system",
    )

    // expect
    expect(client.isOwnMessage(message)).toBe(true)

    // when
    const anotherClient = await getTestClient()
    const newMessage = anotherClient.createMessage(Channel.Gossip, "hullo")

    // then
    expect(client.isOwnMessage(newMessage)).toBe(false)
  })

  it("should use the default action when no handlers match", async () => {
    // setup
    const request = testBuilder.createRequest(RequestType.Noop)

    // when
    const response = await client.handleRequest(request)

    // then
    expect(response).toEqual(await getDefaultUnhandledMessage(request))
  })

  it("invokes the default request action when input has no action handler", async () => {
    // setup
    const request = testBuilder.createRequest(RequestType.Noop)

    // when
    const response = await client.handleRequest(request)

    // then
    expect(response.message.getMessageToRequestCreator()).toContain(MESSAGE_NOT_UNDERSTOOD)
  })

  it("should pass tick info through the socket", () => {
    // setup
    const buf = []
    const ws = jest.fn(() => ({
        send: (message) => buf.push(message),
      }))
    client = new Client(ws(), "127.0.0.1", new Collection([], []), jest.fn(), jest.fn(), jest.fn(), jest.fn())
    const id = "test-tick-id"
    const timestamp = new Date()

    // expect
    expect(buf.length).toBe(0)

    // when
    client.tick(id, timestamp)

    // then
    expect(buf.length).toBe(1)
    expect(buf[0]).toContain("tick")
  })

  it("not logged in clients should always be able to handle requests if ones are available", () => {
    // setup
    const newClient = new Client(jest.fn(), "127.0.0.1", jest.fn(), jest.fn(), jest.fn(), jest.fn(), jest.fn())
    newClient.player = new Player()
    newClient.addRequest(new AuthRequest(newClient, RequestType.Any))

    // expect
    expect(newClient.isLoggedIn()).toBeFalsy()

    // when
    newClient.player.delay += 1

    // then
    expect(newClient.canHandleRequests()).toBeTruthy()
  })

  it("training will apply the cost appropriately", async () => {
    // setup
    testBuilder = new TestBuilder()
    const testClient = await testBuilder.withClient()
    testBuilder.withRoom()
    testBuilder.withTrainer()
    testClient.player.sessionMob.playerMob.trains = 1
    testClient.addRequest(testBuilder.createRequest(RequestType.Train, "train str"))

    // when
    await testClient.handleNextRequest()

    // then
    expect(testClient.getSessionMob().playerMob.trains).toBe(0)
  })

  it("should create a fight if the action outcome is such", async () => {
    await doNTimes(1000, async () => {
      testBuilder = new TestBuilder()
      await testBuilder.withPlayerAndSkill(SkillType.Steal, 5)
      testBuilder.withMob("bob").withAxeEq()
      const response = await client.handleRequest(testBuilder.createRequest(RequestType.Steal))
      const service = await testBuilder.getService()
      expect(service.mobService.findFight(() => true)).toBe(
        response.responseAction.wasFightStarted() ? true : undefined)
    })
  })
})
