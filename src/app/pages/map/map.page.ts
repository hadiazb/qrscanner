import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

declare var mapboxgl: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit, AfterViewInit {
  public lat?: number;
  public lng?: number;

  constructor(private route: ActivatedRoute) {}
  ngAfterViewInit(): void {
    mapboxgl.accessToken =
      'pk.eyJ1IjoiaGFkaWF6YiIsImEiOiJja3lkMDR2aHMwMHdyMnZxaDgzNWVsb3FqIn0.FPNs7ZNMjBO6MZFfbq7jfw';
    const map = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/light-v11',
      center: [this.lng || 0, this.lat || 0],
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
      container: 'map',
      antialias: true,
    });

    map.on('style.load', () => {
      new mapboxgl.Marker()
        .setLngLat([this.lng || 0, this.lat || 0])
        .addTo(map);
      map.resize();

      const layers = map.getStyle().layers;
      const labelLayerId = layers.find(
        (layer: { type: string; layout: { [x: string]: any } }) =>
          layer.type === 'symbol' && layer.layout['text-field']
      ).id;

      map.addLayer(
        {
          id: 'add-3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height'],
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height'],
            ],
            'fill-extrusion-opacity': 0.6,
          },
        },
        labelLayerId
      );
    });
  }

  ngOnInit() {
    this.readParams();
  }

  public readParams() {
    let geo = this.route.snapshot.queryParamMap.get('q');

    if (!geo) {
      return;
    }
    const [lat, lng] = geo.split(',');
    this.lat = parseFloat(lat);
    this.lng = parseFloat(lng);
  }
}
