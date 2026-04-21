-- Columnas de billing / Stripe en labs.
-- Para labs existentes: trial_ends_at se setea a now()+14d, subscription_status a 'trialing'.
ALTER TABLE "labs" ADD COLUMN "stripe_customer_id" text;
--> statement-breakpoint
ALTER TABLE "labs" ADD COLUMN "stripe_subscription_id" text;
--> statement-breakpoint
ALTER TABLE "labs" ADD COLUMN "stripe_price_id" text;
--> statement-breakpoint
ALTER TABLE "labs" ADD COLUMN "subscription_status" text NOT NULL DEFAULT 'trialing';
--> statement-breakpoint
ALTER TABLE "labs" ADD COLUMN "trial_ends_at" timestamp NOT NULL DEFAULT (now() + interval '14 days');
--> statement-breakpoint
ALTER TABLE "labs" ADD COLUMN "current_period_end" timestamp;
--> statement-breakpoint
ALTER TABLE "labs" ADD CONSTRAINT "labs_stripe_customer_id_unique" UNIQUE ("stripe_customer_id");
--> statement-breakpoint
ALTER TABLE "labs" ADD CONSTRAINT "labs_stripe_subscription_id_unique" UNIQUE ("stripe_subscription_id");
