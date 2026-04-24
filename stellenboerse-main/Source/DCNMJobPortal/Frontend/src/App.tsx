import * as React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import JobList from "./components/JobListFrame";
import DatabaseToolFrame from "./components/DatabaseTool/DatabaseToolFrame";

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<JobList />} />
          <Route path="/tool/:privilege/*" element={<DatabaseToolFrame />} />
          <Route path="/job/:jobId" element={<JobList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
