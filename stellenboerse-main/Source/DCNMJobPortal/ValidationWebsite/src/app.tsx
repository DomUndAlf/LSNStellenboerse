import * as React from "react";
import Header from "./Components/header";
import Footer from "./Components/footer";
import Frame from "./Components/frame";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-screen-lg mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Frame />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
