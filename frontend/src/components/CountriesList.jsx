// src/components/CountriesList.jsx
import React, { useEffect, useState } from 'react'
import { GET_COUNTRIES } from '../graphql/queries'
import { graphqlFetch } from '../graphql/fetcher'

export default function CountriesList({ initialLimit = 10 }) {
  const [limit] = useState(initialLimit)
  const [offset, setOffset] = useState(0)
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)

  async function load() {
    setLoading(true); setErr(null)
    try {
      const data = await graphqlFetch({ query: GET_COUNTRIES, variables: { limit, offset } })
      setCountries(data.countries || [])
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [offset])

  return (
    <div>
      <h2>Countries (paginated)</h2>
      {err && <div style={{ color: 'crimson' }}>{err}</div>}
      {loading && <div>Loading...</div>}
      {!loading && countries.length === 0 && <div>No countries found.</div>}
      <ul>
        {countries.map(c => (
          <li key={c.id}>
            <strong>{c.name}</strong> {c.alpha2Code && `(${c.alpha2Code})`} — {c.capital || '—'} — {c.region || '—'} — {c.population ?? '—'}
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0}>Previous</button>
        <button onClick={() => setOffset(offset + limit)} disabled={countries.length < limit}>Next</button>
        <div style={{ marginLeft: 12, alignSelf: 'center' }}>offset: {offset}</div>
      </div>
    </div>
  )
}
