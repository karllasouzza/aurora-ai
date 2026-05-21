import { tool } from "ai";
import { z } from "zod";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3333";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface OrderItem {
  productId: string;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
}

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, options);
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API Error ${res.status}: ${error}`);
  }
  return res.json() as Promise<T>;
}

export const listProductsTool = tool({
  description:
    "Lists all available products in the store with id, name, price and stock quantity.",
  inputSchema: z.object({}),
  execute: async () => {
    const products = await api<Product[]>("/products");
    return { products };
  },
});

export const getProductTool = tool({
  description:
    "Retrieves details of a specific product by ID. MUST receive the 'id' parameter with the product UUID.",
  inputSchema: z.object({
    id: z
      .string()
      .min(1)
      .describe(
        "Product ID in UUID format. Example: 7b24131b-0f24-42ec-be99-cedd8e2fcac6",
      ),
  }),
  execute: async ({ id }: { id: string }) => {
    if (!id || id.trim() === "") {
      return {
        error:
          "The 'id' parameter is required. Provide the product UUID in the 'id' field.",
      };
    }
    try {
      const product = await api<Product>(`/products/${id}`);
      return { product };
    } catch (err: any) {
      return { error: `Product with ID ${id} not found.` };
    }
  },
});

export const getOrderStatusTool = tool({
  description:
    "Retrieves the status and items of an existing order by ID. MUST receive the 'id' parameter with the order UUID.",
  inputSchema: z.object({
    id: z.string().min(1).describe("Order ID in UUID format"),
  }),
  execute: async ({ id }: { id: string }) => {
    if (!id || id.trim() === "") {
      return {
        error:
          "The 'id' parameter is required. Provide the order UUID in the 'id' field.",
      };
    }
    try {
      const order = await api<Order>(`/orders/${id}`);
      return { order };
    } catch (err: any) {
      return { error: `Order with ID ${id} not found.` };
    }
  },
});

export const createOrderTool = tool({
  description: `Creates a new purchase order. Receives an array of items with productId and quantity.
IMPORTANT: Before calling this tool, verify that there is sufficient stock by querying the product via get_product.
If there is not enough stock, DO NOT call this tool and inform the user about the limitation.`,
  inputSchema: z.object({
    products: z.array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    ),
  }),
  execute: async ({ products }: { products: OrderItem[] }) => {
    try {
      const order = await api<Order>("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });
      return { order };
    } catch (err: any) {
      return { error: `Unable to create the order: ${err.message}` };
    }
  },
});

export const tools = {
  list_products: listProductsTool,
  get_product: getProductTool,
  get_order_status: getOrderStatusTool,
  create_order: createOrderTool,
};
