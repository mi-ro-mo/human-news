import { assign, createMachine } from "xstate";

// interface FetchStates {
//   states: {
//     idle: {};
//     pending: {};
//     success: {};
//     failed: {};
//   };
// }

// type FetchEvents =
//   | { type: "FETCH" }
//   | { type: "RESOLVE"; results: any[] }
//   | { type: "REJECT"; message: string }
//   | { type: "RETRY" };

// interface FetchContext {
//   retries: number;
//   results: any[];
//   message: string;
// }

const fetchMachine = createMachine<{
  retries: number;
  results: any[];
  message: string;
}>(
  {
    predictableActionArguments: true,
    id: "fetch",
    initial: "idle",
    context: {
      retries: 0,
      results: [],
      message: "",
    },
    states: {
      idle: {
        on: {
          FETCH: "pending",
        },
      },
      pending: {
        entry: ["fetchData"],
        on: {
          RESOLVE: { target: "success", actions: ["setResults"] },
          REJECT: { target: "failure", actions: ["setMessage"] },
        },
      },
      success: {
        on: {
          FETCH: "pending",
        },
      },
      failure: {
        on: {
          RETRY: {
            target: "pending",
            actions: assign({
              retries: (context, event) => context.retries + 1,
            }),
          },
        },
      },
    },
  },
  {
    actions: {
      setResults: assign((ctx, event: any) => ({
        results: event.results,
      })),
      setMessage: assign((ctx, event: any) => ({
        message: event.message,
      })),
    },
  }
);

export default fetchMachine;
// Source: https://egghead.io/lessons/react-handle-http-request-state-with-xstate
