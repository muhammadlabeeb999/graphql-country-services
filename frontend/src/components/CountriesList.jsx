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
        <div className="card">
            <h2>Countries (Paginated)</h2>
            {err && <div className="error-msg">{err}</div>}
            {loading && <div>Loading...</div>}
            {!loading && countries.length === 0 && <div>No countries found.</div>}

            <div className="countries-grid">
                {countries.map(c => (
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
                            <div className="country-detail"><strong>Region:</strong> {c.region || '—'}</div>
                            <div className="country-detail"><strong>Pop:</strong> {c.population ?? '—'}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pagination">
                <button className="btn btn-secondary" onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0}>Previous</button>
                <span style={{ fontWeight: 500 }}>Offset: {offset}</span>
                <button className="btn btn-secondary" onClick={() => setOffset(offset + limit)} disabled={countries.length < limit}>Next</button>
            </div>
        </div>
    )
}
