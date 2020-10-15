import React from "react";

const Question = (props) => {
  return (
    <div className="rounded bg-gray-300 p-5 my-8" key={props.qid}>
      <div className="q">
        <p className="text-xs">
          {props.qid} Category:{" "}
          <span className="font-bold blue-600 p-1 rounded-sm">
            {props.category}
          </span>
        </p>
        <p className="text-3xl">{props.question}</p>
      </div>

      <div className="a mt-8">
        <button className="px-2 py-1 bg-blue-300 rounded mr-2">
          Not at all
        </button>
        <button className="px-2 py-1 bg-green-300 rounded mr-2">
          Somewhat
        </button>
        <button className="px-2 py-1 bg-teal-300 rounded mr-2">
          Moderately
        </button>
        <button className="px-2 py-1 bg-indigo-400 rounded mr-2">A lot</button>
        <button className="px-2 py-1 bg-red-400 rounded mr-2">Extremely</button>
      </div>
    </div>
  );
};

export default Question;
