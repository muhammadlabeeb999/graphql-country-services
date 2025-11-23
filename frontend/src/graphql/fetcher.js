// src/graphql/fetcher.js
const graphqlUrl = '/graphql';

export async function graphqlFetch({ query, variables }) {
  const res = await fetch(graphqlUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error('Expected JSON response but got: ' + text.slice(0, 400));
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map(e => e.message).join('; '));
  }
  return json.data;
}
