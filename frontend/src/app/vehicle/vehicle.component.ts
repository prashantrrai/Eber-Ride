import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { VehicleService } from '../Service/vehicle.service';


@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  styleUrls: ['./vehicle.component.css']
})
export class VehicleComponent implements OnInit{
  vehicleForm!: FormGroup;
  showForm: boolean = false;
  vehiclesData: any;
  selectedFile: any;

  constructor(private formbuilder: FormBuilder, private _vehicle: VehicleService) {}
  
  ngOnInit(): void {
    this.vehicleForm = this.formbuilder.group({
      vehicleName: ['', [Validators.required]],
      vehicleImage: ['', [Validators.required]],
    });

    this._vehicle.getvehicleData().subscribe({
      next:(vehicle:any)=>{
        this.vehiclesData= vehicle.data
      },
      error:(err)=>{
        alert(err)
      }
    })
  }

  onFileSelected(event:any) {
    const selectedFile = event.target.files[0];
    // console.log(this.selectedFile)
    this.vehicleForm.patchValue({ vehicleImage: selectedFile });
  }


  addVehicle(){
    if (this.vehicleForm.valid) {
      const formData = new FormData()
      formData.append('vehicleName',this.vehicleForm.value.vehicleName)
      formData.append('vehicleImage',this.vehicleForm.value.vehicleImage)

      this._vehicle.registerVehicle(formData).subscribe((res) => {
        alert('Vehicle Added Successfully');
        this.vehicleForm.reset();
      })

    }
    else{
      alert('All Fields are Required');
    }
  }

  toggleFormVisibility() {
    this.showForm = !this.showForm;
  }

}
