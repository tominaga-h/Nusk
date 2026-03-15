drop extension if exists "pg_net";

alter table "public"."lists" enable row level security;

alter table "public"."personal_access_tokens" enable row level security;

alter table "public"."push_subscriptions" enable row level security;

alter table "public"."statuses" enable row level security;

alter table "public"."tasks" enable row level security;


