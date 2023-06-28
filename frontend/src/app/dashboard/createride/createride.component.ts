import { SettingService } from "./../../Service/setting.service";
import { HttpClient } from "@angular/common/http";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/Service/auth.service";
import { CityService } from "src/app/Service/city.service";
import { CreaterideService } from "src/app/Service/createride.service";
import { SuccessDialogComponent } from "src/app/shared/success-dialog/success-dialog.component";
declare var google: any;

@Component({
  selector: "app-createride",
  templateUrl: "./createride.component.html",
  styleUrls: ["./createride.component.css"],
})
export class CreaterideComponent {
  @ViewChild("startInput") startInput: ElementRef | undefined;
  @ViewChild("waypointInput") waypointInput: any;
  @ViewChild("endInput") endInput: ElementRef | undefined;
  @ViewChild("directionBtn") directionBtn: any;
  countryCodes: any = [];
  map: any;
  directionsService: any;
  directionsRenderer: any;
  waypoints: any = [];
  user: any;
  cities: any;
  cordsArray: any;
  polygon: any;
  isInZone: boolean = true;
  polygons: any = [];
  polygonObjects: any;
  cityIndex: any;
  isRoute: any = false;
  vehiclesPricing: any = [];
  totalDistance: any;
  totalTime: any;
  estimateFare: any;

  userForm = this.fb.group({
    countrycode: ["+91", Validators.required],
    userphone: [
      "",
      [
        Validators.required,
        Validators.pattern("[0-9]*"),
        Validators.minLength(10),
      ],
    ],
  });

  travelForm = this.fb.group({
    start: ["", Validators.required],
    end: ["", Validators.required],
  });

  rideForm = this.fb.group({
    serviceType: ["", Validators.required],
    paymentOption: ["", Validators.required],
    rideTime: ["", Validators.required],
  });

  numericInputValue: any = "";
  isNext = true;
  isUser = false;
  selectedVehicle: any;
  stops: any;
  stopsCounter: any = 0;
  selectedOption: string = "";
  selectedDate: any;
  selectedTime: any;
  minDate: any;
  minTime: any;
  startLocation: any;
  endLocation: any;
  rideData: any;
  totalHours: any;
  totalMinutes: any;
  estimateTime: string = "";

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private _createride: CreaterideService,
    private toaster: ToastrService,
    private _city: CityService,
    private cdr: ChangeDetectorRef,
    private _setting: SettingService,
    private dialog: MatDialog,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    const currentDate = new Date();
    this.selectedDate = this.formatDate(currentDate);
    this.selectedTime = this.formatTime(currentDate);
    this.getCodes();
    this.getNumberOfStops();
    this.initMap();
  }

  // -------------------------------------INITIALIZE GOOGLE MAP-------------------------------------//
  initMap() {
    navigator.geolocation.getCurrentPosition((location) => {
      let result = location.coords;
      // console.log(result);
      const place = { lat: result.latitude, lng: result.longitude };
      this.map = new google.maps.Map(
        document.getElementById("map") as HTMLElement,
        {
          zoom: 7,
          center: place,
        }
      );
    });
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(this.map);
  }

  //--------------------COUNTRY CODES REST API--------------------
  getCodes() {
    this.http.get("https://restcountries.com/v3.1/all").subscribe({
      next: (countries: any) => {
        countries.forEach((response: any) => {
          if (response.idd.suffixes) {
            let code = response.idd.root + response.idd.suffixes[0];
            this.countryCodes.push(code);
          }
        });
        this.countryCodes.sort();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  //--------------- TO GET NO. OF STOPS ------------------
  getNumberOfStops() {
    this._setting.getStops().subscribe({
      next: (response: any) => {
        // console.log(response.settingData[0]);
        this.stops = response[0].stops;
      },
      error: (error) => {
        this.toaster.error(error.message);
      },
    });
  }

  // ------------------PHONE NUMBER FILTER---------------------
  filterNonDigits(event: any) {
    let inputValue: string = event.target.value;
    inputValue = inputValue.replace(/\D/g, "");
  
    if (inputValue.length > 10) {
      inputValue = inputValue.slice(0, 10);
    }
  
    this.userForm.patchValue({
      userphone: inputValue
    });
  
    event.target.value = inputValue;
  }

  // ----------------------------------------GET USER DETAILS----------------------------------------//
  getUserDetails() {
    this.isNext = true;
    const userData = {
      countrycode: this.userForm.value.countrycode,
      userphone: this.userForm.value.userphone,
    };

    this._createride.getUserByNumber(userData).subscribe({
      next: (user: any) => {
        this.isUser = true;
        this.user = user
        this.polygons = [];

        this._city.getcity().subscribe({
          next: (cities: any) => {

            this.cities = cities;
            this.cities.forEach((city: any) => {
              this.polygons.push(city.coordinates);
            });
            // console.log(this.polygons, "polygons.....");

            this.polygonObjects = this.polygons.map(function (
              polygonCoordinates: any
            ) {
              return new google.maps.Polygon({
                paths: polygonCoordinates,
              });
            });

            this.cordsArray = this.cities.coordinates
          },
          error: (error: any) => {
            console.log(error);
            this.toaster.error(error.status, error.message);
          },
        });
      },
      error: (error: any) => {
        console.log(error.error.message);
        if (error.error) {
          this.toaster.error(error.error.message, "Sorry");
          this.user = undefined;
          this.isUser = false;
        } else {
          this.toaster.error(error.status, error.statusText);
        }
      },
    });
  }

  // ----------------------------------------AFTER USER FOUND----------------------------------------//
  addTravelForm() {
    this.isNext = false;
    this.isUser = false;

    setTimeout(() => {
      console.log("starting 2 msec after user found...........");
      this.initAutocomplete();
    }, 200);
  }

  // --------------------AUTO COMPLETE FUNCTION IN TRAVEL FORM-------------------
  initAutocomplete() {
    let start = document.getElementById("startInput") as HTMLInputElement;
    const startAutocomplete = new google.maps.places.Autocomplete(start);
    let waypoints = document.getElementById("waypoint") as HTMLInputElement;

    const waypointsAutocomplete = new google.maps.places.Autocomplete(waypoints);
    let end = document.getElementById("endInput") as HTMLInputElement;
    const endAutocomplete = new google.maps.places.Autocomplete(end);
  }

  //-------------whent starting location change-------------------
  startInputChange() {
    this.rideForm.reset();
    this.rideForm.patchValue({
      serviceType: "",
    });
    this.startLocation = this.startInput?.nativeElement.value;
    this.isInZone = true;
    if (this.startLocation != "") {
      this.checkLocation();
    }
  }

  //to check service is available from starting location or not
  checkLocation() {
    if (this.polygonObjects?.length != 0) {
      const geocoder = new google.maps.Geocoder();

      setTimeout(() => {
        let input = document.getElementById("startInput") as HTMLInputElement;
        // console.log(input.value);
        geocoder.geocode(
          { address: input.value },
          (results: any, status: any) => {
            if (status === "OK") {
              const location = results[0].geometry.location;
              // console.log(location);
              this.isInZone = false;
              for (var i = 0; i < this.polygonObjects.length; i++) {
                if (
                  google.maps.geometry.poly.containsLocation(
                    location,
                    this.polygonObjects[i]
                  )
                ) {
                  this.cityIndex = i;
                  this.isInZone = true;
                  break; // Exit the loop if the location is found within any polygon
                }
              }
              // console.log(this.isInZone);
              // console.log(this.cityIndex, "cityindex....");

              if (!this.isInZone) {
                // console.log("Service Not Available");
                if (this.endInput) {
                  this.endInput.nativeElement.disabled = true;
                  this.waypointInput.nativeElement.disabled = true;
                  this.directionBtn.nativeElement.disabled = true;
                }
                this.toaster.error("Service is Not Available in City");
              } else {
                if (this.endInput) {
                  this.endInput.nativeElement.disabled = false;
                  this.waypointInput.nativeElement.disabled = false;
                  this.directionBtn.nativeElement.disabled = false;
                }
                // console.log("Service Available");
                this.toaster.success("Service is Available in City");
              }
            } else {
              this.toaster.info("Select Location from Auto Suggestion");
              // console.log("Select location from auto suggestion", status);
            }
          }
        );
      }, 200);
    }
  }

  // ----------------------ADD WAY POINTS----------------------
  addWaypoint() {
    const waypoint = this.waypointInput?.nativeElement.value;
    if (waypoint) {
      this.stopsCounter++;
      this.waypoints.push(waypoint);
      this.waypointInput.nativeElement.value = ""; // Clear the input field
    }
  }

  // ----------------------REMOVE WAY POINTS----------------------
  removeWaypoint(index: number) {
    this.stopsCounter--;
    this.waypoints.splice(index, 1);
  }

  // To get direction
  calculateRoute() {
    this.startLocation = this.startInput?.nativeElement.value;
    this.endLocation = this.endInput?.nativeElement.value;
    this.rideForm.reset();
    this.rideForm.patchValue({
      serviceType: "",
    });

    console.log(this.startLocation, this.endLocation);

    console.log(this.waypoints, "waypints array");

    this.directionsService?.route(
      {
        origin: this.startLocation,
        destination: this.endLocation,
        waypoints: this.waypoints.map((waypoint: any) => ({
          location: waypoint,
        })),
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response: any, status: string) => {
        if (status === "OK") {
          this.drawRoute(response);
          console.log(this.travelForm.value);
          this.isRoute = true;
        } else {
          if (status === "ZERO_RESULTS") {
            this.isRoute = false;
            alert("No route found for given locations!");
            console.log("No route found for given locations! " + status)
          } else {
            this.isRoute = false;
            alert("Select location from auto suggestion ");
            console.log("Select location from auto suggestion " + status)
          }
        }
      }
    );
  }

  calculateFare(vehiclePricing: any, cityIndex: any) {
    let minFare = +vehiclePricing.minfare;
    let baseDistance = +vehiclePricing.distancebaseprice;
    let basePrice = +vehiclePricing.baseprice;
    let pDistance = +vehiclePricing.ppudist;
    let pTime = +vehiclePricing.pputime;

    console.log(minFare, baseDistance, basePrice, pDistance, pTime);
    console.log(typeof minFare, typeof baseDistance, typeof basePrice, typeof pDistance, typeof pTime);
    let estimatePrice =
      //added multiply * temporarily
      (this.totalDistance - baseDistance) * pDistance +
      basePrice +
      this.totalTime * pTime;
    if (estimatePrice < minFare || estimatePrice < basePrice) {
      estimatePrice = minFare;
    }

    this.estimateFare = estimatePrice;
    this.vehiclesPricing[cityIndex].estimateFare = estimatePrice;
    console.log(this.vehiclesPricing[cityIndex].estimateFare,"big log...........");

    console.log(estimatePrice, "Fare......");
  }

  //to get vehicles pricing...........
  getVehiclePricing(index: any) {
    console.log(index, "index....");

    const cityId = this.cities[index]._id;
    console.log(cityId);

    this._createride.getServiceType(cityId).subscribe({
      next: (vehiclesPricing: any) => {
        console.log(vehiclesPricing);
        this.vehiclesPricing = vehiclesPricing.pricingdata;

        // to calculate fare......
        this.vehiclesPricing.forEach((vehiclePricing: any, i: number) => {
          this.calculateFare(vehiclePricing, i);
        });
        this.cdr.detectChanges();
        console.log(this.vehiclesPricing, "Estimated price..aa array");
      },
      error: (error: any) => {
        console.log(error);
        this.toaster.error(error.message);
      },
    });
  }
 
  drawRoute(response: any) {
    const route = response.routes[0];

    let totalDistance = 0;
    for (let i = 0; i < route.legs.length; i++) {
      totalDistance += +route.legs[i].distance.value;
    }

    let totalDuration = 0;
    for (let i = 0; i < route.legs.length; i++) {
      const leg = route.legs[i];
      totalDuration += +leg.duration.value;  
    }

    this.totalDistance = +totalDistance / 1000;
    this.totalDistance = this.totalDistance.toFixed(1);
    console.log("Total Distance:", this.totalDistance, "km");

    this.totalHours = Math.floor(totalDuration / 3600);
    this.totalMinutes = Math.round((totalDuration % 3600) / 60);
    console.log(
      "Total Time:",
      this.totalHours,
      "hours",
      this.totalMinutes,
      "minutes"
    );
    this.estimateTime =
      this.totalHours + " hours " + this.totalMinutes + " minutes ";
    this.totalTime = +totalDuration / 60;
    this.totalTime = this.totalTime.toFixed(1);
    console.log(this.totalTime, "minutes.....");

    this.getVehiclePricing(this.cityIndex);

    // Clear previous route
    this.directionsRenderer.setMap(null);
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      polylineOptions: {
        strokeColor: "blue",
        strokeWeight: 5,
      }
    });
    this.directionsRenderer.setMap(this.map);

    // Display new route
    this.directionsRenderer.setDirections(response);
  }

  //-------------------------------SELECT SERVICE TYPE---------------------------------------------//
  onSelectServiceType(serviceType: any) {
    console.log(serviceType);
    this.selectedVehicle = this.vehiclesPricing.find((price: any) => {
      return price.service.vehicleName === serviceType;
    });
    if (this.selectedVehicle) {
      this.selectedVehicle.totalDistance = this.totalDistance;
      this.selectedVehicle.totalTime = this.totalTime;
    }
    console.log(this.selectedVehicle);
  }

  //---------------------------------SELECT DATE AND TIME------------------------------------------//
  handleRadioChange() {
    console.log("input...");
    if (this.selectedOption === "bookNow") {
      const currentDate = new Date();
      this.selectedDate = this.formatDate(currentDate);
      this.selectedTime = this.formatTime(currentDate);
    } else {
      const currentDate = new Date();
      this.minDate = this.formatDate(currentDate);
      this.minTime = this.formatTime(currentDate);

      const selectedDateTime = new Date(
        this.selectedDate + "T" + this.selectedTime
      );
      const currentDateTime = new Date();

      //-------------------------------------------------------------------------------------------------------------------------------------------------//
      if (selectedDateTime < currentDateTime) {
        console.log("if...");

        setTimeout(() => {
          this.selectedDate = this.formatDate(currentDateTime);
          this.selectedTime = this.formatTime(currentDateTime);
        }, 0);
      }
      // ------------------------------------------------------------------------------------------------------------------------------------------------//
    }
  }

  date() {
    console.log(this.selectedDate);
  }
  time() {
    console.log(this.selectedTime);
  }

  // ------------------------------------FORMAT DATE AND TIME----------------------------------------//
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  formatTime(date: Date): string {
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    return `${hours}:${minutes}`;
  }

  // -------------------------------------------------TO BOOK RIDE------------------------------------------------------//
  onBookRide() {
    console.log(this.rideForm.value);
    this.selectedVehicle.startLocation = this.startLocation;
    this.selectedVehicle.endLocation = this.endLocation;
    this.selectedVehicle.waypints = this.waypoints;
    this.rideData = {
      ...this.rideForm.value,
      rideDate: this.selectedDate,
      time: this.selectedTime,
      vehicleId: this.selectedVehicle._id,
      userId: this.user._id,
      cityId: this.selectedVehicle.city,
      startLocation: this.startLocation,
      endLocation: this.endLocation,
      wayPoints: this.waypoints,
      totalDistance: this.totalDistance,
      totalTime: this.totalTime,
      estimateTime: this.estimateTime,
      estimateFare: this.selectedVehicle.estimateFare,
    };
    console.log(this.rideData);
    this._createride.addRide(this.rideData).subscribe({
      next: (res) => {
        console.log(res);
        this.toaster.success("Ride booked successfully!");
        const dialogRef = this.dialog.open(SuccessDialogComponent, {
          width: "300px",
          data: { title: "Ride Booked", content: "Ride booked successfully!" },
        });
        this.rideForm.reset();
        this.rideForm.patchValue({
          serviceType: "",
        });
        this.userForm.reset();
        this.userForm.patchValue({
          countrycode: '+91',
        });
        this.travelForm.reset();
        this.isNext = false;
        this.isRoute = false;
        this.directionsRenderer.setMap(null);

      },
      error: (error) => {
        console.log(error);
        this.toaster.error(error.message);
      },
    });
  }

  // ------------------------------------EXTRA FUNCTIONALITIES CODE---------------------------------------------//

  close(){
    this.isNext = true;
    this.isRoute = false;
    this.directionsRenderer.setMap(null);
    this.travelForm.reset();
    this.removeWaypoint(0)
  }
  resetTimer() {
    this.authService.resetInactivityTimer();
  }
}
