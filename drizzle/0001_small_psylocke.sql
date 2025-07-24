ALTER TABLE "videos" ALTER COLUMN "study_kit_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "videos_comments" ALTER COLUMN "video_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "videos_comments" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "videos_comments" ADD COLUMN "liked_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" DROP COLUMN IF EXISTS "duration_seconds";