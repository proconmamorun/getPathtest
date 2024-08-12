import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, useJsApiLoader, DirectionsService, DirectionsRenderer, Libraries } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px"
};

const center = {
  lat: 35.6895,
  lng: 139.6917
};

const libraries: Libraries = ["places"];

const App: React.FC = () => {
  const [origin, setOrigin] = useState<google.maps.LatLngLiteral | null>(null);
  const [destination, setDestination] = useState("");
  const [response, setResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [triggerDirectionService, setTriggerDirectionService] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY ?? "",
    libraries,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setOrigin({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          console.log("origin is "+origin);
        },
        (error) => {
          switch(error.code) {
            case error.PERMISSION_DENIED:
              alert("位置情報のアクセスが拒否されました。ブラウザの設定を確認してください。");
              break;
            case error.POSITION_UNAVAILABLE:
              alert("位置情報を取得できませんでした。お使いのデバイスやネットワークの設定を確認してください。");
              break;
            case error.TIMEOUT:
              alert("位置情報の取得に時間がかかりすぎました。再試行してください。");
              break;
            default:
              alert("位置情報の取得中にエラーが発生しました。エラーコード: " + error.code);
              break;
          }
          console.error("Error Code = " + error.code + " - " + error.message);
        }
      );
    } else {
      alert("このブラウザはGeolocation APIに対応していません。");
    }
  }, [origin]);

  const handleDirectionsCallback = useCallback((res: google.maps.DirectionsResult | null) => {
    if (res !== null) {
      setResponse(res);
      setTriggerDirectionService(false);
      console.log("Directions service response:", res);
    } else {
      console.log("Directions service failed to get a result.");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin && destination) {
      setResponse(null);
      setTriggerDirectionService(true);
      console.log("Form submitted with destination:", destination);
    }
  };

  useEffect(() => {
    if (triggerDirectionService) {
      console.log("Triggering DirectionsService...");
      setTriggerDirectionService(false);
    }
  }, [triggerDirectionService]);

  return isLoaded ? (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Destination: </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        <button type="submit">Get Directions</button>
      </form>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
        {origin && destination && triggerDirectionService && (
          <DirectionsService
            options={{
              origin: origin,
              destination: destination,
              travelMode: google.maps.TravelMode.WALKING,
              provideRouteAlternatives: true,
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
