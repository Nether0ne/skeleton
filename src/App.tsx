import React from "react";
import { TestForm } from "@components/forms/submit";
import { MainLayout } from "@components/layout/Main";

function App() {
  return (
    <div className="App">
      <MainLayout>
        <TestForm />
      </MainLayout>
    </div>
  );
}

export default App;
