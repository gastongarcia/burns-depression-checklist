import React from "react";
import { request } from "../lib/datocms";
import Question from "../src/components/question";

const HOMEPAGE_QUERY = `query MyQuery {
  allQuestions(orderBy: _createdAt_ASC) {
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
  return (
    <div>
      {data.allQuestions.map((question) => (
        <Question
          question={question.question}
          category={question.category.category}
        />
      ))}
    </div>
  );
};

export default IndexPage;
