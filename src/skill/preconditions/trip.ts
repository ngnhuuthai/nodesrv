import { Player } from "../../player/model/player"
import { Costs } from "../constants"
import Attempt from "../attempt"
import Check from "../check"
import { failCheck, successCheck } from "../checkFactory"
import { Messages } from "./constants"

export default function(attempt: Attempt): Promise<Check> {
  const mob = attempt.mob
  if (mob.vitals.mv > Costs.Trip.Mv) {
    return successCheck(attempt, (player: Player) => {
      mob.vitals.mv -= Costs.Trip.Mv
      player.delay += Costs.Trip.Delay
    })
  }
  return failCheck(attempt, Messages.All.NotEnoughMv)
}
