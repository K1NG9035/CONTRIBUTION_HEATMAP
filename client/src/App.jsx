import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { NewHabit } from "./pages/NewHabit.jsx";
import { HabitDetail } from "./pages/HabitDetail.jsx";
import { EditHabit } from "./pages/EditHabit.jsx";
import { Created } from "./pages/Created.jsx";
import { Deleted } from "./pages/Deleted.jsx";
import { NotFound } from "./pages/NotFound.jsx";

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/habits/new" element={<NewHabit />} />
          <Route path="/habits/:id" element={<HabitDetail />} />
          <Route path="/habits/:id/edit" element={<EditHabit />} />
          <Route path="/habits/:id/created" element={<Created />} />
          <Route path="/habits/:id/delete" element={<Deleted />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
