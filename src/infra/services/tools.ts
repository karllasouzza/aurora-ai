import { tool } from "ai";
import { z } from "zod";

const API_BASE_URL = "http://localhost:3333";

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
    "Lista todos os produtos disponíveis na loja com id, nome, preço e quantidade em estoque.",
  inputSchema: z.object({}),
  execute: async () => {
    const products = await api<Product[]>("/products");
    return { products };
  },
});

export const getProductTool = tool({
  description:
    "Consulta os detalhes de um produto específico pelo ID. DEVE receber o parâmetro 'id' com o UUID do produto.",
  inputSchema: z.object({
    id: z
      .string()
      .min(1)
      .describe(
        "ID do produto no formato UUID. Exemplo: 7b24131b-0f24-42ec-be99-cedd8e2fcac6",
      ),
  }),
  execute: async ({ id }: { id: string }) => {
    if (!id || id.trim() === "") {
      return {
        error:
          "Parâmetro 'id' é obrigatório. Forneça o UUID do produto no campo 'id'.",
      };
    }
    try {
      const product = await api<Product>(`/products/${id}`);
      return { product };
    } catch (err: any) {
      return { error: `Produto com ID ${id} não encontrado.` };
    }
  },
});

export const getOrderStatusTool = tool({
  description:
    "Consulta o status e os itens de um pedido existente pelo ID. DEVE receber o parâmetro 'id' com o UUID do pedido.",
  inputSchema: z.object({
    id: z.string().min(1).describe("ID do pedido no formato UUID"),
  }),
  execute: async ({ id }: { id: string }) => {
    if (!id || id.trim() === "") {
      return {
        error:
          "Parâmetro 'id' é obrigatório. Forneça o UUID do pedido no campo 'id'.",
      };
    }
    try {
      const order = await api<Order>(`/orders/${id}`);
      return { order };
    } catch (err: any) {
      return { error: `Pedido com ID ${id} não encontrado.` };
    }
  },
});

export const createOrderTool = tool({
  description: `Cria um novo pedido de compra. Recebe um array de itens com productId e quantity.
IMPORTANTE: Antes de chamar esta ferramenta, verifique se há estoque suficiente consultando o produto via get_product. 
Se não houver estoque suficiente, NÃO chame esta ferramenta e informe o usuário sobre a limitação.`,
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
      return { error: `Não foi possível criar o pedido: ${err.message}` };
    }
  },
});

export const tools = {
  list_products: listProductsTool,
  get_product: getProductTool,
  get_order_status: getOrderStatusTool,
  create_order: createOrderTool,
};
