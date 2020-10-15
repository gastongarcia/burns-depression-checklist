import React from "react";
/** @jsx jsx */
import { jsx } from "theme-ui";
import { Button } from "theme-ui";

const Question = (props) => {
  return (
    <div key={props.qid}>
      <div className="q">
        <p>
          {props.qid} Category: <span>{props.category}</span>
        </p>
        <h2>{props.question}</h2>
      </div>

      <div>
        <Button mr={2}>Not at all</Button>
        <Button mr={2}>Somewhat</Button>
        <Button mr={2}>Moderately</Button>
        <Button mr={2}>A lot</Button>
        <Button>Extremely</Button>
      </div>
    </div>
  );
};

export default Question;
