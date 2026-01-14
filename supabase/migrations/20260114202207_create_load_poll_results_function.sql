create or replace function load_results(poll_id bigint)
returns table (
  poll_title text,
  option_id bigint,
  option_label text,
  vote_count bigint
)
language sql
stable
as $$
  select
    p.title as poll_title,
    o.id as option_id,
    o.label as option_label,
    count(v.option_id) as vote_count
  from polls p
  join options o
    on o.poll_id = p.id
  left join votes v
    on v.option_id = o.id
  where p.id = load_results.poll_id
  group by
    p.title,
    o.id,
    o.label
  order by
    count(v.option_id) desc,  -- most votes first
    o.id asc;                  -- stable tie-breaker
$$;
