import { Player } from "../../player/model/player"
import Attempt from "../attempt"
import Check from "../check"
import { failCheck, successCheck } from "../checkFactory"
import { Costs } from "../constants"
import { Messages } from "./constants"

export default function(attempt: Attempt): Promise<Check> {
  const mob = attempt.mob
  if (mob.vitals.mv > Costs.Sneak.Delay) {
    return successCheck((player: Player) => {
      mob.vitals.mv -= Costs.Sneak.Mv
      player.delay += Costs.Sneak.Delay
    })
  }
  return failCheck(Messages.All.NotEnoughMv)
}
