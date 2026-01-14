import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import supabase from "../utils/supabase";

type OptionResult = {
    id: number;
    label: string;
    votes: number;
};

type LoadResultsRow = {
    poll_title: string;
    option_id: number;
    option_label: string;
    vote_count: number;
};

export default function PollResults() {
    const { pollId } = useParams<{ pollId: string }>();

    const [loading, setLoading] = useState(true);
    const [totalVotes, setTotalVotes] = useState(0);
    const [title, setTitle] = useState("");
    const [results, setResults] = useState<OptionResult[]>([]);
    const [subscribed, setSubscribed] = useState("Connecting...");

    async function loadResults() {
        if (!pollId) return;

        const { data } = await supabase.rpc<LoadResultsRow>("load_results", {
            poll_id: Number(pollId),
        });

        if (!data || data.length === 0) {
            setLoading(false);
            return;
        }

        setTitle(data[0].poll_title);

        const results = data.map(row => ({
            id: row.option_id,
            label: row.option_label,
            votes: row.vote_count,
        }))
            .sort((a, b) => b.votes - a.votes);

        const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

        setResults(results);
        setTotalVotes(totalVotes);
        setLoading(false);
    }

    useEffect(() => {
        loadResults();

        const channel = supabase
            .channel(`votes-poll-${pollId}`)
            .on(
                'postgres_changes',
                {
                    schema: 'public',
                    table: "votes",
                    event: 'INSERT',
                    filter: `poll_id=eq.${pollId}`,
                },
                (payload) => {
                    const optionId = payload.new.option_id;

                    // Update results state
                    setResults(prevResults =>
                        prevResults.map(option =>
                            option.id === optionId
                                ? { ...option, votes: option.votes + 1 }
                                : option
                        ).sort((a, b) => b.votes - a.votes) // keep descending
                    );

                    // Update total votes
                    setTotalVotes(prevTotal => prevTotal + 1);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setSubscribed("Live Results");
                } else {
                    setSubscribed("Not Live");
                }
            });


        return () => supabase.removeChannel(channel);

    }, [pollId]);


    if (loading) return <p>Loading results…</p>;

    return (
        <div>
            <h2>{title}</h2>

            {results.map((option) => {
                const percentNonRounded = totalVotes === 0
                    ? 0
                    : (option.votes / totalVotes) * 100;

                const percent = Math.round(percentNonRounded);

                return (
                    <div key={option.id} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            {option.label}
                            <span>
                                {percent}% ({option.votes} votes)
                            </span>
                        </div>

                        <div
                            style={{
                                height: 10,
                                background: "lightgrey",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    width: `${percentNonRounded}%`,
                                    height: "100%",
                                    background: "black",
                                }}
                            />
                        </div>
                    </div>
                );
            })}

            {/* rename bellow div class to actions? */}
            <div className='buttons'>
                <p>{subscribed}</p>
                <Link to={`/${pollId}`}>Back to Poll</Link>
            </div>
            <p>Votes: {totalVotes.toLocaleString()}</p>
        </div>
    );
}
