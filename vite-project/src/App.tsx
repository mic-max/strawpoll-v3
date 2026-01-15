import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreatePollForm from "./components/CreatePollForm";
import VotePoll from "./components/VotePoll";
import PollResults from "./components/PollResults";
import NotFound from "./components/NotFound";

function App() {
    return (
        <>
            <a href='/'><h1>Straw Poll</h1></a>
            <Router>
                <Routes>
                    <Route path="/" element={<CreatePollForm />} />
                    <Route path="/:pollId" element={<VotePoll />} />
                    <Route path="/:pollId/r" element={<PollResults />} />

                    {/* 404 catch-all */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
            <footer>
                <a href="/1/">Demo Poll</a>
                <a href="https://github.com/mic-max/strawpoll-v3">GitHub Repository</a>
                <p>Made by <a href="https://micmax.pw">micmax</a></p>
            </footer>
        </>
    )
}

export default App
