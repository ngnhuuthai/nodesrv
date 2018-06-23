import { Request } from "../../request/request"
import { Status } from "../../spell/check"
import spellCollection from "../../spell/spellCollection"
import Response from "../../request/response"
import ResponseBuilder from "../../request/responseBuilder"

export const MESSAGE_NO_SPELL = "What do you want to cast?"
export const MESSAGE_SPELL_DOES_NOT_EXIST = "That is not a spell."
export const MESSAGE_ERROR = "You don't know that spell."
export const MESSAGE_FAIL = "You lose your concentration."

export default function(request: Request): Promise<Response> {
  const builder = new ResponseBuilder(request)

  if (!request.subject) {
    return builder.error(MESSAGE_NO_SPELL)
  }

  const spellDefinition = spellCollection.collection.find((spell) => spell.spellType.startsWith(request.subject))

  if (!spellDefinition) {
    return builder.error(MESSAGE_SPELL_DOES_NOT_EXIST)
  }

  const check = spellDefinition.check(request)

  if (check.status === Status.Error) {
    return builder.error(MESSAGE_ERROR)
  }

  spellDefinition.apply(check)

  if (check.status === Status.Fail) {
    return builder.fail(check.fail)
  }

  return builder.success(`You utter the words, '${spellDefinition.spellType}'.`)
}
