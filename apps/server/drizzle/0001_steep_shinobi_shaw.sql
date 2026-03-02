CREATE INDEX "challenges_wallet_used_idx" ON "challenges" USING btree ("wallet_address","used");--> statement-breakpoint
CREATE INDEX "ledger_account_id_idx" ON "ledger_entries" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "ledger_reference_id_idx" ON "ledger_entries" USING btree ("reference_id");--> statement-breakpoint
CREATE INDEX "nodes_account_id_idx" ON "nodes" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "nodes_online_type_score_idx" ON "nodes" USING btree ("is_online","type","score");--> statement-breakpoint
CREATE INDEX "offers_node_status_idx" ON "offers" USING btree ("node_id","status");--> statement-breakpoint
CREATE INDEX "offers_task_status_idx" ON "offers" USING btree ("task_id","status");--> statement-breakpoint
CREATE INDEX "offers_expires_status_idx" ON "offers" USING btree ("expires_at","status");--> statement-breakpoint
CREATE INDEX "payments_wallet_status_idx" ON "pending_payments" USING btree ("wallet_address","status");--> statement-breakpoint
CREATE INDEX "steps_task_id_idx" ON "steps" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "tasks_account_id_idx" ON "tasks" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tasks_node_id_idx" ON "tasks" USING btree ("node_id");