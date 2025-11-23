// src/components/CountriesNear.jsx
import React, { useState } from 'react'
import { GET_COUNTRIES_NEAR } from '../graphql/queries'
import { graphqlFetch } from '../graphql/fetcher'

export default function CountriesNear() {
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [radius, setRadius] = useState(500) // optional, but not exposed in UI if you don't want it
  const [limit, setLimit] = useState(10)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)

  async function search(e) {
    e?.preventDefault()
    setErr(null)
    setResults([])

    // required validation
    if (latitude === '' || latitude === null) {
      setErr('Latitude is required.')
      return
    }
    if (longitude === '' || longitude === null) {
      setErr('Longitude is required.')
      return
    }
    if (isNaN(Number(latitude))) {
      setErr('Latitude must be a number.')
      return
    }
    if (isNaN(Number(longitude))) {
      setErr('Longitude must be a number.')
      return
    }

    setLoading(true)
    try {
      const vars = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radiusKm: parseFloat(radius), // if backend expects radius_km, change in query/variables accordingly
        limit: parseInt(limit, 10)
      }

      const data = await graphqlFetch({ query: GET_COUNTRIES_NEAR, variables: vars })
      // expecting minimal fields: latitude & longitude (per your requirement)
      // GraphQL response field name here is countriesNear
      setResults(data.countriesNear || [])
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Search countries near (lat/lon)</h2>
      <form onSubmit={search} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          required
          placeholder="Latitude *"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          type="number"
          step="any"
        />
        <input
          required
          placeholder="Longitude *"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          type="number"
          step="any"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {err && <div style={{ color: 'crimson', marginTop: 8 }}>{err}</div>}
      {loading && <div>Loading...</div>}

      <ul style={{ marginTop: 8 }}>
        {results.map(c => (
          <li key={c.id}>
            <strong>{c.name}</strong> {c.alpha2Code && `(${c.alpha2Code})`} — {c.capital || '—'} — coords: {c.latitude ?? '—'},{c.longitude ?? '—'}
          </li>
        ))}
      </ul>
      {!loading && results.length === 0 && <div style={{ marginTop: 8 }}>No results</div>}
    </div>
  )
}
