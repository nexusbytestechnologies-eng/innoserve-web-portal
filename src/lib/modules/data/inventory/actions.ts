import { restRequest } from "$lib/api/rest";
import { invalidate } from "$lib/stores/query";

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  location: string;
}

export interface CreateInventoryInput {
  name: string;
  sku: string;
  quantity: number;
  location: string;
}

export interface UpdateInventoryInput {
  id: string;
  name?: string;
  sku?: string;
  quantity?: number;
  location?: string;
}

export async function createInventoryItem(input: CreateInventoryInput): Promise<InventoryItem> {
  const result = await restRequest<InventoryItem>("/api/inventory", {
    method: "POST",
    body: JSON.stringify(input),
  });
  invalidate("inventory");
  return result;
}

export async function updateInventoryItem(input: UpdateInventoryInput): Promise<InventoryItem> {
  const { id, ...body } = input;
  const result = await restRequest<InventoryItem>(`/api/inventory/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  invalidate("inventory");
  return result;
}
