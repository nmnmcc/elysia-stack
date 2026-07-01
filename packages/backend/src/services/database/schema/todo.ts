import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

import { users } from "./auth";

export const todos = pgTable("todos", {
  id: uuid("id").primaryKey().$defaultFn(v7),
  title: text("title").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
