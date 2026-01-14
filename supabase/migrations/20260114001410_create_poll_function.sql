create or replace function create_poll(
    poll_title text,
    option_labels text[]
) returns bigint as $$
    declare
        new_poll_id bigint;
        i int;
    begin
        if array_length(option_labels, 1) < 2 then
            raise exception 'At least 2 options are required';
        end if;

        insert into polls (title)
        values (poll_title)
        returning id into new_poll_id;

        for i in array_lower(option_labels,1)..array_upper(option_labels,1) loop
            insert into options(poll_id, id, label)
            values (new_poll_id, i-1, option_labels[i]);
        end loop;

        return new_poll_id;
    end;
$$ language plpgsql;
