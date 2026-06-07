import { pgTable, serial, timestamp, varchar, jsonb, uuid, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 用户方案表
export const plans = pgTable(
	"plans",
	{
		id: serial().primaryKey(),
		user_id: uuid("user_id").notNull().default(sql`auth.uid()`),
		route: varchar("route", { length: 50 }).notNull(),
		budget: varchar("budget", { length: 100 }).notNull(),
		goal: varchar("goal", { length: 100 }).notNull(),
		plan_data: jsonb("plan_data").notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("plans_user_id_idx").on(table.user_id),
		index("plans_route_idx").on(table.route),
		index("plans_created_at_idx").on(table.created_at),
	]
);