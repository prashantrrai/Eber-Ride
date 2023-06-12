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
  file: any;
  selectedCC: any;


    
    constructor(private _users: UsersService, private formBuilder: FormBuilder,private toastr: ToastrService, private authService: AuthService) { }

    ngOnInit(): void {
      this.getUserData();
      this.fetchCountryDataAPI()


      this.AddForm = this.formBuilder.group({
        username: ['', [Validators.required]],
        useremail: ['', [Validators.required, Validators.email]],
        userphone: ['', [Validators.required, Validators.minLength(10)]],
      });

      // this.userupdateForm = this.formBuilder.group({
      //   profile: [''],
      //   username: ['', [Validators.required]],
      //   useremail: ['', [Validators.required, Validators.email]],
      //   countrycode: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      //   userphone: ['', [Validators.required]],
      // });
    }



    getUserData(): void {
      this._users.getuserData().subscribe({
        next: (users: any) => {
          // console.log(users);
          
          if (users) {
            this.usersArray = users;
          } else {
            console.warn('No user data found');
          }
        },
        error: (error: any) => {
          console.log(error.error.message);
          // alert(error.error.message);
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
  


    onSelected(value: any) {
      this.selectedCC = value
      // console.log(value)
    }

    onFileSelected(event: any) {
      this.file = event.target.files[0];
      // console.log(this.file)
    }
    

    AddUser() {
      var formData = new FormData();
      formData.append("profile", this.file);
      formData.append("username", this.AddForm.value.username);
      formData.append("useremail", this.AddForm.value.useremail);
      formData.append("countrycode", this.selectedCC);
      formData.append("userphone", this.AddForm.value.userphone);
     
      if (this.AddForm.valid) {
        this._users.addUser(formData).subscribe({
        next: (resp: any) => {
          this.usersArray.push(resp.newUser)
          this.getUserData();
          this.toastr.success(resp.message);
          // alert("Addded")
        },
        error: (error: any) => {
          console.log(error.error.message);
          this.toastr.error(error.message);
        }
      })
      }
      else{
        this.toastr.warning('All Fields are Required');
      }
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
          this.getUserData();
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
            this.toastr.success(response.message);
            this.getUserData(); // Fetch updated user data after deletion

          },
          error: (error: any) => {
            alert('Failed to delete admin');
            console.log(error.error.message)
            this.toastr.error(error.error.message);
          }
      });
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
