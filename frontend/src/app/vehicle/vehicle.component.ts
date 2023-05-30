import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { VehicleService } from "../Service/vehicle.service";

@Component({
  selector: "app-vehicle",
  templateUrl: "./vehicle.component.html",
  styleUrls: ["./vehicle.component.css"],
})
export class VehicleComponent implements OnInit {
  vehicleForm!: FormGroup;
  showForm: boolean = false;
  vehiclesData: any;
  file: any;
  selectedVehicle: any;
  Addbutton: boolean = false;
  updateButton: boolean = false;
  id: any;
  isUpdate: boolean=false

  constructor(
    private formbuilder: FormBuilder,
    private _vehicle: VehicleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.vehicleForm = this.formbuilder.group({
      vehicleName: ["", [Validators.required]],
      vehicleImage: ["", [Validators.required]],
    });

    this._vehicle.getvehicleData().subscribe({
      next: (response: any) => {
        this.vehiclesData = response.data.map((vehicle: any) => ({
          _id: vehicle._id,
          vehicleName: vehicle.vehicleName,
          vehicleImage: vehicle.vehicleImage,
        }));
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
    if (this.vehicleForm.valid) {
      if (this.isUpdate) {
        // Perform update logic here
        const vehicleData = this.vehicleForm.value;

        this._vehicle.updateVehicle(this.id, formData).subscribe((res) => {
          let vehicle = res.vehicle
          alert("Vehicle Updated Successfully");
          console.log(this.vehiclesData)

          
          let findobj = this.vehiclesData.find((o: any) => {
            console.log(o)
            return o._id === vehicle._id;
          });
          console.log(findobj)
          let key = Object.keys(findobj);

          key.forEach((key: any) => {
            findobj[key] = vehicle[key];
          });

          // this.ngOnInit()
          // this.vehicleForm.reset();
          // this.showForm = false;
        });

        // Reset the selected vehicle
        this.selectedVehicle = null;
      } else {
        // Perform add logic here
        this._vehicle.registerVehicle(formData).subscribe((res) => {
          // console.log(res);
          this.vehiclesData.push(res.vehicle);

          alert("Vehicle Added Successfully");
          this.vehicleForm.reset();
          this.showForm = false;
        });
      }
    } else {
      alert("All Fields are Required");
    }
  }

  editVehicle(vehicle: any) {
    this.id = vehicle._id;
    this.isUpdate= true
    this.selectedVehicle = vehicle;
    this.vehicleForm.patchValue({
      vehicleName: vehicle.vehicleName,
    });
    this.showForm = true;
    this.updateButton = true;
    this.Addbutton = false;
  }

  toggleFormVisibility() {
    this.showForm = !this.showForm;
    this.selectedVehicle = null;
    this.vehicleForm.reset();
    this.Addbutton = true;
    this.updateButton = false;
  }
}
