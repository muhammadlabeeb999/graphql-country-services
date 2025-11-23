import React from 'react'
import CountrySearch from './components/CountrySearch'
import AddCountryForm from './components/AddCountryForm'
import CountriesList from './components/CountriesList'
import CountriesNear from './components/CountriesNear'

export default function App() {
    return (
        <div className="container">
            <h1>Countries — GraphQL Frontend</h1>

            <CountrySearch />
            <hr />
            <AddCountryForm />
            <hr />
            <CountriesList initialLimit={10} />
            <hr />
            <CountriesNear />
        </div>
    )
}
