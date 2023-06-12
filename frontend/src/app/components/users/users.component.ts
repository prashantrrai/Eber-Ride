import { AuthService } from './../../Service/auth.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UsersService } from 'src/app/Service/users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {

  
  userupdateForm!: FormGroup;
  AddForm!: FormGroup;
  AddbuttonForm: boolean = false;
  updateForm: boolean = false;
  selectedUSER: any;
  usersArray: any[] = [];
  countrycode: any[] = [];


    
    constructor(private _users: UsersService, private formBuilder: FormBuilder,private toastr: ToastrService, private authService: AuthService) { }

    ngOnInit(): void {
      this.fetchUserData();
      this.fetchCountryDataAPI()
      
      this.userupdateForm = this.formBuilder.group({
        profile: [''],
        username: ['', Validators.required],
        useremail: ['', Validators.required],
        countrycode: ['', Validators.required],
        userphone: ['', Validators.required],
        // Add other form controls based on your requirements
      });
    }



    fetchUserData(): void {
      this._users.getuserData().subscribe({
        next: (users: any) => {
          this.usersArray = users.data.map((user: any) => ({

            _id: user._id,
            profile: user.profile,
            username: user.username,
            useremail: user.useremail,
            countrycode: user.countrycode,
            userphone: user.phone,
          }));

        },
        error: (error: any) => {
          console.log(error.error.message)
          alert(error.error.message)
        }
    });
    }

    fetchCountryDataAPI() :void{
      this._users.fetchCountryAPI().subscribe({
        next: (countries) => {
            countries.forEach((code: any) => {
              if (code.idd.suffixes) {
                let cc = code.idd.root + code.idd.suffixes[0];
                this.countrycode.push(cc);
              }
            });
            this.countrycode.sort();
            },
            error: (error: any) => {
              console.log(error);
            },
          });
    }
  


    updateBtnClick(user: any): void{
      this.selectedUSER = user;
      this.updateForm = true;

      this.userupdateForm.patchValue({
        profile: this.selectedUSER.profile,
        username: this.selectedUSER.username,
        useremail: this.selectedUSER.useremail, 
        countrycode: this.selectedUSER.countrycode,
        userphone: this.selectedUSER.userphone,
      });
    }

    adminUpdate(userId: string): void{
      const updatedData = this.userupdateForm.value;

      this._users.updateUser(userId, updatedData).subscribe({
        next: (response: any) => {
          // alert(response.message)
          this.fetchUserData();
          this.updateForm = !this.updateForm;
          this.toastr.success(response.message);

        },
        error: (error: any) => {
          console.log(error.error.message)
          this.toastr.error(error.error.message);
        }
      })
    }

    updateCancel(){
      this.updateForm = !this.updateForm;
    }

    deleteAdmin(userId: string): void {
      const confirmation = confirm('Are you sure you want to delete this admin?');

      if (confirmation) {
        this._users.deleteUser(userId).subscribe({
          next: (response: any) => {
            // alert('Admin Deleted Successfully');
            this.fetchUserData(); // Fetch updated user data after deletion
            this.toastr.success(response.message);

          },
          error: (error: any) => {
            alert('Failed to delete admin');
            console.log(error.error.message)
            this.toastr.error(error.error.message);
          }
      });
      }
    }


    onSelected(code: string) {
      console.log(code)

      }
    
    AddUser() {
    if (this.AddForm.valid) {
      const userdata = this.AddForm.value;

      this._users.addUser(userdata).subscribe({
      next:  (res) => {
        this.AddForm.reset();
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

    clickuser(){
      alert("working")
    }

}
