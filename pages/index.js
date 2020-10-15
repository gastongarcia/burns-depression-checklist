import React, { useState, useEffect } from "react";
import { request } from "../lib/datocms";
import _ from 'lodash'

/** @jsx jsx */
import { jsx } from "theme-ui";

import Question from "../src/components/question";

const HOMEPAGE_QUERY = `query MyQuery {
  allQuestions(orderBy: _createdAt_ASC) {
    id
    question
    category {
      category
    }
  }
}
`;

export async function getStaticProps() {
  const data = await request({
    query: HOMEPAGE_QUERY,
    variables: { limit: 20 },
  });
  return {
    props: { data },
  };
}

const IndexPage = ({ data }) => {
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState(_.map(data.allQuestions, q => {
    return { ...q, score: 0 }
  }));

  console.log("Questions:", JSON.stringify(questions, null, 2));

  useEffect(() => {

    const questionsScores = _.sumBy(questions, 'score');
    setScore(questionsScores)

  }, [questions])

  const setQuestion = (question) => {
    const clonedQuestions = _.cloneDeep(questions)
      var questionIndex = _.findIndex(clonedQuestions, { id: question.id });
      clonedQuestions.splice(questionIndex, 1, question)
      setQuestions(clonedQuestions);
  }

  return (
    <div>
      <h1>{score}</h1>
      {questions.map((question) => (
        <Question
          key={question.id}
          question={question}
          setQuestion={setQuestion}
        />
      ))}
    </div>
  );
};

export default IndexPage;
