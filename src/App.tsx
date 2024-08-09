import React, { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, DirectionsService, DirectionsRenderer, Libraries } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px"
};

const center = {
  lat: 35.6895,
  lng: 139.6917
};

const libraries : Libraries = ["places"];

const App: React.FC = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [response, setResponse] = useState<google.maps.DirectionsResult | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY??"",
    libraries,
  });

  const handleDirectionsCallback = useCallback((res: google.maps.DirectionsResult | null) => {
    if (res !== null) {
      setResponse(res);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResponse(null);
  };

  return isLoaded ? (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Origin: </label>
          <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} />
        </div>
        <div>
          <label>Destination: </label>
          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} />
        </div>
        <button type="submit">Get Directions</button>
      </form>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
        {origin !== "" && destination !== "" && (
          <DirectionsService
            options={{
              origin: origin,
              destination: destination,
              travelMode: google.maps.TravelMode.DRIVING,
              provideRouteAlternatives: true
            }}
            callback={handleDirectionsCallback}
          />
        )}
        {response !== null && (
          <>
            {response.routes.map((route, index) => (
              <DirectionsRenderer key={index} options={{ directions: response, routeIndex: index }} />
            ))}
          </>
        )}
      </GoogleMap>
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default App;
