import React, { useState } from 'react'
import { GET_COUNTRY_BY_NAME } from '../graphql/queries'
import { graphqlFetch } from '../graphql/fetcher'

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || '/graphql'

export default function CountrySearch() {
  const [name, setName] = useState('')
  const [country, setCountry] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function search(e) {
    e?.preventDefault()
    setError(null)
    setNotFound(false)
    setCountry(null)

    if (!name.trim()) return

    try {
      setLoading(true)

      const res = await fetch(graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: GET_COUNTRY_BY_NAME, variables: { name } })
      })

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        const text = await res.text()
        throw new Error('Expected JSON, got: ' + text.slice(0, 200))
      }

      const json = await res.json()
      if (json.errors) {
        setError(json.errors[0].message)
        return
      }

      const c = json.data.country

      if (!c) {
        setNotFound(true)
      } else {
        setCountry(c)
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Search country by name</h2>
      <form onSubmit={search} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. India"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <div style={{ color: 'crimson' }}>Error: {error}</div>}
      {notFound && !error && <div style={{ color: 'gray' }}>No country found.</div>}

      {country && (
        <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
          <h3>{country.name} ({country.alpha2Code})</h3>
          <div>Capital: {country.capital}</div>
          <div>Region: {country.region} — {country.subregion}</div>
          <div>Population: {country.population}</div>
          <div>Coordinates: {country.latitude}, {country.longitude}</div>
          {country.flagUrl && (
            <img src={country.flagUrl} alt="flag" style={{ height: 40, marginTop: 8 }} />
          )}
        </div>
      )}
    </div>
  )
}
