import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Enums ─────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', [
  'admin',
  'instructor',
  'student',
  'institution_admin',
]);

export const experimentStatusEnum = pgEnum('experiment_status', [
  'draft',
  'published',
  'archived',
]);

// ─── Users ─────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: userRoleEnum('role').notNull().default('student'),
  institutionId: uuid('institution_id').references(() => institutions.id, {
    onDelete: 'set null',
  }),
  isVerified: boolean('is_verified').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Institutions ──────────────────────────────────────────────────────────

export const institutions = pgTable('institutions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  domain: varchar('domain', { length: 255 }),
  logoUrl: text('logo_url'),
  settings: jsonb('settings'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Subjects ──────────────────────────────────────────────────────────────

export const subjects = pgTable('subjects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  institutionId: uuid('institution_id').references(() => institutions.id, {
    onDelete: 'cascade',
  }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Experiments ───────────────────────────────────────────────────────────

export const experiments = pgTable('experiments', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  subjectId: uuid('subject_id')
    .notNull()
    .references(() => subjects.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'set null' }),
  status: experimentStatusEnum('status').notNull().default('draft'),
  content: jsonb('content'),
  simulationUrl: text('simulation_url'),
  videoUrl: text('video_url'),
  thumbnailUrl: text('thumbnail_url'),
  durationMinutes: integer('duration_minutes'),
  difficulty: varchar('difficulty', { length: 50 }),
  tags: text('tags').array(),
  viewCount: integer('view_count').notNull().default(0),
  completionCount: integer('completion_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Relations ─────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [users.institutionId],
    references: [institutions.id],
  }),
  authoredExperiments: many(experiments),
}));

export const institutionsRelations = relations(institutions, ({ many }) => ({
  users: many(users),
  subjects: many(subjects),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [subjects.institutionId],
    references: [institutions.id],
  }),
  experiments: many(experiments),
}));

export const experimentsRelations = relations(experiments, ({ one }) => ({
  subject: one(subjects, {
    fields: [experiments.subjectId],
    references: [subjects.id],
  }),
  author: one(users, {
    fields: [experiments.authorId],
    references: [users.id],
  }),
}));
