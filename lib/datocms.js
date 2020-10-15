import { GraphQLClient } from "graphql-request";
export function request({ query, variables, preview }) {
  const endpoint = preview
    ? `https://graphql.datocms.com/preview`
    : `https://graphql.datocms.com/`;
  const client = new GraphQLClient(endpoint, {
    headers: {
      // authorization: `Bearer ${process.env.NEXT_DATOCMS_API_TOKEN}`,
      authorization: `Bearer bfa62729f9176ebdd855caa91ddaa6`,
    },
  });
  return client.request(query, variables);
}
