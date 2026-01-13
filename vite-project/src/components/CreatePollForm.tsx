import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import supabase from '../utils/supabase'

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 16;

export default function CreatePollForm() {
    const navigate = useNavigate();
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState<string[]>(["", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // TODO: maybe load question and options from query params?

    // Auto-add a new option if last two are filled
    const canAddOption =
    options.length < MAX_OPTIONS &&
    options[options.length - 1].trim() !== "" &&
    options[options.length - 2].trim() !== "";
    
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
        
        if (!question.trim() || trimmedOptions.length < MIN_OPTIONS) {
            setError("Please provide a question and at least 2 options.");
            setLoading(false);
            return;
        }
        
        try {
            const { data: pollId, error } = await supabase
            .rpc("create_poll", {
                poll_title: question.trim(),
                option_labels: trimmedOptions,
            })
            .single();
            
            if (error) throw error;
            
            navigate(`/vote/${pollId}`);
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
        <div style={{ marginBottom: 12 }}>
        <label>
        Question
        <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        required
        autoFocus
        style={{ width: "100%", padding: 6, marginTop: 4 }}
        />
        </label>
        </div>
        
        <fieldset style={{ marginBottom: 12 }}>
        <legend>Options</legend>
        
        {options.map((option, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
            <input
            type="text"
            value={option}
            placeholder={`#${i + 1}`}
            onChange={(e) => updateOption(i, e.target.value)}
            required={i < MIN_OPTIONS}
            style={{ width: "100%", padding: 6 }}
            />
            </div>
        ))}
        </fieldset>
        
        {error && <p style={{ color: "red" }}>{error}</p>}
        
        <button
        type="submit"
        disabled={
            loading ||
            !question.trim() ||
            options.filter((o) => o.trim()).length < MIN_OPTIONS
        }
        style={{ padding: "8px 16px", cursor: loading ? "not-allowed" : "pointer" }}
        >
        {loading ? "Creating…" : "Create poll"}
        </button>
        </form>
    );
}
