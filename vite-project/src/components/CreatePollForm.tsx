import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import supabase from '../utils/supabase'

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 16;

export default function CreatePollForm() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [options, setOptions] = useState<string[]>(["", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();

    // Auto-add a new option if last two are filled
    const canAddOption =
    options.length < MAX_OPTIONS &&
    options[options.length - 1].trim() !== "" &&
    options[options.length - 2].trim() !== "";
    
    useEffect(() => {
    const titleParam = searchParams.get("title");
    const optionsParam = searchParams.get("options");

    if (titleParam) {
        setTitle(titleParam);
    }

    if (optionsParam) {
        const parsedOptions = optionsParam
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean)
        .slice(0, 16);

        setOptions(parsedOptions);
    }
    }, [searchParams]);


    useEffect(() => {
        if (canAddOption) setOptions((prev) => [...prev, ""]);
    }, [canAddOption]);
    
    const updateOption = (index: number, value: string) => {
        setOptions((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    };
    
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        const trimmedOptions = options.map((o) => o.trim()).filter(Boolean);
        
        if (!title.trim() || trimmedOptions.length < MIN_OPTIONS) {
            setError("Please provide a title and at least 2 options.");
            setLoading(false);
            return;
        }
        
        try {
            const { data: pollId, error } = await supabase
            .rpc("create_poll", {
                poll_title: title.trim(),
                option_labels: trimmedOptions,
            })
            .single();
            
            if (error) throw error;

            navigate(`/${pollId}`);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };
    
    // Auto-add new option when conditions are met
    if (canAddOption) {
        setOptions((prev) => [...prev, ""]);
    }
    
    return (
        <form onSubmit={handleSubmit}>
        <div>
        <label className='title'>
        Title
        <textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        autoFocus
        placeholder="Type your question here"
        />
        </label>
        </div>

        <fieldset>
        <legend>Answer Options</legend>
        
        {options.map((option, i) => (
            <div key={i}>
            <input
            type="text"
            value={option}
            onChange={(e) => updateOption(i, e.target.value)}
            required={i < MIN_OPTIONS}
            placeholder={`Option ${i + 1}`}
            />
            </div>
        ))}
        </fieldset>
        
        {error && <p className="error">{error}</p>}
        
        <button
        type="submit"
        disabled={
            loading ||
            !title.trim() ||
            options.filter((o) => o.trim()).length < MIN_OPTIONS
        }
        style={{ cursor: loading ? "not-allowed" : "pointer" }}
        >
        {loading ? "Creating…" : "Create Poll"}
        </button>
        </form>
    );
}
