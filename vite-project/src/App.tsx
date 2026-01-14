import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreatePollForm from "./components/CreatePollForm";
import VotePoll from "./components/VotePoll";
import PollResults from "./components/PollResults";

function App() {
    return (
        <>
            <a href='/'><h1>Straw Poll</h1></a>
            <Router>
                <Routes>
                    <Route path="/" element={<CreatePollForm />} />
                    <Route path="/:pollId" element={<VotePoll />} />
                    <Route path="/:pollId/results" element={<PollResults />} />
                </Routes>
            </Router>
        </>
    )
}

export default App
