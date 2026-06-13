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

// 用户订阅表
export const subscriptions = pgTable(
	"subscriptions",
	{
		id: serial().primaryKey(),
		user_id: uuid("user_id").notNull().default(sql`auth.uid()`),
		route: varchar("route", { length: 50 }).notNull(), // 零售商、制造商、本地服务商、品牌方
		status: varchar("status", { length: 20 }).notNull().default('pending'), // pending, active, expired, cancelled
		price: varchar("price", { length: 20 }).notNull(), // 价格，如 $19.9
		order_id: varchar("order_id", { length: 100 }).notNull(), // 微信支付订单号
		transaction_id: varchar("transaction_id", { length: 100 }), // 微信支付交易号
		paid_at: timestamp("paid_at", { withTimezone: true }), // 支付时间
		expire_at: timestamp("expire_at", { withTimezone: true }), // 过期时间（按年订阅）
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("subscriptions_user_id_idx").on(table.user_id),
		index("subscriptions_route_idx").on(table.route),
		index("subscriptions_status_idx").on(table.status),
		index("subscriptions_order_id_idx").on(table.order_id),
	]
);

// 广告截图数据表
export const adSnapshots = pgTable(
	"ad_snapshots",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		user_id: uuid("user_id").notNull().default(sql`auth.uid()`),
		campaign_name: varchar("campaign_name", { length: 200 }),
		snapshot_date: varchar("snapshot_date", { length: 20 }), // DATE as string
		spend: varchar("spend", { length: 20 }), // DECIMAL as string
		impressions: varchar("impressions", { length: 20 }), // INTEGER as string
		clicks: varchar("clicks", { length: 20 }), // INTEGER as string
		ctr: varchar("ctr", { length: 20 }), // DECIMAL as string
		cpc: varchar("cpc", { length: 20 }), // DECIMAL as string
		conversions: varchar("conversions", { length: 20 }), // INTEGER as string
		cpa: varchar("cpa", { length: 20 }), // DECIMAL as string
		roas: varchar("roas", { length: 20 }), // DECIMAL as string
		raw_image_url: varchar("raw_image_url", { length: 500 }),
		analysis_result: varchar("analysis_result", { length: 1000 }), // AI分析结论
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("ad_snapshots_user_id_idx").on(table.user_id),
		index("ad_snapshots_snapshot_date_idx").on(table.snapshot_date),
		index("ad_snapshots_created_at_idx").on(table.created_at),
	]
);