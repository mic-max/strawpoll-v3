import { useState} from "react";
import supabase from '../utils/supabase'

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 16;

export default function CreatePollForm() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);

  const canAddOption =
    options.length < MAX_OPTIONS &&
    options[options.length - 1].trim() !== "" &&
    options[options.length - 2].trim() !== "";

  function updateOption(index: number, value: string) {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedOptions = options.map((o) => o.trim()).filter(Boolean);

    if (!question.trim() || trimmedOptions.length < MIN_OPTIONS) {
      return;
    }

    const { data, error } = await supabase
        .from('polls')
        .insert({ title: question.trim() })
        .select()


    if (error) {
        console.error(error)
    } else {
        console.log(data)
        console.log(`POLL ID = ${data[0].id}`)
        const pollId = data[0].id
    
        const optionRows = trimmedOptions.map((x, i) => ({
            poll_id: pollId,
            id: i,
            label: x,
        }));

        const { error } = await supabase.from("options").insert(optionRows);
        if (error) {
            console.error(error)
        } else {
            console.log(`Added ${optionRows.length} options to poll.`)
        }
    }

    // show two links, one for voting page, one for results page
  }

  // Auto-add new option when conditions are met
  if (canAddOption) {
    setOptions((prev) => [...prev, ""]);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Question
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            autoFocus
          />
        </label>
      </div>

      <fieldset>
        <legend>Options</legend>

        {options.map((option, i) => (
          <div key={i}>
            <input
              type="text"
              value={option}
              placeholder={`Enter poll option...`}
              onChange={(e) => updateOption(i, e.target.value)}
              required={i < MIN_OPTIONS}
            />
          </div>
        ))}
      </fieldset>

      <button
        type="submit"
        disabled={
          !question.trim() ||
          options.filter((o) => o.trim()).length < MIN_OPTIONS
        }
      >
        Create
      </button>
    </form>
  );
}
