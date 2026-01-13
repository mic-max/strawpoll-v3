BEGIN;

WITH new_poll AS (
  INSERT INTO polls (title)
  VALUES ('Favorite programming language?')
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
      (0, 'C'),
      (1, 'Python'),
      (2, 'Java')
  ) AS opt(id, label)
  RETURNING poll_id, id
)
INSERT INTO votes (poll_id, option_id, ipv4)
SELECT
  new_options.poll_id,
  0,
  inet '192.168.1.10'
FROM new_options
WHERE id = 0;

COMMIT;
