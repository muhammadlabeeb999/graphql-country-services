// src/graphql/queries.js
export const GET_COUNTRY_BY_NAME = `
query Country($name: String){
  country(name: $name){
    id
    name
    alpha2Code
    alpha3Code
    capital
    region
    subregion
    population
    latitude
    longitude
    flagUrl
    timezones
    currencies
    languages
  }
}
`

export const ADD_COUNTRY = `
mutation AddCountry($countryData: CountryInput!){
  addCountry(countryData: $countryData){
    ok
    country{
      id
      name
      alpha2Code
    }
  }
}
`

export const GET_COUNTRIES = `
query Countries($limit: Int = 10, $offset: Int = 0) {
  countries(limit: $limit, offset: $offset) {
    id
    name
    alpha2Code
    capital
    region
    population
    flagUrl
  }
}
`

// Note: using radiusKm (camelCase). If server expects radius_km, rename radiusKm -> radius_km in variables + query.
export const GET_COUNTRIES_NEAR = `
query CountriesNear($latitude: Float!, $longitude: Float!, $radiusKm: Float = 500.0, $limit: Int = 10) {
  countriesNear(latitude: $latitude, longitude: $longitude, radiusKm: $radiusKm, limit: $limit) {
    id
    name
    alpha2Code
    capital
    region
    population
    latitude
    longitude
    flagUrl
  }
}
`
