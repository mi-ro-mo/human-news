// import { useEffect, useState } from "react";
import { Configuration, OpenAIApi } from "openai";
import { motion } from "framer-motion";
import "./index.css";
import fetchMachine from "./fetch";
import { useMachine } from "@xstate/react";
import logo from "./spinner.gif";
import { useEffect } from "react";

const configuration = new Configuration({
  organization: import.meta.env.VITE_OPEN_AI_ORG,
  apiKey: import.meta.env.VITE_OPEN_AI_API,
});

const openai = new OpenAIApi(configuration);

const prompt = import.meta.env.VITE_PROMPT;
const quips = import.meta.env.VITE_LOADING_QUIPS.split("*");

function App() {
  const [state, send] = useMachine(fetchMachine, {
    actions: {
      fetchData: async (ctx, event) => {
        const response = await openai
          .createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            temperature: 0.6,
            max_tokens: 2048,
          })
          .then((res) => {
            const resp = res.data.choices[0].text as string;
            const ret = formatString(resp);
            send({ type: "RESOLVE", results: ret });
          })
          .catch((err) => {
            send({ type: "REJECT", message: err });
          });
      },
    },
  });

  useEffect(() => {
    const onPageLoad = () => {
      send({ type: "FETCH" });
    };

    if (document.readyState === "complete") {
      onPageLoad();
    } else {
      window.addEventListener("load", onPageLoad);
      return () => window.removeEventListener("load", onPageLoad);
    }
  }, []);

  return (
    <div className=" flex flex-col items-center w-screen h-full min-h-screen min-w-screen bg-gray-400 overflow-x-hidden">
      <div className="w-full sm:w-1/3 m:w-2/3 bg-gray-300 h-30 rounded-lg m-3 flex flex-row justify-center drop-shadow-md">
        <div className="flex flex-col w-full text-left">
          <h1 className="text-4xl font-bold m-5 float-left">Human News</h1>
          <p className="my-3 mx-5">News for humans, by... humans?</p>
        </div>
        {(state.matches("idle") || state.matches("success")) && (
          <button
            type="button"
            className="h-3/4 min-w-[125px] text-white self-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 m-2 mr-5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={() => send({ type: "FETCH" })}
          >
            New News
          </button>
        )}
        {state.matches("failed") && (
          <button
            type="button"
            className="h-3/4 min-w-[125px] text-white self-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 m-2 mr-5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={() => send({ type: "FETCH" })}
          >
            Retry
          </button>
        )}
        {state.matches("pending") && (
          <button
            type="button"
            className="h-3/4 min-w-[125px] text-white self-center bg-blue-400  font-medium rounded-lg text-sm px-5 py-2.5 m-2 mr-5 "
            disabled
          >
            Loading...
          </button>
        )}
      </div>

      {state.matches("pending") && (
        <motion.div
          className="w-full sm:w-1/3 h-1/3 min-h-[200px] min-w-[200px] bg-gray-200 rounded-lg m-3 p-3 grid place-items-center drop-shadow-md text-center"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          exit={{ opacity: 0 }}
        >
          <img src={logo} alt="loading..." />
          {quips[Math.floor(Math.random() * quips.length)]}
        </motion.div>
      )}

      {state.matches("success") && (
        <motion.div
          className=" w-full sm:w-1/3 min-h-[500px] bg-gray-200 rounded-lg m-3 p-5 drop-shadow-md"
          animate={{ opacity: [0, 1] }}
        >
          {state.matches("success") && state.context.results}
        </motion.div>
      )}
      {state.matches("failed") && (
        <motion.div
          className=" w-full sm:w-1/3 h-1/2 min-h-[500px] bg-gray-200 rounded-lg m-3 p-5 drop-shadow-md"
          animate={{ opacity: [0, 1] }}
        >
          {state.matches("failed") && state.context.message}
        </motion.div>
      )}
      <p className="w-full sm:w-1/5 h-[5vh]  text-stone-600 text-center">
        * Generated entirely by Artifical Intelligence *
      </p>
    </div>
  );
}

function formatString(str: string) {
  const text = str.split("[*]");

  return (
    <>
      <h2 className="text-xl font-bold">
        {text[0].replace("TITLE:", "").replace("Title:", "")}
      </h2>
      <br />
      {text.slice(1).map((paragraph) => (
        <>
          <p key={paragraph.slice(5)}>{paragraph}</p>
          <br />
        </>
      ))}
    </>
  );
}
export default App;
