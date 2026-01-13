create table "votes" (
    "poll_id" bigint not null,
    "option_id" smallint not null,
    "ipv4" inet not null,

    constraint votes_pkey primary key (poll_id, ipv4),

    constraint votes_poll_fkey
        foreign key (poll_id)
        references polls(id)
        on delete cascade,

    constraint votes_option_fkey
        foreign key (poll_id, option_id)
        references options(poll_id, id)
        on delete cascade
);
