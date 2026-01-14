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

    const [title, setTitle] = useState("");
    const [results, setResults] = useState<OptionResult[]>([]);
    const [totalVotes, setTotalVotes] = useState(0);
    const [loading, setLoading] = useState(true);

    const channel = supabase.channel(`votes:${pollId}`)

    async function loadResults() {
        if (!pollId) return;

        const { data } = await supabase.rpc<LoadResultsRow>("load_results", {
            poll_id: Number(pollId),
        });
        console.log(data)
        if (!data || data.length === 0) {
            // setError("No results found");
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

        const totalVotes = results.reduce(
            (sum, r) => sum + r.votes,
            0
        );

        setResults(results);
        setTotalVotes(totalVotes);
        setLoading(false);
    }

    useEffect(() => {
        loadResults();

        if (!pollId) return;

        // Realtime updates
        channel
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "votes",
                    filter: `poll_id=eq.${pollId}`,
                },
                loadResults
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
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
                <p>Live Results</p>
                <Link to={`/${pollId}`}>Back to Poll</Link>
            </div>
            <p>Votes: {totalVotes.toLocaleString()}</p>
        </div>
    );
}
