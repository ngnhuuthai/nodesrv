import Event from "../../event/interface/event"
import Death from "../fight/death"
import {Fight} from "../fight/fight"

export default interface DeathEvent extends Event {
  readonly death: Death
  readonly fight?: Fight
}
