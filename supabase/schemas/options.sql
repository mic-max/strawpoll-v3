create table "options" (
  "poll_id" bigint not null,
  "id" smallint not null,
  "label" text not null,
  constraint options_pkey primary key (poll_id, id),
  constraint options_poll_fkey
    foreign key (poll_id)
    references polls(id)
    on delete cascade
);
