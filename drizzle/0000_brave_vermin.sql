CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255),
	"content" text NOT NULL,
	"analyzed_words" json DEFAULT '[]'::json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "words" (
	"word" varchar(100) PRIMARY KEY NOT NULL,
	"analysis_data" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
