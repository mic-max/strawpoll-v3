import { useParams } from "react-router-dom";
import supabase from "../utils/supabase";
import { useEffect, useState } from "react";

export default function VotePoll() {
  const { pollId } = useParams<{ pollId: string }>();
  const [poll, setPoll] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPoll() {
      if (!pollId) return;
      setLoading(true);
      try {
        const { data: pollData } = await supabase
          .from("polls")
          .select("*")
          .eq("id", pollId)
          .single();

        const { data: optionData } = await supabase
          .from("options")
          .select("*")
          .eq("poll_id", pollId)
          .order("id", { ascending: true });

        setPoll(pollData);
        setOptions(optionData || []);
      } finally {
        setLoading(false);
      }
    }

    fetchPoll();
  }, [pollId]);

  if (loading) return <p>Loading...</p>;
  if (!poll) return <p>Poll not found</p>;

  return (
    <div>
      <h2>{poll.title}</h2>
      <ul>
        {options.map((o) => (
          <li key={o.id}>{o.label}</li>
        ))}
      </ul>
      {/* TODO: add vote buttons */}
    </div>
  );
}
