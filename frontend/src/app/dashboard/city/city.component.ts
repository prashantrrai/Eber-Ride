import { Component, OnInit } from "@angular/core";
import { CityService } from "../../Service/city.service";
declare var google: any;
import { HttpClient } from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AuthService } from "src/app/Service/auth.service";

@Component({
  selector: "app-city",
  templateUrl: "./city.component.html",
  styleUrls: ["./city.component.css"],
})
export class CityComponent implements OnInit {
  cityForm!: FormGroup;
  addedCities: string[] = [];
  newCity: string = "";
  isValidCity: boolean = false;
  isDuplicateCity: boolean = false;

  //map
  map: any;
  drawingManager: any;
  polygons: any = [];
  isInZone: boolean = false;
  cordsArray: any = [];
  marker: any;
  autocomplete: any;

  //get country data
  selectedCountry: string = "";
  selectedCountryName!: string;
  countryData: any[] = [];
  cityData: any[] = [];

  countries: any;
  coordinates: any;
  inputValue: any;
  isaddbutton: boolean = true;
  isupdatebutton: boolean = false;
  isCountryDisabled: boolean = false;
  id: any;
  page: number =1;
  tableSize: any;
  countryName: any;
  city: any;
  citydata: any = {
    countryname: "",
    cityname: "",
  };
  polygonObj: any;
  polygon: any;
  totalPages: number = 0;
  limit: number = 5;
  currentPage: number = 1;
  paginatedData: any[] = [];
  count: any;
  
  constructor(
    private toastr: ToastrService,
    private _city: CityService,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private authService: AuthService,

  ) {
    this.cityForm = this.formBuilder.group({
      countryname: ["", Validators.required],
      cityname: ["", Validators.required]
    });
  }

  ngOnInit(): void {
    this.cityForm = this.formBuilder.group({
      countryname: [""],
      cityname: [""],
    });
    this.getCItyData();
    this.getCountryNamefromDB();
    this.initMap();
  }

  // To set the Location of searched from Input field and modify it..........
  setLocation(place: any) {
    if (!place.geometry) {
      console.error("No geometry found for place:", place);
      return;
    }

    if (place.geometry && place.geometry.location) {
      this.map.setCenter(place.geometry.location);
      this.map.setZoom(8);
      this.marker.setPosition(place.geometry.location);
      this.marker.setVisible(true);
    }
  }

  onPlaceChanged() {
    const place = this.autocomplete.getPlace();
    if (place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      // Do something with the latitude and longitude
      console.log("Latitude:", lat);
      console.log("Longitude:", lng);
    } 
  }

  // To load the map on Screen.............
  initMap() {
    this.map = new google.maps.Map(
      document.getElementById("map") as HTMLElement,
      {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 4,
      }
    );

    const input = document.getElementById("inputCity") as HTMLInputElement;
    this.autocomplete = new google.maps.places.Autocomplete(input);

    this.autocomplete.addListener("place_changed", () => {
      const place: any = this.autocomplete.getPlace();
      this.onPlaceChanged(); //place change in select.
      this.setLocation(place); // set location in search.
    });

    // Add Location Marker or Pin on the searched location..............
    this.marker = new google.maps.Marker({
      map: this.map,
      draggable: true,
      animation: google.maps.Animation.DROP,
      anchorPoint: new google.maps.Point(0, -29),
    });

    // to draw the polygon on the map using DrawingManager()............
    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [google.maps.drawing.OverlayType.POLYGON],
      },
    });

    this.drawingManager.setMap(this.map);

    google.maps.event.addListener(
      this.drawingManager,
      "overlaycomplete",
      (event: any) => {
        if (event.type === google.maps.drawing.OverlayType.POLYGON) {
          if (this.polygon) {
            this.polygon.setMap(null); //clearing old drawn polygon
          }
          this.polygon = event.overlay;
        }
      }
    );

    // Add event listener for polygon drag end
    google.maps.event.addListener(this.polygon, "dragend", (event: any) => {
      const newCoordinates = this.polygon
        .getPath()
        .getArray()
        .map((results: { lat: () => any; lng: () => any }) => ({
          lat: results.lat(),
          lng: results.lng(),
        }));
      // Do something with the updated coordinates
      console.log("Updated Coordinates:", newCoordinates);
    });
  }

  // To fetch country data from from /countrydata API in dropdown..........
  getCountryNamefromDB(): void {
    this._city.getcountryData().subscribe({
      next: (response) => {
        // console.log(response);
        this.countryData = response.countrydata;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  //---------------------------------------GET CITY DATA------------------------------------------//
  getCItyData(): void {
    this._city.getcity(this.currentPage, this.limit).subscribe({
      next: (response) => {
        this.cityData = response.citydata;
        this.count = response.count;
        this.totalPages = response.totalPage;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
  onPageSizeChange(event: any): void {
    this.limit = parseInt(event.target.value);
    this.currentPage = 1;
    this.updatePaginatedData();
    this.getCItyData();
  }
  onPageChange(pageNumber: number) {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePaginatedData();
      this.getCItyData();
    }
  }
  // getPagesArray(): number[] {
  //   return Array(this.totalPages).fill(0).map((_, index) => index + 1);
  // }
  updatePaginatedData() {
    const startIndex = (this.currentPage - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    this.paginatedData = this.cityData.slice(startIndex, endIndex);
  }
  //------TO REMOVE POLYGON-----------------//
  removePolygon() {
    if(this.polygonObj){
      this.polygonObj.forEach((element: any) => {
        element.setMap(null);
      },
      this.polygonObj = [],
      this.polygons = []
      );
    }
  }

  //--------------------------------SELECT COUNTRY FROM DROPDOWN---------------------------------------------//
  onSelected(id: any) {
    this.removePolygon() 
    this.selectedCountry = id;
    console.log(id);
    const selectedCountryObj = this.countryData.find((obj: any) => obj._id === id);
    if (selectedCountryObj) {
      this.selectedCountryName = selectedCountryObj.countryName;
     
    console.log(this.selectedCountryName);

    this._city.getCityPolygons(id).subscribe({
      next: (response: any) => {
        console.log(response);

        response.forEach((element: any) => {
          this.polygons.push(element.coordinates);
        });
        // console.log(this.polygon);
        this.polygonObj = this.polygons.map((polygonCoordinates: any) => {
        return new google.maps.Polygon({

          paths: polygonCoordinates,
          editable: false,
          draggable: false,
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#FF0000",
          fillOpacity: 0.35,
          map: this.map,
        });
      });
      },
      error: (error) => {
        console.log(error);
      }
    });

      //-------------- city Autocomplete based on selected country from onSelected(country's Id).............
      this.http
        .get<any>(
          `https://restcountries.com/v3.1/name/${this.selectedCountryName}`
        )
        .subscribe({
          next: (countryRes: any) => {
            let rcountry = countryRes.filter((obj: any) => {
              return obj.name.common == this.selectedCountryName;
            });

            //getting country code like IN..............
            let code = rcountry[0].cca2.toLowerCase();

            this.autocomplete.setTypes(["(cities)"]);
            this.autocomplete.setComponentRestrictions({ country: [code] });
          },
          error: (error: any) => {
            console.log("Country Selection Error: ", error.message);
            this.toastr.error(error.message);
          },
        });
    }
  }

  // To check the drawn Zone inside coordinates or not and add city in database.............
  checkZone_AddCity() {
      if(this.cityForm.value.countryname != ""){
        const geocoder = new google.maps.Geocoder();
        const input = document.getElementById("inputCity") as HTMLInputElement;

        geocoder.geocode({ address: input.value }, (results: any, status: any) => {
          if (status === "OK") {
            const location = results[0].geometry.location;
            // console.log(location)
            this.isInZone = google.maps.geometry.poly.containsLocation(
              location,
              this.polygon
            );

            if (this.isInZone == true) {
              const polygonPath = this.polygon.getPath();
              this.coordinates = polygonPath
                .getArray()
                .map((results: { lat: () => any; lng: () => any }) => ({
                  lat: results.lat(),
                  lng: results.lng(),
                }));
              console.log("Coordinates:", this.coordinates);

              const payload = {
                country_id: this.selectedCountry,
                city: input.value,
                coordinates: this.coordinates,
              };
              console.log(payload);

              // To add city in Database...............
              this._city.addcity(payload).subscribe({
                next: (response: any) => {
                  this.cityData.push(response.city);
                  // this.toastr.success(response.message);
                  alert(response.message);
                  this.getCItyData();
                  this.getCountryNamefromDB();
                  this.marker.setVisible(false); // Hide the marker
                  this.marker.setPosition(null); // Clear the marker position
                  this.polygon.setMap(null); // clear the polygon
                  this.cityForm.reset(); // clear the form
                },
                error: (error) => {
                  console.log(error.error.message);
                  alert(error.error.message);
                  // this.toastr.warning(error.error.message);
                },
              });
            } else {
              alert("Location not Inside Zone");
            }
          } else {
            alert("please choose city and create a zone");
          }
        });
      } else {
        alert("All Fields are Required");
      }
    }



  editbtn(_id: string, city: any) {
    this.removePolygon() 

    console.log(city);
    this.id = _id;
    this.inputValue = city.city;
    this.selectedCountryName = city.countryDetails.countryName;

    this.cityForm.get("countryname")?.disable();
    // this.cityForm.get("cityname")?.disable();

    this.cityForm.patchValue({
      countryname: city.countryDetails._id,
      cityname: city.city,
    });

    // Enable the update button and disable the add button
    this.isaddbutton = false;
    this.isupdatebutton = true;

    const coordinatesdatabase = city.coordinates;
    console.log(coordinatesdatabase);

    this.displayPolygon(city.coordinates);
  }

  displayPolygon(coordinates: any[]) {
    const polygonPath = coordinates.map(
      (coord: any) => new google.maps.LatLng(coord.lat, coord.lng)
    );

    // Remove previous polygon if exists
    if (this.polygon) {
      this.polygon.setMap(null);
    }

    // Create and display the polygon
    this.polygon = new google.maps.Polygon({
      paths: polygonPath,
      editable: true,
      draggable: true,
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
    });
    this.polygon.setMap(this.map);

    //to Zoom the selected location inside zone.............
    const bounds = new google.maps.LatLngBounds();
    coordinates.forEach((coord: any) => {
      bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
    });
    this.map.fitBounds(bounds);
  }

  updateCity() {
    const geocoder = new google.maps.Geocoder();
    const input = document.getElementById("inputCity") as HTMLInputElement;

    geocoder.geocode({ address: input.value }, (results: any, status: any) => {
      if (status === "OK") {
        const location = results[0].geometry.location;
        console.log(location)
        this.isInZone = google.maps.geometry.poly.containsLocation(
          location,
          this.polygon
        );

        if (this.isInZone == true && input.value != "") {
          const newCoordinates = this.polygon
          .getPath()
          .getArray()
          .map((results: { lat: () => any; lng: () => any }) => ({
            lat: results.lat(),
            lng: results.lng(),
          }));
        console.log(newCoordinates);

          const payload = {
            city: input.value,
            coordinates: newCoordinates,
          };
          console.log(payload);

          this._city.updateCity(this.id, payload).subscribe({
            next: (response: any) => {
              console.log(response);
              alert(response.message);
              this.cityData.push(response.city);

              // Reset the form and button states
              this.isupdatebutton = false;
              this.isaddbutton = true;
              this.cityForm.get('countryname')?.enable();
              
              this.getCItyData();
              this.getCountryNamefromDB();
              this.marker.setVisible(false);
              this.marker.setPosition(null); 
              this.polygon.setMap(null); 
              this.cityForm.reset(); 
            },
            error: (error) => {
              console.log(error.error.message);
              alert(error.error.message);
            },
          });
        } else {
          alert("Location not Inside Zone");
        }
      } else {
        alert("please choose city and create a zone");
      }
    });

  }


  resetTimer() {
    this.authService.resetInactivityTimer();
  }
}
