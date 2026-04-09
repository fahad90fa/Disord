import fs from "node:fs";
import path from "node:path";

const DB_FOLDER = "database";
const FILES = {
  products: path.join(DB_FOLDER, "products.json"),
  orders: path.join(DB_FOLDER, "orders.json"),
  tickets: path.join(DB_FOLDER, "tickets.json"),
  users: path.join(DB_FOLDER, "users.json"),
};

const DEFAULTS = {
  [FILES.products]: { products: [] },
  [FILES.orders]: { orders: [] },
  [FILES.tickets]: { tickets: [] },
  [FILES.users]: { users: [] },
};

function ensureDb() {
  if (!fs.existsSync(DB_FOLDER)) {
    fs.mkdirSync(DB_FOLDER, { recursive: true });
  }
  for (const [file, value] of Object.entries(DEFAULTS)) {
    if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
      fs.writeFileSync(file, JSON.stringify(value, null, 4));
    }
  }
}

function readFile(file) {
  try {
    const raw = fs.readFileSync(file, "utf8");
    const data = JSON.parse(raw);
    const defaultData = DEFAULTS[file];
    if (defaultData && typeof defaultData === "object" && !Array.isArray(defaultData)) {
      const merged = { ...defaultData, ...(data || {}) };
      if (JSON.stringify(merged) !== JSON.stringify(data)) {
        writeFile(file, merged);
      }
      return merged;
    }
    return data;
  } catch (err) {
    const fallback = DEFAULTS[file] ?? {};
    writeFile(file, fallback);
    return fallback;
  }
}

function writeFile(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 4));
}

ensureDb();

export const db = {
  addProduct(product) {
    const data = readFile(FILES.products);
    const newProduct = {
      ...product,
      id: data.products.length + 1,
      created_at: new Date().toISOString(),
    };
    data.products.push(newProduct);
    writeFile(FILES.products, data);
    return newProduct;
  },
  getProducts(category) {
    const data = readFile(FILES.products);
    if (category) {
      return data.products.filter((p) => p.category === category);
    }
    return data.products;
  },
  getProductById(id) {
    const data = readFile(FILES.products);
    return data.products.find((p) => p.id === id) ?? null;
  },
  updateProduct(id, update) {
    const data = readFile(FILES.products);
    const index = data.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    data.products[index] = { ...data.products[index], ...update };
    writeFile(FILES.products, data);
    return true;
  },
  deleteProduct(id) {
    const data = readFile(FILES.products);
    data.products = data.products.filter((p) => p.id !== id);
    writeFile(FILES.products, data);
    return true;
  },
  createOrder(order) {
    const data = readFile(FILES.orders);
    const newOrder = {
      ...order,
      order_id: `ORD-${String(data.orders.length + 1).padStart(5, "0")}`,
      created_at: new Date().toISOString(),
      status: "pending",
    };
    data.orders.push(newOrder);
    writeFile(FILES.orders, data);
    return newOrder;
  },
  getOrder(orderId) {
    const data = readFile(FILES.orders);
    return data.orders.find((o) => o.order_id === orderId) ?? null;
  },
  updateOrder(orderId, update) {
    const data = readFile(FILES.orders);
    const index = data.orders.findIndex((o) => o.order_id === orderId);
    if (index === -1) return false;
    data.orders[index] = { ...data.orders[index], ...update };
    writeFile(FILES.orders, data);
    return true;
  },
  getUserOrders(userId) {
    const data = readFile(FILES.orders);
    return data.orders.filter((o) => o.user_id === userId);
  },
  createTicket(ticket) {
    const data = readFile(FILES.tickets);
    const newTicket = {
      ...ticket,
      ticket_id: `TICKET-${String(data.tickets.length + 1).padStart(5, "0")}`,
      created_at: new Date().toISOString(),
      status: "open",
    };
    data.tickets.push(newTicket);
    writeFile(FILES.tickets, data);
    return newTicket;
  },
  getTicket(ticketId) {
    const data = readFile(FILES.tickets);
    return data.tickets.find((t) => t.ticket_id === ticketId) ?? null;
  },
  updateTicket(ticketId, update) {
    const data = readFile(FILES.tickets);
    const index = data.tickets.findIndex((t) => t.ticket_id === ticketId);
    if (index === -1) return false;
    data.tickets[index] = { ...data.tickets[index], ...update };
    writeFile(FILES.tickets, data);
    return true;
  },
  getUserTickets(userId) {
    const data = readFile(FILES.tickets);
    return data.tickets.filter((t) => t.user_id === userId);
  },
};
