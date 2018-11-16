import CheckedRequest from "../../check/checkedRequest"
import { Mob } from "../../mob/model/mob"
import { Trigger } from "../../mob/trigger"
import EventContext from "../../request/context/eventContext"
import { Request } from "../../request/request"
import { RequestType } from "../../request/requestType"
import Response from "../../request/response"
import { Skill } from "../model/skill"
import { getSkillActionDefinition } from "../skillTable"
import { Event } from "./event"
import { Resolution } from "./resolution"

function filterBySkillTrigger(skill: Skill, trigger: Trigger) {
  const action = getSkillActionDefinition(skill.skillType)
  if (!action) {
    return false
  }
  return action.triggers.some((skillTrigger) => {
    return skillTrigger === trigger
  })
}

export function getSkillsByTrigger(mob: Mob, trigger: Trigger) {
  return mob.skills.filter((skill) => filterBySkillTrigger(skill, trigger))
}

async function attemptSkillAction(mob: Mob, trigger: Trigger, target: Mob, skill: Skill): Promise<Response> {
  const definition = getSkillActionDefinition(skill.skillType)
  const request = new Request(mob, mob.room, new EventContext(RequestType.Event, trigger))
  const check = await definition.preconditions(request)

  return definition.action(new CheckedRequest(request, check))
}

export async function createSkillTriggerEvent(mob: Mob, trigger: Trigger, target: Mob = null): Promise<Event> {
  const event = new Event(mob, trigger)
  for (const skill of getSkillsByTrigger(mob, trigger)) {
    if ((await attemptSkillAction(mob, trigger, target, skill)).isSuccessful()) {
      event.resolveWith(skill.skillType)

      return event
    }
  }
  event.skillEventResolution = Resolution.Failed

  return event
}

export async function createSkillTriggerEvents(mob: Mob, trigger: Trigger, target: Mob): Promise<Event[]> {
  const events = []
  for (const skill of getSkillsByTrigger(mob, trigger)) {
    const event = new Event(mob, trigger)
    if ((await attemptSkillAction(mob, trigger, target, skill)).isSuccessful()) {
      event.resolveWith(skill.skillType)
    } else {
      event.skillEventResolution = Resolution.Failed
    }
    events.push(event)
  }

  return events
}
