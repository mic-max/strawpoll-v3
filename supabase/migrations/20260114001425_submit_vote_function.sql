create or replace function submit_vote(
    poll_id bigint,
    option_id smallint
) returns void as $$
declare
    voter_ip inet;
begin
    -- Get caller IP from request context
    voter_ip := inet(current_setting('request.headers', true)::json->>'x-forwarded-for');

    if voter_ip is null then
        raise exception 'Unable to determine voter IP';
    end if;

    insert into votes (poll_id, option_id, ipv4)
    values (poll_id, option_id, voter_ip);

exception
    when unique_violation then
        raise exception 'You have already voted in this poll';
end;
$$ language plpgsql security definer;
