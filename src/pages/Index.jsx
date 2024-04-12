import { useState, useEffect } from "react";
import { Box, Button, Text, VStack } from "@chakra-ui/react";
import { FaPlay, FaStop, FaMapMarkerAlt } from "react-icons/fa";

const Index = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [walkStartTime, setWalkStartTime] = useState(null);
  const [walkEndTime, setWalkEndTime] = useState(null);
  const [walkDuration, setWalkDuration] = useState(0);
  const [walkDistance, setWalkDistance] = useState(0);
  const [walkCoordinates, setWalkCoordinates] = useState([]);

  useEffect(() => {
    let watchId;

    if (isTracking) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setWalkCoordinates((prevCoords) => [...prevCoords, { latitude, longitude }]);
        },
        (error) => {
          console.error("Error getting geolocation:", error);
        },
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking]);

  const startWalk = () => {
    setIsTracking(true);
    setWalkStartTime(new Date());
  };

  const stopWalk = () => {
    setIsTracking(false);
    setWalkEndTime(new Date());
    calculateWalkDuration();
    calculateWalkDistance();
  };

  const calculateWalkDuration = () => {
    const duration = (walkEndTime - walkStartTime) / 1000; // in seconds
    setWalkDuration(duration);
  };

  const calculateWalkDistance = () => {
    let distance = 0;
    for (let i = 1; i < walkCoordinates.length; i++) {
      const { latitude: lat1, longitude: lon1 } = walkCoordinates[i - 1];
      const { latitude: lat2, longitude: lon2 } = walkCoordinates[i];
      distance += getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);
    }
    setWalkDistance(distance);
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${walkCoordinates[0].latitude},${walkCoordinates[0].longitude}&destination=${walkCoordinates[walkCoordinates.length - 1].latitude},${walkCoordinates[walkCoordinates.length - 1].longitude}&waypoints=${walkCoordinates
      .slice(1, -1)
      .map((coord) => `${coord.latitude},${coord.longitude}`)
      .join("|")}&travelmode=walking`;
    window.open(url, "_blank");
  };

  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <Button colorScheme={isTracking ? "red" : "green"} leftIcon={isTracking ? <FaStop /> : <FaPlay />} onClick={isTracking ? stopWalk : startWalk}>
          {isTracking ? "Stop Walk" : "Start Walk"}
        </Button>
        <Text>
          <strong>Walk Duration:</strong> {walkDuration.toFixed(2)} seconds
        </Text>
        <Text>
          <strong>Walk Distance:</strong> {walkDistance.toFixed(2)} km
        </Text>
        {walkCoordinates.length > 0 && (
          <Button leftIcon={<FaMapMarkerAlt />} onClick={openGoogleMaps}>
            View Route on Google Maps
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default Index;
