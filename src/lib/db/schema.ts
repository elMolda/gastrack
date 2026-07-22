import { sql } from 'drizzle-orm';
import {
	boolean,
	date,
	integer,
	numeric,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core';

/**
 * Owned domain identity. Not FK'd to Better Auth's `user` table —
 * `auth_subject` maps the provider id so we can swap auth later.
 * Better Auth tables (user/session/account/verification) land in Migration 2.
 */
export const users = pgTable(
	'users',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		email: text('email').notNull().unique(),
		username: text('username'),
		authProvider: text('auth_provider').notNull(),
		authSubject: text('auth_subject').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [uniqueIndex('users_auth_provider_subject_idx').on(t.authProvider, t.authSubject)]
);

export const cars = pgTable(
	'cars',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		brand: text('brand').notNull(),
		model: text('model').notNull(),
		year: integer('year').notNull(),
		licensePlate: text('license_plate'),
		pictureUrl: text('picture_url'),
		isDefault: boolean('is_default').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [
		uniqueIndex('cars_one_default_per_user')
			.on(t.userId)
			.where(sql`${t.isDefault} = true`)
	]
);

export const fuelLogs = pgTable('fuel_logs', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	carId: uuid('car_id')
		.notNull()
		.references(() => cars.id, { onDelete: 'cascade' }),
	date: date('date').notNull(),
	distance: numeric('distance', { precision: 10, scale: 2 }).notNull(),
	distUnit: text('dist_unit').notNull(), // 'km' | 'mi'
	fuel: numeric('fuel', { precision: 10, scale: 2 }).notNull(),
	fuelUnit: text('fuel_unit').notNull(), // 'gal' | 'L'
	price: numeric('price', { precision: 10, scale: 2 }).notNull(),
	driveType: text('drive_type').notNull(), // 'city' | 'mixed' | 'highway'
	carReported: numeric('car_reported', { precision: 10, scale: 2 }),
	carReportedUnit: text('car_reported_unit'), // 'km/gal' | 'km/L' | 'MPG' | 'L/100km'
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Car = typeof cars.$inferSelect;
export type NewCar = typeof cars.$inferInsert;
export type FuelLog = typeof fuelLogs.$inferSelect;
export type NewFuelLog = typeof fuelLogs.$inferInsert;
