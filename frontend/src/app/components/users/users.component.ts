import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/Service/api.service';
import { AuthService } from 'src/app/Service/auth.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  adminUpdateForm!: FormGroup;
  myForm!: FormGroup;
  showForm: boolean = false;
  personDataArray: any
  selectedAdmin: any;
  AddbuttonForm: boolean = false;

    
    constructor(private _api: ApiService, private formBuilder: FormBuilder, private authService: AuthService, private toastr: ToastrService) { }

    ngOnInit(): void {
      this.fetchUserData();

      this.adminUpdateForm = this.formBuilder.group({
        adminName: '',
        email: '',
        password: ''
        // Add other form controls based on your requirements
      });
    }



    fetchUserData(): void {
      this._api.getuserData().subscribe({
        next: (users: any) => {
          this.personDataArray = users.data.map((admin: any) => ({
            _id: admin._id,
            adminName: admin.adminName,
            email: admin.email,
            cnfpassword: admin.cnfpassword,
          }));
        },
        error: (error: any) => {
          alert(error);
        }
    });
    }


    updateAdminBtn(person: any): void{
      this.selectedAdmin = person;
      this.showForm = true;
      this.adminUpdateForm.patchValue({
        adminName: this.selectedAdmin.adminName,
        email: this.selectedAdmin.email,
        password: this.selectedAdmin.password,
        // Update other form controls based on your requirements
      });
    }

    adminUpdate(userId: string): void{
      const updatedData = this.adminUpdateForm.value;
      this._api.updateUser(userId, updatedData).subscribe({
        next: (response: any) => {
          alert(response.message)
          this.fetchUserData();
          this.showForm = !this.showForm;
        },
        error: (error: any) => {
          alert('Failed to update admin');
        }
      })
    }

    updateCancel(){
      this.showForm = !this.showForm;
    }

    deleteAdmin(userId: string): void {
      const confirmation = confirm('Are you sure you want to delete this admin?');
      if (confirmation) {
        this._api.deleteUser(userId).subscribe({
          next: (response: any) => {
            alert('Admin Deleted Successfully');
            this.fetchUserData(); // Fetch updated user data after deletion
          },
          error: (error: any) => {
            alert('Failed to delete admin');
          }
      });
      }
    }

    
  submitForm() {
    if (this.myForm.valid) {
      const personData = this.myForm.value;

      this._api.registerUser(personData).subscribe({
      next:  (res) => {
        this.myForm.reset();
        this.toastr.success(res.message);
      },
      error: (error) => {
        console.log(error);
        this.toastr.error(error.error.message);
      }
    })
    }
    else{
      this.toastr.warning('All Fields are Required');
    }
  }
  


    
    toggleFormVisibility() {
      this.AddbuttonForm = !this.AddbuttonForm; 
    }

    resetTimer() {
      this.authService.resetInactivityTimer();
    }

}
