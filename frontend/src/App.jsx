import React from 'react'
import CountrySearch from './components/CountrySearch'
import AddCountryForm from './components/AddCountryForm'
import CountriesList from './components/CountriesList'
import CountriesNear from './components/CountriesNear'

export default function App(){
  return (
    <div style={{fontFamily:'Inter, system-ui, sans-serif', padding:20, maxWidth:900, margin:'0 auto'}}>
      <h1>Countries — GraphQL frontend</h1>

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
