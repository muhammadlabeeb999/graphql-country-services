import React, { useState } from 'react'
import { GET_COUNTRY_BY_NAME } from '../graphql/queries'
import { graphqlFetch } from '../graphql/fetcher'

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
            const data = await graphqlFetch({
                query: GET_COUNTRY_BY_NAME,
                variables: { name }
            })

            const c = data.country

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
        <div className="card">
            <h2>Search Country by Name</h2>
            <form onSubmit={search} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. India"
                    required
                />
                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Searching…' : 'Search'}
                </button>
            </form>

            {error && <div className="error-msg">Error: {error}</div>}
            {notFound && !error && <div style={{ color: 'gray' }}>No country found.</div>}

            {country && (
                <div className="country-card" style={{ maxWidth: 400 }}>
                    {country.flagUrl && (
                        <div className="flag-container">
                            <img src={country.flagUrl} alt={`${country.name} flag`} className="flag-img" />
                        </div>
                    )}
                    <div className="country-info">
                        <div className="country-name">{country.name} ({country.alpha2Code})</div>
                        <div className="country-detail"><strong>Capital:</strong> {country.capital}</div>
                        <div className="country-detail"><strong>Region:</strong> {country.region} — {country.subregion}</div>
                        <div className="country-detail"><strong>Population:</strong> {country.population}</div>
                        <div className="country-detail"><strong>Coordinates:</strong> {country.latitude}, {country.longitude}</div>
                    </div>
                </div>
            )}
        </div>
    )
}
