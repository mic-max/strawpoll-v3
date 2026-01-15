create or replace view poll_with_options as
select
    p.id as poll_id,
    p.title as poll_title,
    o.id as option_id,
    o.label as option_label
from polls p
left join options o on o.poll_id = p.id;
