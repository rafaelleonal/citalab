CREATE TABLE "package_items" (
	"package_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	CONSTRAINT "package_items_package_id_service_id_pk" PRIMARY KEY("package_id","service_id")
);
--> statement-breakpoint
ALTER TABLE "labs" ADD COLUMN "slot_minutes" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "labs" ADD COLUMN "min_lead_hours" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "is_package" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "package_items" ADD CONSTRAINT "package_items_package_id_services_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_items" ADD CONSTRAINT "package_items_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;