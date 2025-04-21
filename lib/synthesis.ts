import { z } from "zod";

export const synthesisSchema = z
  .object({
    reasoningSteps: z
      .array(z.string())
      .describe("The reasoning steps taken by the model to generate the synthesis."),
    nodes: z
      .array(
        z
          .object({
            id: z.string().describe("Unique identifier for the node."),
            data: z
              .object({
                label: z.string().describe("Label of the node."),
              })
              .strict(),
          })
          .strict()
      )
      .describe("Array of nodes in the tree diagram."),
    edges: z
      .array(
        z
          .object({
            id: z.string().describe("Unique identifier for the edge."),
            source: z.string().describe("The ID of the source node."),
            target: z.string().describe("The ID of the target node."),
          })
          .strict()
      )
      .describe("Array of edges connecting the nodes in the diagram."),
  })
  .strict();

export type SynthesisResponse = z.infer<typeof synthesisSchema>; 