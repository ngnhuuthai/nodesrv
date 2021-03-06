import uuid from "uuid"
import {createTestAppContainer} from "../../../../app/factory/testFactory"
import TestRunner from "../../../../support/test/testRunner"
import {Types} from "../../../../support/types"
import { ResponseStatus } from "../../enum/responseStatus"
import Request from "../../request"
import Complete from "./complete"
import Password from "./password"
import PasswordConfirm from "./passwordConfirm"

const mockAuthService = jest.fn()
let testRunner: TestRunner

beforeEach(async () => {
  testRunner = (await createTestAppContainer()).get<TestRunner>(Types.TestRunner)
})

describe("create player password confirm auth step", () => {
  it("should work with matching passwords", async () => {
    // setup
    const password = uuid.v4()
    const client = testRunner.createClient()
    await client.session.login(client, (await testRunner.createPlayer()).get())

    // given
    const passwordConfirm = new PasswordConfirm(mockAuthService(), client.player, password)

    // when
    const response = await passwordConfirm.processRequest(new Request(client, password))

    // then
    expect(response.status).toBe(ResponseStatus.OK)
    expect(response.authStep).toBeInstanceOf(Complete)
  })

  it("should reject mismatched passwords", async () => {
    // given
    const password1 = uuid.v4()
    const password2 = uuid.v4()
    const client = testRunner.createClient()

    // setup
    const passwordConfirm = new PasswordConfirm(mockAuthService(), client.player, password1)

    // when
    const response = await passwordConfirm.processRequest(new Request(client, password2))

    // then
    expect(response.status).toBe(ResponseStatus.FAILED)
    expect(response.authStep).toBeInstanceOf(Password)
  })
})
