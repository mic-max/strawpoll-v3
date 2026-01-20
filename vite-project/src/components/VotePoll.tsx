import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import AsyncButton from "./AsyncButton"
import supabase from "../utils/supabase";

type Option = {
    id: number;
    label: string;
};

export default function VotePoll() {
    const { pollId } = useParams<{ pollId: string }>();
    const pollIdNumber = pollId ? parseInt(pollId, 10) : 0;

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [pollTitle, setPollTitle] = useState("");
    const [options, setOptions] = useState<Option[]>([]);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Preselect option from ?option=<id>
    useEffect(() => {
        const optionParam = searchParams.get("option");
        if (!optionParam) return;

        const id = Number(optionParam);
        if (Number.isInteger(id)) {
            setSelectedOption(id);
        }
    }, [searchParams]);

    async function fetchPoll(pollIdNumber: number) {
        const { data, error } = await supabase
            .from("poll_with_options")
            .select("poll_title, option_id, option_label")
            .eq("poll_id", pollIdNumber);

        if (error) {
            console.error(error);
            setLoading(false)
            return;
        }

        if (!data || data.length === 0) {
            console.warn("Poll not found");
            setLoading(false)
            return;
        }

        // Set title
        const title = data[0].poll_title;
        setPollTitle(title);

        // Map options
        const options: Option[] = data.map(row => ({
            id: row.option_id,
            label: row.option_label
        }));

        setOptions(options);
        setLoading(false);
    }

    useEffect(() => {
        document.title = `${pollTitle} | Straw Poll`
        fetchPoll(pollIdNumber);
    }, [pollId, pollTitle]);

    async function submitVote(e: React.FormEvent) {
        e.preventDefault();

        if (selectedOption === null || !pollId) return;

        setSubmitting(true);
        setError(null);

        try {
            const { error } = await supabase.rpc("submit_vote", {
                poll_id: pollIdNumber,
                option_id: selectedOption,
            });

            if (error) {
                setLoading(false);
                console.error(error)
                throw error;
            }

            navigate(`/${pollIdNumber}/r`);
        } catch (err: any) {
            setError(err.message || "Failed to submit vote");
            setLoading(false);
        } finally {
            setSubmitting(false);
        }
        setLoading(true)
    }

    if (loading) return <p>Loading…</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div>
            <h2>{pollTitle}</h2>

            <form onSubmit={submitVote}>
                <fieldset>
                    <legend>Make a Choice</legend>
                    {options.map((option, index) => (
                        <label key={option.id} className="radio-row">
                            <span>{index + 1}.</span>
                            <input
                                type="radio"
                                name="poll-option"
                                value={option.id}
                                checked={selectedOption === option.id}
                                onChange={() => setSelectedOption(option.id)}
                            />
                            <span className="voteOption">{option.label}</span>
                        </label>
                    ))}
                </fieldset>

                {error && <p className="error">{error}</p>}

                <div className="buttons">
                    <AsyncButton
                        type="submit"
                        label="Vote"
                        loadingLabel="Voting…"
                        loading={submitting}
                        disabled={selectedOption === null}
                    />
                    <Link to={`/${pollIdNumber}/r`}>Show Results</Link>
                    <Link to={`/${pollIdNumber - 1}`}>Prev</Link>
                    <Link to={`/${pollIdNumber + 1}`}>Next</Link>
                </div>
            </form>
        </div>
    );
}
