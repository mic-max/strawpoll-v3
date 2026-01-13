import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreatePollForm from "./components/CreatePollForm";
import VotePoll from "./components/VotePoll";

import './App.css'

function App() {
  return (
    <>
      <h1>Strawpoll</h1>
      <Router>
        <Routes>
          <Route path="/" element={<CreatePollForm />} />
          <Route path="/vote/:pollId" element={<VotePoll />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
