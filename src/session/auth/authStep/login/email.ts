import { validate } from "email-validator"
import {CreationMessages} from "../../constants"
import Request from "../../request"
import Response from "../../response"
import AbstractAuthStep from "../abstractAuthStep"
import AuthStep from "../authStep"
import NewPlayerConfirm from "./newPlayerConfirm"
import Password from "./password"

export default class Email extends AbstractAuthStep implements AuthStep {
  private static isEmailValid(email: string): boolean {
    return validate(email)
  }

  /* istanbul ignore next */
  public getStepMessage(): string {
    return CreationMessages.Player.EmailPrompt
  }

  public async processRequest(request: Request): Promise<Response> {
    const email = request.input

    if (!Email.isEmailValid(email)) {
      return request.fail(this, CreationMessages.Player.EmailInvalid)
    }

    return (await this.creationService.getOnePlayer(email))
      .maybe(player => request.ok(new Password(this.creationService, player)))
      .or(() => request.ok(new NewPlayerConfirm(this.creationService, email)))
      .get()
  }
}
