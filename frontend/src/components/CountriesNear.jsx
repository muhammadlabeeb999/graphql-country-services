// src/components/CountriesNear.jsx
import React, { useState } from 'react'
import { GET_COUNTRIES_NEAR } from '../graphql/queries'
import { graphqlFetch } from '../graphql/fetcher'

export default function CountriesNear() {
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    const [radius, setRadius] = useState(500)
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
                radiusKm: parseFloat(radius),
                limit: parseInt(limit, 10)
            }

            const data = await graphqlFetch({ query: GET_COUNTRIES_NEAR, variables: vars })
            setResults(data.countriesNear || [])
        } catch (e) {
            setErr(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card">
            <h2>Search Countries Near (Lat/Lon)</h2>
            <form onSubmit={search} className="grid-form" style={{ alignItems: 'end' }}>
                <input
                    className="input"
                    required
                    placeholder="Latitude *"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    type="number"
                    step="any"
                />
                <input
                    className="input"
                    required
                    placeholder="Longitude *"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    type="number"
                    step="any"
                />
                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Searching…' : 'Search'}
                </button>
            </form>

            {err && <div className="error-msg">{err}</div>}
            {loading && <div style={{ marginTop: '1rem' }}>Loading...</div>}

            <div className="countries-grid" style={{ marginTop: '1.5rem' }}>
                {results.map(c => (
                    <div key={c.id} className="country-card">
                        {c.flagUrl && (
                            <div className="flag-container">
                                <img src={c.flagUrl} alt={`${c.name} flag`} className="flag-img" />
                            </div>
                        )}
                        <div className="country-info">
                            <div className="country-name">{c.name}</div>
                            <div className="country-detail">{c.alpha2Code}</div>
                            <div className="country-detail"><strong>Capital:</strong> {c.capital || '—'}</div>
                            <div className="country-detail"><strong>Coords:</strong> {c.latitude?.toFixed(2)}, {c.longitude?.toFixed(2)}</div>
                        </div>
                    </div>
                ))}
            </div>
            {!loading && results.length === 0 && <div style={{ marginTop: '1rem', color: 'gray' }}>No results</div>}
        </div>
    )
}
