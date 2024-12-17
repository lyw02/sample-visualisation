import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Result = { content: string; children: Result[] };
export type Node = {
  id: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
  };
};
export type Edge = {
  id: string;
  source: string;
  target: string;
};

// function hashContent(content: string): string {
//   return crypto.createHash("sha256").update(content).digest("hex").slice(0, 8);
// }

async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 8);
}

function parseTree(lines: string[], indent = 0, parentPrefix = "") {
  const result: Result[] = [];
  let i = 0;
  let currentPrefix = parentPrefix;

  while (i < lines.length) {
    const line = lines[i];
    const currentIndent = line.search(/\S|$/);

    if (currentIndent === indent) {
      let content = line
        .trim()
        .replace(/^\└──|^\├──/, "")
        .trim();

      if (content.startsWith("@") || /^<.*>\s+@.*/.test(content)) {
        currentPrefix = content.split("@")[1].trim() + " ";
        // console.log("change currentPrefix: ", currentPrefix);
        i++;
        indent += 4;
        continue;
      }

      // console.log("content:", content);
      // console.log("currentPrefix:", currentPrefix);
      const nodeContent = `${currentPrefix} ${content}`.trim();
      const children = [];

      const childLines = [];
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].search(/\S|$/) > indent) {
          childLines.push(lines[j]);
        } else {
          break;
        }
      }

      if (childLines.length > 0) {
        const childIndent = childLines[0].search(/\S|$/);
        const parsedChildren = parseTree(
          childLines,
          childIndent,
          currentPrefix
        );
        children.push(...parsedChildren);
      }

      result.push({ content: nodeContent, children });
      i += childLines.length;
    }

    i++;
  }

  return result;
}

function convertTreeToJSON(input: string) {
  const lines = input.split("\n");
  const rootIndent = lines[0].search(/\S|$/);
  return parseTree(lines, rootIndent);
}

function createNode(label: string, id: string, x: number, y: number): Node {
  return {
    id,
    position: {
      x,
      y,
    },
    data: {
      label,
    },
  };
}

function createEdge(id: string, source: string, target: string): Edge {
  return {
    id,
    source,
    target,
  };
}

async function parseResult(
  result: Result,
  xOffset: number = 0,
  yOffset: number = 0,
  lastNodeId: string | null = null,
  siblingIndex: number = 0,
  siblingNodes: string[] = [] // sibling nodes' ids
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const currentId = await hashContent(result.content);

  const adjustedXOffset = xOffset + siblingIndex * 300;

  const node = createNode(result.content, currentId, adjustedXOffset, yOffset);
  const nodes = [node];
  const edges = [];

  if (lastNodeId !== null) {
    edges.push(
      createEdge(`edge-${lastNodeId}-${currentId}`, lastNodeId, currentId)
    );
  }

  const childYOffset = yOffset + 300;
  const childNodeIds: string[] = [];

  for (let index = 0; index < result.children.length; index++) {
    const child = result.children[index];
    console.log("child: ", child)
    if (child.content.startsWith("<all>")) {
      for (const siblingId of siblingNodes) {
        const sharedChildResult = await parseResult(
          { ...child, content: child.content.replace("<all>", "").trim() },
          xOffset,
          childYOffset,
          siblingId
        );
        console.log("sharedChildResult", sharedChildResult)
        nodes.push(...sharedChildResult.nodes);
        edges.push(...sharedChildResult.edges);
      }
    } else {
      const childResult = await parseResult(
        result.children[index],
        xOffset,
        childYOffset,
        currentId,
        index,
        siblingNodes.length > 0 ? siblingNodes : [currentId]
      );
      nodes.push(...childResult.nodes);
      edges.push(...childResult.edges);
      childNodeIds.push(childResult.nodes[0].id);
    }
  }

  childNodeIds.forEach((childId) => {
    edges.push(createEdge(`edge-${currentId}-${childId}`, currentId, childId));
  });

  return { nodes, edges };
}

export async function createFlow(input: string) {
  const subtrees = input
    .split("%Partly from")
    .map((s) => s.split("%External"))
    .flat()
    .splice(1)
    .map((s) => (s.startsWith("\n") ? s.slice(1) : s)); // Remove leading \n
  console.log("subtrees", subtrees);

  const mapped = await Promise.all(
    subtrees.map(async (subtree, index) => {
      const data = convertTreeToJSON(subtree);
      // console.log("Data++++", data);

      if (data.length === 0) return { nodes: [], edges: [] };

      const { nodes, edges } = await parseResult(data[0], index * 500);
      return { nodes, edges };
    })
  );

  const combined = mapped.reduce(
    (acc, cur) => {
      acc.nodes.push(...cur.nodes);
      acc.edges.push(...cur.edges);
      return acc;
    },
    { nodes: [], edges: [] }
  );

  console.log("=====Mapped=======", mapped);

  return combined;
}

export function suspenderFn<T>(asyncFn: () => Promise<T>) {
  let status = "pending";
  let result: T;
  let error: any;

  const suspender = asyncFn()
    .then((res) => {
      status = "success";
      result = res;
    })
    .catch((err) => {
      status = "error";
      error = err;
    });

  return {
    read: () => {
      if (status === "pending") {
        throw suspender;
      } else if (status === "error") {
        throw error;
      } else {
        return result;
      }
    },
  };
}
