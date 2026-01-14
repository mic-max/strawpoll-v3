import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import supabase from "../utils/supabase";

type Option = {
  id: number;
  label: string;
};

export default function VotePoll() {
  const { pollId } = useParams<{ pollId: string }>();
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
      setSelectedOption(id - 1);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadPoll() {
      if (!pollId) return;

      const { data: poll, error: pollError } = await supabase
        .from("polls")
        .select("title")
        .eq("id", pollId)
        .single();

      const { data: opts, error: optError } = await supabase
        .from("options")
        .select("id, label")
        .eq("poll_id", pollId)
        .order("id");

      if (pollError || optError || !poll || !opts) {
        setError("Poll not found");
      } else {
        setPollTitle(poll.title);
        setOptions(opts);
      }

      setLoading(false);
    }

    loadPoll();
  }, [pollId]);

  async function submitVote(e: React.FormEvent) {
    e.preventDefault();

    if (selectedOption === null || !pollId) return;

    setSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase.rpc("submit_vote", {
        poll_id: Number(pollId),
        option_id: selectedOption,
      });

      if (error) throw error;

      navigate(`/${pollId}/results`);
    } catch (err: any) {
      setError(err.message || "Failed to submit vote");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h2>{pollTitle}</h2>

      <form onSubmit={submitVote}>
        <fieldset>
            <legend>Make A Choice</legend>
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
                <span>{option.label}</span>
            </label>
          ))}
        </fieldset>

        {error && <p className="error">{error}</p>}

        <div className="buttons">
          <button
            type="submit"
            disabled={selectedOption === null || submitting}
          >
            {submitting ? "Voting…" : "Vote"}
          </button>

          <Link to={`/${pollId}/results`}>Show Results</Link>
        </div>
      </form>
    </div>
  );
}
