// app.js — Carte interactive Leaflet avec popups HTML externes
const map = L.map("map").setView([36.7213, -4.4214], 11);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
}).addTo(map);

let markers = [];
let allPoints = [];
const zoneSelect = document.getElementById("zoneSelect");
const resetBtn = document.getElementById("resetBtn");

fetch("points.json")
  .then((response) => {
    if (!response.ok) throw new Error(`Erreur de chargement (${response.status}) : ${response.url}`);
    return response.json();
  })
  .then((data) => {
    allPoints = data;
    initMap(data);
    initZones(data);
  })
  .catch((err) => {
    console.error("Erreur lors du chargement de points.json :", err);
    alert("⚠️ Impossible de charger points.json.");
  });

function initMap(points) {
  markers.forEach((m) => map.removeLayer(m));
  markers = [];
  points.forEach((p) => {
    const marker = L.marker([p.lat, p.lon]).addTo(map);
    fetch(p.popupHtml)
      .then((res) => {
        if (!res.ok) throw new Error(`Fichier introuvable : ${p.popupHtml}`);
        return res.text();
      })
      .then((html) => marker.bindPopup(html))
      .catch(() => marker.bindPopup(`<b>${p.name}</b><br>${p.description || ""}`));
    markers.push(marker);
  });
}

function initZones(points) {
  const zones = [...new Set(points.map((p) => p.zone))].sort();
  zones.forEach((z) => {
    const opt = document.createElement("option");
    opt.value = z;
    opt.textContent = z;
    zoneSelect.appendChild(opt);
  });
}

zoneSelect.addEventListener("change", () => {
  const selectedZone = zoneSelect.value;
  if (selectedZone === "all") initMap(allPoints);
  else {
    const filtered = allPoints.filter((p) => p.zone === selectedZone);
    initMap(filtered);
    if (filtered.length > 0) map.setView([filtered[0].lat, filtered[0].lon], 12);
  }
});

resetBtn.addEventListener("click", () => {
  zoneSelect.value = "all";
  initMap(allPoints);
  map.setView([36.7213, -4.4214], 11);
});
