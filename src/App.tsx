import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { createFlow, Node, Edge, suspenderFn } from "./lib/utils";
import { useCallback, useState } from "react";

const text = `%Partly from
@ Middle French
    └── problème {c1380 with reference to Aristotle} 
        └── <borrow> @ French
            └── problème
                └── <borrow-into> @ English
                    └── problem
%Partly from
@ Ancient Greek
    └── προβάλλειν [to throw to, to put forward]
        └── προ- [pro- prefix] + βλῆμα [throw]
            ├── πρόβληματ-, πρόβλημα [question proposed for solution, set task, (in logic) question as to whether a statement is true, in plural]
                └── <borrow> @ Classical Latin
                    └── problēma [question proposed for academic discussion (only in plural, problēmata, also as title of a work by Aristotle {2nd cent. a.d.}), in @ post-classical Latin also puzzle, riddle (Vulgate)]
                        └── <borrow-into> @ English
                            └── problem
            └── πρόβληματα [title of a work by Aristotle, in @ Hellenistic Greek also difficult question or situation, puzzle, riddle (Septuagint), literally ‘a thing thrown or put forward’]
                └── <borrow> @ Classical Latin
                    └── problēma [question proposed for academic discussion (only in plural, problēmata, also as title of a work by Aristotle {2nd cent. a.d.}), in @ post-classical Latin also puzzle, riddle (Vulgate)]
                        └── <borrow-into> @ English
                            └── problem
%External
?
    └── @ Ancient Greek
        ├── προ- [pro- prefix] + βλῆμα [throw]
        └── βάλλειν [to throw]`;

// console.log("======", createFlow(text));

type Data = {
  nodes: Node[];
  edges: Edge[];
};

const data = suspenderFn<Data>(() => createFlow(text));

function App() {
  const { nodes, edges } = data.read();

  const [controlledNodes, setNodes] = useState(nodes);
  const [controlledEdges, setEdges] = useState(edges);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node>[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <>
      <main className="flex flex-col justify-center gap-y-8 max-w-[1280px] mx-auto my-0 p-8 text-center">
        <p className="text-left border-b-black border-b-2 py-5">
          <pre>
            {`Summary
Of multiple origins. Partly a borrowing from French. Partly a borrowing from Latin.
Etymons: French problème; Latin problēma.

< (i) Middle French problème (c1380 with reference to Aristotle; French problème),
 
and its etymon (ii) classical Latin problēma question proposed for academic discussion (only in plural, problēmata, also as title of a work by Aristotle (2nd cent. a.d.)), in post-classical Latin also puzzle, riddle (Vulgate) < ancient Greek πρόβληματ-, πρόβλημα question proposed for solution, set task, (in logic) question as to whether a statement is true, in plural, πρόβληματα, title of a work by Aristotle, in Hellenistic Greek also difficult question or situation, puzzle, riddle (Septuagint), literally ‘a thing thrown or put forward’ < προ- pro- prefix2 + βλῆμα throw (< the same base as βάλλειν to throw: see ballista n.), after προβάλλειν to throw to, to put forward.`}
          </pre>
        </p>
        <p className="text-left border-b-black border-b-2 py-5">
          <pre>
            {`%Partly from
@ Middle French
    └── problème {c1380 with reference to Aristotle} 
        └── <borrow> @ French
            └── problème
                └── <borrow-into> @ English
                    └── problem
%Partly from
@ Ancient Greek
    └── προβάλλειν [to throw to, to put forward]
        └── προ- [pro- prefix] + βλῆμα [throw]
            ├── <same-base> βάλλειν [to throw]
            ├── πρόβληματ-, πρόβλημα [question proposed for solution, set task, (in logic) question as to whether a statement is true, in plural]
            └── πρόβληματα [title of a work by Aristotle, in @ Hellenistic Greek also difficult question or situation, puzzle, riddle (Septuagint), literally ‘a thing thrown or put forward’]
                └── <all> <borrow> @ Classical Latin
                    └── problēma [question proposed for academic discussion (only in plural, problēmata, also as title of a work by Aristotle {2nd cent. a.d.}), in @ post-classical Latin also puzzle, riddle (Vulgate)]
                        └── <borrow-into> @ English
                            └── problem`}
          </pre>
        </p>
        <div className="w-full h-screen">
          <ReactFlow
            nodes={controlledNodes}
            edges={controlledEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </main>
    </>
  );
}

export default App;
