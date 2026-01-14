-- turn on security
alter table "votes"
enable row level security;

-- allow anonymous access
create policy "Allow anonymous access"
on votes
for select
to anon
using (true);

alter publication supabase_realtime
add table votes;
