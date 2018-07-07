import { newRoom } from "../../../room/factory"
import { Room } from "../../../room/model/room"
import AreaBuilder from "../../areaBuilder"
import DefaultSpec from "../../sectionSpec/defaultSpec"
import MatrixSpec from "../../sectionSpec/matrixSpec"
import { SectionType } from "../../sectionType"

function getRootRoom(): Room {
  return newRoom(
    "The edge of a meadow",
    "The forest thins out, giving way to a meadow of wildflowers.")
}

function getConnectionRoom(): Room {
  return newRoom(
    "A hidden forest meadow",
    "A patch of lush green grass is surrounded by a massive forest.")
}

export async function newClearing(outsideConnection: Room, width: number, height: number): Promise<Room[]> {
  const areaBuilder = new AreaBuilder(outsideConnection)
  areaBuilder.addRoomTemplate(SectionType.Root, new DefaultSpec(getRootRoom()))
  areaBuilder.addRoomTemplate(SectionType.Matrix, new MatrixSpec(getConnectionRoom(), width, height))
  await areaBuilder.buildSection(SectionType.Root)
  await areaBuilder.buildSection(SectionType.Matrix)

  return areaBuilder.getAllRooms()
}