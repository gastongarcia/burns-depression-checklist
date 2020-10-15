import React, { memo, useState } from "react";
/** @jsx jsx */
import { jsx } from "theme-ui";
import { Button } from "theme-ui";
import _ from 'lodash'

const Question = ({ question, setQuestion }) => {

  const setScore = (score) => {
    const clonedQuestion = _.cloneDeep(question);
    clonedQuestion.score = score;
    setQuestion(clonedQuestion);
  }

  return (
    <div key={question.qid}>
      <div className="q">
        <p>
          Category: <span>{question.category.category}</span>
        </p>
        <h2>{question.question}</h2>
      </div>
      <div>
        <Button mr={2} onClick={() => {
          setScore(0);
        }}>Not at all</Button>
        <Button mr={2} onClick={() => {
          setScore(1);
        }}>Somewhat</Button>
        <Button mr={2} onClick={() => {
          setScore(2);
        }}>Moderately</Button>
        <Button mr={2} onClick={() => {
          setScore(3);
        }}>A lot</Button>
        <Button onClick={() => {
          setScore(4);
        }}>Extremely</Button>
      </div>
    </div>
  );
};

export default memo(Question);
