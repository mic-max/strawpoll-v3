BEGIN;

WITH new_poll AS (
  INSERT INTO polls (title)
  VALUES ('What is your favourite movie?')
  RETURNING id
),
new_options AS (
  INSERT INTO options (poll_id, id, label)
  SELECT
    new_poll.id,
    opt.id,
    opt.label
  FROM new_poll
  CROSS JOIN (
    VALUES
      (1, 'Waking Life (2001)'),
      (2, 'Nightcrawler (2014)'),
      (3, 'Eternal Sunshine of the Spotless Mind (2004)'),
      (4, 'Before Sunrise (1995)')
  ) AS opt(id, label)
  RETURNING poll_id, id
)

insert into votes (poll_id, option_id, ipv4)
select
  1 as poll_id,
  option_id,
  inet '10.0.0.0' + row_number() over () as ipv4
from (
  select 1 as option_id, generate_series(1, 200)
  union all
  select 2, generate_series(1, 145)
  union all
  select 3, generate_series(1, 639)
  union all
  select 4, generate_series(1, 439)
) s;

COMMIT;
