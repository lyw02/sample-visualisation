import { ReactFlow, Controls, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const nodes = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: { label: "Hello" },
  },
  {
    id: "2",
    position: { x: 500, y: 500 },
    data: { label: "World" },
  },
];

function App() {
  return (
    <>
      <main className="flex flex-col justify-center gap-y-8 max-w-[1280px] mx-auto my-0 p-8 text-center">
        <p>Text</p>
        <p>Tree</p>
        <div className="w-full h-screen">
          <ReactFlow nodes={nodes}>
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </main>
    </>
  );
}

export default App;
