// src/components/AddCountryForm.jsx
import React, { useState } from 'react'
import { ADD_COUNTRY } from '../graphql/queries'
import { graphqlFetch } from '../graphql/fetcher'

function empty() {
    return {
        name: '',
        alpha2_code: '',
        alpha3_code: '',
        capital: '',
        region: '',
        subregion: '',
        population: '',
        area_km2: '',
        latitude: '',
        longitude: '',
        flag_url: '',
        timezones: '',
        currencies: '',
        languages: ''
    }
}


function toGraphqlCountryInput(form) {
    return {
        name: (form.name || '').trim(),
        alpha2Code: (form.alpha2_code || form.alpha2Code || '').toString().trim().toUpperCase(),
        alpha3Code: form.alpha3_code || form.alpha3Code || null,
        capital: form.capital || null,
        region: form.region || null,
        subregion: form.subregion || null,
        population:
            form.population !== '' && form.population !== null && form.population !== undefined
                ? Number(form.population)
                : null,
        areaKm2:
            form.area_km2 !== '' && form.area_km2 !== null && form.area_km2 !== undefined
                ? Number(form.area_km2)
                : null,
        latitude:
            form.latitude !== '' && form.latitude !== null && form.latitude !== undefined
                ? parseFloat(form.latitude)
                : null,
        longitude:
            form.longitude !== '' && form.longitude !== null && form.longitude !== undefined
                ? parseFloat(form.longitude)
                : null,
        flagUrl: form.flag_url || form.flagUrl || null,
        timezones: null, // handled in submit
        currencies: null, // handled in submit
        languages: null // handled in submit
    }
}

export default function AddCountryForm() {
    const [form, setForm] = useState(empty())
    const [msg, setMsg] = useState(null)
    const [loading, setLoading] = useState(false)

    // Extra state for structured inputs
    const [currencyCode, setCurrencyCode] = useState('')
    const [currencyName, setCurrencyName] = useState('')
    const [langCode, setLangCode] = useState('')
    const [langName, setLangName] = useState('')

    function setField(k, v) {
        setForm((f) => ({ ...f, [k]: v }))
    }

    function resetForm() {
        setForm(empty())
        setCurrencyCode('')
        setCurrencyName('')
        setLangCode('')
        setLangName('')
    }

    async function submit(e) {
        e?.preventDefault()
        setMsg(null)

        // client-side required validation
        if (!form.name || !form.name.trim()) {
            setMsg({ type: 'error', text: 'Name is required.' })
            return
        }
        if (!form.alpha2_code || !form.alpha2_code.trim()) {
            setMsg({ type: 'error', text: 'Alpha-2 code is required.' })
            return
        }
        if (form.alpha3_code && form.alpha3_code.trim().length !== 3) {
            setMsg({ type: 'error', text: 'Alpha-3 code must be exactly 3 characters.' })
            return
        }

        // If latitude/longitude are provided they must be valid floats
        if (form.latitude !== '' && isNaN(Number(form.latitude))) {
            setMsg({ type: 'error', text: 'Latitude must be a number.' })
            return
        }
        if (form.longitude !== '' && isNaN(Number(form.longitude))) {
            setMsg({ type: 'error', text: 'Longitude must be a number.' })
            return
        }

        // Construct JSON objects from structured inputs
        let currencies = null
        if (currencyCode.trim()) {
            currencies = {
                [currencyCode.trim().toUpperCase()]: {
                    name: currencyName.trim(),
                    symbol: ''
                }
            }
        }

        let languages = null
        if (langCode.trim()) {
            languages = {
                [langCode.trim().toLowerCase()]: langName.trim()
            }
        }

        // Parse timezones from comma-separated string
        let timezones = null
        if (form.timezones && form.timezones.trim()) {
            timezones = form.timezones.split(',').map(t => t.trim()).filter(Boolean)
        }

        const countryPayload = {
            ...toGraphqlCountryInput(form),
            currencies,
            languages,
            timezones
        }

        setLoading(true)
        try {
            const data = await graphqlFetch({
                query: ADD_COUNTRY,
                variables: { countryData: countryPayload }
            })

            if (data.addCountry.ok) {
                setMsg({ type: 'success', text: 'Country added: ' + data.addCountry.country.name })
                resetForm()
            } else {
                setMsg({ type: 'error', text: 'Add failed' })
            }
        } catch (err) {
            setMsg({ type: 'error', text: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card">
            <h2>Add Country</h2>
            <form onSubmit={submit} className="grid-form">
                <input
                    className="input"
                    required
                    placeholder="Name *"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                />
                <input
                    className="input"
                    required
                    placeholder="Alpha2 code * (e.g. IN)"
                    value={form.alpha2_code}
                    onChange={(e) => setField('alpha2_code', e.target.value)}
                    maxLength={2}
                />
                <input
                    className="input"
                    placeholder="Alpha3 code"
                    value={form.alpha3_code}
                    onChange={(e) => setField('alpha3_code', e.target.value)}
                    maxLength={3}
                />
                <input className="input" placeholder="Capital" value={form.capital} onChange={(e) => setField('capital', e.target.value)} />
                <input className="input" placeholder="Region" value={form.region} onChange={(e) => setField('region', e.target.value)} />
                <input className="input" placeholder="Subregion" value={form.subregion} onChange={(e) => setField('subregion', e.target.value)} />
                <input
                    className="input"
                    placeholder="Population"
                    value={form.population}
                    onChange={(e) => setField('population', e.target.value ? parseInt(e.target.value, 10) : '')}
                />
                <input
                    className="input"
                    placeholder="Area (km²)"
                    value={form.area_km2}
                    onChange={(e) => setField('area_km2', e.target.value)}
                />

                {/* FLOAT inputs for coordinates */}
                <input
                    className="input"
                    placeholder="Latitude (float)"
                    value={form.latitude}
                    onChange={(e) => setField('latitude', e.target.value)}
                    type="number"
                    step="any"
                />
                <input
                    className="input"
                    placeholder="Longitude (float)"
                    value={form.longitude}
                    onChange={(e) => setField('longitude', e.target.value)}
                    type="number"
                    step="any"
                />

                <input className="input" placeholder="Flag URL" value={form.flag_url} onChange={(e) => setField('flag_url', e.target.value)} />

                <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input
                        className="input"
                        placeholder="Currency Code (e.g. USD)"
                        value={currencyCode}
                        onChange={(e) => setCurrencyCode(e.target.value)}
                    />
                    <input
                        className="input"
                        placeholder="Currency Name (e.g. Dollar)"
                        value={currencyName}
                        onChange={(e) => setCurrencyName(e.target.value)}
                    />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input
                        className="input"
                        placeholder="Language Code (e.g. en)"
                        value={langCode}
                        onChange={(e) => setLangCode(e.target.value)}
                    />
                    <input
                        className="input"
                        placeholder="Language Name (e.g. English)"
                        value={langName}
                        onChange={(e) => setLangName(e.target.value)}
                    />
                </div>

                <input
                    className="input"
                    placeholder="Timezones (comma separated, e.g. UTC+1, UTC+2)"
                    value={form.timezones}
                    onChange={(e) => setField('timezones', e.target.value)}
                    style={{ gridColumn: '1 / -1' }}
                />

                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Adding…' : 'Add Country'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={loading}>
                        Reset
                    </button>
                </div>
            </form>

            {msg && <div className={msg.type === 'error' ? 'error-msg' : 'success-msg'}>{msg.text}</div>}
        </div>
    )
}
