import { useState, useEffect, useRef } from 'react';

const useDataFetcher = (endpoint) => {
  const updateRef = useRef(0);
  const [data, setData] = useState([]);

  // Subscribe to endpoint changes



  useEffect(() => {
    fetch(endpoint)
      .then((response) => response.json())
      .then((data) => setData(data));
  }, [endpoint]);

  return data;
};


const ConceptForFetching = () => {
  const [data, setData] = useDataFetcher('api/endpoint');

  return (
    <div>
    {
      data.map((item) => {
        return (
          <div>
          <h1>{ item.name } < /h1>
          < p > { item.email } < /p>
          < /div>
        )
      })
        < /div>
  )
}