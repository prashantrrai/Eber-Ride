import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { VehicleService } from "../../Service/vehicle.service";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "../../Service/auth.service";

@Component({
  selector: "app-vehicle",
  templateUrl: "./vehicle.component.html",
  styleUrls: ["./vehicle.component.css"],
})
export class VehicleComponent implements OnInit {
  vehicleForm!: FormGroup;
  AddbuttonForm: boolean = false;
  updateButtonForm: boolean = false;
  vehiclesData: any;
  file: any;
  selectedVehicle: any;
  id: any;
  isUpdate: boolean=false

  constructor(
    private formbuilder: FormBuilder,
    private _vehicle: VehicleService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.vehicleForm = this.formbuilder.group({
      vehicleName: ["", [Validators.required]],
    });

    this._vehicle.getvehicleData().subscribe({
      next: (response: any) => {
        this.vehiclesData = response.data.map((vehicle: any) => ({
          _id: vehicle._id,
          vehicleName: vehicle.vehicleName,
          vehicleImage: vehicle.vehicleImage,
        }));
        // console.log(this.vehiclesData)
      },
      error: (err) => {
        alert(err);
      },
    });
  }

  onFileSelected(event: any) {
    this.file = event.target.files[0];
  }

  addVehicle() {
    const formData = new FormData();
    formData.append("vehicleImage", this.file);
    formData.append("vehicleName", this.vehicleForm.value.vehicleName);
    // console.log(formData)
    if (this.vehicleForm.valid) {
        this._vehicle.registerVehicle(formData).subscribe({
          next: (res) => {
            this.vehiclesData.push(res.vehicle);
            this.vehicleForm.reset();
            this.AddbuttonForm = false;
            this.toastr.success(res.message);
          },
          error: (error) => {
            console.log(error);
            this.toastr.warning(error.error.message);
          }
        });
    } 
    else {
      this.toastr.warning("Please Fill Valid Details");
    }
  }

  updateVehicle(){
    const formData = new FormData();
    formData.append("vehicleImage", this.file);
    formData.append("vehicleName", this.vehicleForm.value.vehicleName);
    const vehicleData = this.vehicleForm.value;
    console.log(vehicleData)

    this._vehicle.updateVehicle(this.id, formData).subscribe({
     next: (res) => {
        let vehicle = res.vehicle
        this.vehicleForm.reset()
        this.updateButtonForm = false
        console.log(this.vehiclesData)
        this.file = null
        this.toastr.success(res.message);

        
        let findobj = this.vehiclesData.find((obj: any) => {
          console.log(obj)
          return obj._id === vehicle._id;
        });
        console.log(findobj)
        let key = Object.keys(findobj);

        key.forEach((key: any) => {
          findobj[key] = vehicle[key];
        });

      // this.ngOnInit()
    },
    error: (error:any) => {
      console.log(error);
      this.toastr.warning(error.error.message);
      
    }
      });
    this.selectedVehicle = null;
  }

  editVehicle(vehicle: any) {
    this.id = vehicle._id;
    this.isUpdate= true
    this.selectedVehicle = vehicle;
    console.log(this.vehicleForm)
    console.log(vehicle.vehicleName)
    this.vehicleForm.patchValue({
      vehicleName: vehicle.vehicleName,
    });
    this.updateButtonForm = true;
    this.AddbuttonForm = false;
  }

  toggleFormVisibility() {
    this.AddbuttonForm = !this.AddbuttonForm;
    this.selectedVehicle = null;
    this.vehicleForm.reset();
    this.updateButtonForm = false
  }

  resetTimer() {
    this.authService.resetInactivityTimer();
  }

}
