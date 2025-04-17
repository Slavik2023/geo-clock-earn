
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      getCenter(): LatLng;
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      getZoom(): number;
      addListener(eventName: string, handler: Function): MapsEventListener;
      controls: MVCArray<MVCObject>[];
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latLng: LatLng | LatLngLiteral): void;
      getPosition(): LatLng;
      setMap(map: Map | null): void;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    class Geocoder {
      geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: GeocoderStatus) => void): void;
    }

    interface GeocoderRequest {
      address?: string;
      location?: LatLng | LatLngLiteral;
      bounds?: LatLngBounds | LatLngBoundsLiteral;
      componentRestrictions?: GeocoderComponentRestrictions;
      region?: string;
    }

    interface GeocoderComponentRestrictions {
      country: string | string[];
    }

    interface GeocoderResult {
      address_components: GeocoderAddressComponent[];
      formatted_address: string;
      geometry: GeocoderGeometry;
      partial_match: boolean;
      place_id: string;
      postcode_localities: string[];
      types: string[];
    }

    interface GeocoderAddressComponent {
      long_name: string;
      short_name: string;
      types: string[];
    }

    interface GeocoderGeometry {
      location: LatLng;
      location_type: GeocoderLocationType;
      viewport: LatLngBounds;
      bounds?: LatLngBounds;
    }

    type GeocoderLocationType = "APPROXIMATE" | "GEOMETRIC_CENTER" | "RANGE_INTERPOLATED" | "ROOFTOP";

    type GeocoderStatus = "OK" | "ZERO_RESULTS" | "OVER_DAILY_LIMIT" | "OVER_QUERY_LIMIT" | "REQUEST_DENIED" | "INVALID_REQUEST" | "UNKNOWN_ERROR";

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: string;
      mapTypeControl?: boolean;
      disableDefaultUI?: boolean;
      [key: string]: any;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: string | Icon | Symbol;
      draggable?: boolean;
      [key: string]: any;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
      toString(): string;
      toUrlValue(precision?: number): string;
      toJSON(): LatLngLiteral;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface LatLngBounds {
      contains(latLng: LatLng): boolean;
      equals(other: LatLngBounds | LatLngBoundsLiteral): boolean;
      extend(point: LatLng): LatLngBounds;
      getCenter(): LatLng;
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
      intersects(other: LatLngBounds | LatLngBoundsLiteral): boolean;
      isEmpty(): boolean;
      toJSON(): LatLngBoundsLiteral;
      toSpan(): LatLng;
      toString(): string;
      toUrlValue(precision?: number): string;
      union(other: LatLngBounds | LatLngBoundsLiteral): LatLngBounds;
    }

    interface LatLngBoundsLiteral {
      east: number;
      north: number;
      south: number;
      west: number;
    }

    interface MVCObject {
      addListener(eventName: string, handler: Function): MapsEventListener;
      bindTo(key: string, target: MVCObject, targetKey?: string, noNotify?: boolean): void;
      get(key: string): any;
      notify(key: string): void;
      set(key: string, value: any): void;
      setValues(values: any): void;
      unbind(key: string): void;
      unbindAll(): void;
    }

    interface MVCArray<T> {
      clear(): void;
      forEach(callback: (elem: T, i: number) => void): void;
      getArray(): T[];
      getAt(i: number): T;
      getLength(): number;
      insertAt(i: number, elem: T): void;
      pop(): T;
      push(elem: T): number;
      removeAt(i: number): T;
      setAt(i: number, elem: T): void;
    }

    interface MapsEventListener {
      remove(): void;
    }

    interface Icon {
      url: string;
      anchor?: Point;
      labelOrigin?: Point;
      origin?: Point;
      scaledSize?: Size;
      size?: Size;
    }

    interface Symbol {
      anchor?: Point;
      fillColor?: string;
      fillOpacity?: number;
      labelOrigin?: Point;
      path: string | SymbolPath;
      rotation?: number;
      scale?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
    }

    type SymbolPath = 0 | 1 | 2 | 3 | 4 | 100 | 200;

    interface Point {
      x: number;
      y: number;
      equals(other: Point): boolean;
      toString(): string;
    }

    interface Size {
      height: number;
      width: number;
      equals(other: Size): boolean;
      toString(): string;
    }

    // Add the ControlPosition enum
    enum ControlPosition {
      TOP_LEFT,
      TOP_CENTER,
      TOP_RIGHT,
      LEFT_TOP,
      LEFT_CENTER,
      LEFT_BOTTOM,
      BOTTOM_LEFT,
      BOTTOM_CENTER,
      BOTTOM_RIGHT,
      RIGHT_TOP,
      RIGHT_CENTER,
      RIGHT_BOTTOM
    }

    namespace places {
      class SearchBox {
        constructor(inputField: HTMLInputElement, opts?: SearchBoxOptions);
        getBounds(): LatLngBounds;
        getPlaces(): PlaceResult[];
        setBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
        addListener(eventName: string, handler: Function): MapsEventListener;
      }

      interface SearchBoxOptions {
        bounds?: LatLngBounds | LatLngBoundsLiteral;
      }

      interface PlaceResult {
        address_components?: GeocoderAddressComponent[];
        formatted_address?: string;
        geometry?: PlaceGeometry;
        html_attributions?: string[];
        icon?: string;
        name?: string;
        permanently_closed?: boolean;
        photos?: PlacePhoto[];
        place_id?: string;
        plus_code?: PlusCode;
        price_level?: number;
        rating?: number;
        types?: string[];
        vicinity?: string;
      }

      interface PlaceGeometry {
        location: LatLng;
        viewport: LatLngBounds;
      }

      interface PlacePhoto {
        height: number;
        html_attributions: string[];
        width: number;
        getUrl(opts: PhotoOptions): string;
      }

      interface PhotoOptions {
        maxHeight?: number;
        maxWidth?: number;
      }

      interface PlusCode {
        compound_code?: string;
        global_code: string;
      }
    }
  }
}
