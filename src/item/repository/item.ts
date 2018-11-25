import { getConnection } from "../../support/db/connection"
import { Item } from "../model/item"
import ItemRepositoryImpl from "./itemImpl"

export default interface ItemRepository {
  findAll(): Promise<Item[]>
  findOneByImportId(importId): Promise<Item>
  findOneById(id): Promise<Item>
  save(item)
}

export async function getItemRepository(): Promise<ItemRepository> {
  const connection = await getConnection()
  return new ItemRepositoryImpl(connection.getRepository(Item))
}
