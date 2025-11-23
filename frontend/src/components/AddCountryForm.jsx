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

function parseMaybeJson(value) {
    if (value === null || value === undefined || value === '') return null
    if (typeof value === 'object') return value
    try {
        return JSON.parse(value)
    } catch (err) {
        return value
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
        timezones: parseMaybeJson(form.timezones),
        currencies: parseMaybeJson(form.currencies),
        languages: parseMaybeJson(form.languages)
    }
}

export default function AddCountryForm() {
    const [form, setForm] = useState(empty())
    const [msg, setMsg] = useState(null)
    const [loading, setLoading] = useState(false)

    function setField(k, v) {
        setForm((f) => ({ ...f, [k]: v }))
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

        // If latitude/longitude are provided they must be valid floats
        if (form.latitude !== '' && isNaN(Number(form.latitude))) {
            setMsg({ type: 'error', text: 'Latitude must be a number.' })
            return
        }
        if (form.longitude !== '' && isNaN(Number(form.longitude))) {
            setMsg({ type: 'error', text: 'Longitude must be a number.' })
            return
        }

        const countryPayload = toGraphqlCountryInput(form)

        setLoading(true)
        try {
            const data = await graphqlFetch({
                query: ADD_COUNTRY,
                variables: { countryData: countryPayload }
            })

            if (data.addCountry.ok) {
                setMsg({ type: 'success', text: 'Country added: ' + data.addCountry.country.name })
                setForm(empty())
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
                <input className="input" placeholder="Alpha3 code" value={form.alpha3_code} onChange={(e) => setField('alpha3_code', e.target.value)} />
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

                <textarea
                    className="textarea"
                    placeholder='timezones (JSON array) e.g. ["UTC+5:30"]'
                    value={form.timezones}
                    onChange={(e) => setField('timezones', e.target.value)}
                    style={{ gridColumn: '1 / -1' }}
                />
                <textarea
                    className="textarea"
                    placeholder='currencies (JSON) e.g. {"INR":{"name":"Rupee","symbol":"₹"}}'
                    value={form.currencies}
                    onChange={(e) => setField('currencies', e.target.value)}
                    style={{ gridColumn: '1 / -1' }}
                />
                <textarea
                    className="textarea"
                    placeholder='languages (JSON) e.g. {"eng":"English"}'
                    value={form.languages}
                    onChange={(e) => setField('languages', e.target.value)}
                    style={{ gridColumn: '1 / -1' }}
                />

                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Adding…' : 'Add Country'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setForm(empty())} disabled={loading}>
                        Reset
                    </button>
                </div>
            </form>

            {msg && <div className={msg.type === 'error' ? 'error-msg' : 'success-msg'}>{msg.text}</div>}
        </div>
    )
}
