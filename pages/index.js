import React, { useState } from "react";
import { request } from "../lib/datocms";
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
  console.log("Score:", score);

  const allQuestions = [];

  return (
    <div>
      {data.allQuestions.map((question) => (
        <Question
          qid={question.id}
          question={question.question}
          category={question.category.category}
        />
      ))}
    </div>
  );
};

export default IndexPage;
