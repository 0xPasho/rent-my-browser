CREATE TYPE "public"."account_type" AS ENUM('consumer', 'operator');--> statement-breakpoint
CREATE TYPE "public"."complexity" AS ENUM('simple', 'medium', 'complex');--> statement-breakpoint
CREATE TYPE "public"."ledger_category" AS ENUM('registration', 'topup', 'task_hold', 'task_charge', 'task_refund', 'platform_fee', 'operator_payout', 'withdrawal');--> statement-breakpoint
CREATE TYPE "public"."ledger_type" AS ENUM('debit', 'credit');--> statement-breakpoint
CREATE TYPE "public"."node_type" AS ENUM('headless', 'real');--> statement-breakpoint
CREATE TYPE "public"."offer_status" AS ENUM('pending', 'claimed', 'expired', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'confirmed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('registration', 'topup', 'task');--> statement-breakpoint
CREATE TYPE "public"."task_mode" AS ENUM('simple', 'adversarial');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('submitted', 'estimating', 'queued', 'offered', 'claimed', 'running', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."task_tier" AS ENUM('headless', 'real');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" varchar(42) NOT NULL,
	"api_key_hash" varchar(128) NOT NULL,
	"type" "account_type" NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"total_spent" integer DEFAULT 0 NOT NULL,
	"total_earned" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_wallet_address_unique" UNIQUE("wallet_address"),
	CONSTRAINT "accounts_api_key_hash_unique" UNIQUE("api_key_hash")
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" varchar(42) NOT NULL,
	"message" varchar(255) NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"type" "ledger_type" NOT NULL,
	"amount" integer NOT NULL,
	"category" "ledger_category" NOT NULL,
	"reference_id" uuid,
	"memo" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"type" "node_type" NOT NULL,
	"browser" jsonb,
	"geo" jsonb,
	"capabilities" jsonb,
	"score" integer DEFAULT 100 NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	"last_heartbeat" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"node_id" uuid NOT NULL,
	"status" "offer_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"claimed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pending_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" varchar(42) NOT NULL,
	"type" "payment_type" NOT NULL,
	"amount" integer NOT NULL,
	"amount_usdc" varchar(20) NOT NULL,
	"memo" varchar(100) NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"tx_hash" varchar(66),
	"expires_at" timestamp with time zone NOT NULL,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pending_payments_memo_unique" UNIQUE("memo")
);
--> statement-breakpoint
CREATE TABLE "steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"step_number" integer NOT NULL,
	"action" text NOT NULL,
	"screenshot_url" varchar(2048),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"node_id" uuid,
	"goal" text NOT NULL,
	"context" jsonb,
	"status" "task_status" DEFAULT 'submitted' NOT NULL,
	"tier" "task_tier",
	"mode" "task_mode" DEFAULT 'simple' NOT NULL,
	"complexity" "complexity",
	"geo" text,
	"max_budget" integer NOT NULL,
	"estimated_steps" integer,
	"estimated_cost" integer,
	"steps_completed" integer DEFAULT 0 NOT NULL,
	"actual_cost" integer,
	"result" jsonb,
	"duration_ms" integer,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "steps" ADD CONSTRAINT "steps_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;