import { AuthService } from "./../../Service/auth.service";
import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { UsersService } from "src/app/Service/users.service";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.css"],
})
export class UsersComponent {
  userupdateForm!: FormGroup;
  AddForm!: FormGroup;
  AddbuttonForm: boolean = false;
  updateForm: boolean = false;
  usersArray: any[] = [];
  countrycode: any[] = [];
  file: any;
  selectedCC: any;
  id: any;
  // page: any;
  // tableSize: any | null = null;
  count: any;

  searchValue: string = '';

  limit: number = 5;
  currentPage: number = 1;
  totalPages: number = 0;
  paginatedUsers: any[] = [];

  constructor(
    private _users: UsersService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getUserData();
    this.fetchCountryDataAPI();

    this.AddForm = this.formBuilder.group({
      profile: [""],
      username: ["", [Validators.required]],
      useremail: ["", [Validators.required, Validators.email]],
      userphone: ["", [Validators.required, Validators.minLength(10)]],
    });

    this.userupdateForm = this.formBuilder.group({
      updateusername: ["", [Validators.required]],
      updateuseremail: ["", [Validators.required, Validators.email]],
      updatecountrycode: [""],
      updateuserphone: ["", [Validators.required, Validators.minLength(10)]],
    });
  }

  // getUserData(): void {
  //   this._users.getuserData().subscribe({
  //     next: (users: any) => {
  //       // console.log(users);

  //       if (users) {
  //         this.usersArray = users;
  //       } else {
  //         console.warn("No user data found");
  //       }
  //     },
  //     error: (error: any) => {
  //       console.log(error.error.message);
  //       // alert(error.error.message);
  //     },
  //   });
  // }

  getUserData() {
    this._users.getUsers(this.currentPage, this.limit).subscribe({
      next: (data: any) => {
        console.log(data)
        this.usersArray = data.userdata;
        this.totalPages = data.totalPages;
      },
      error: (error: any) => {
        console.log(error.error.message);
        alert(error.error.message);
      },
    });
  }



  onPageSizeChange(event: any): void {
    this.limit = parseInt(event.target.value); // Parse the limit value as an integer

    // Reset the current page to 1 when the limit changes
    this.currentPage = 1;

    // Update the paginatedUsers array based on the new limit and current page
    this.updatePaginatedUsers();

    this.getUserData();
  }

  onPageChange(pageNumber: number) {
    // Validate the new page number
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;

    // Update the paginatedUsers array based on the new page
    this.updatePaginatedUsers();

    this.getUserData();
    }
  }

  updatePaginatedUsers() {
    const startIndex = (this.currentPage - 1) * this.limit;
    const endIndex = startIndex + this.limit;

    this.paginatedUsers = this.usersArray.slice(startIndex, endIndex);
  }

  getPagesArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, index) => index + 1);
  }


  fetchCountryDataAPI(): void {
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
    this.selectedCC = value;
    // console.log(value)
  }

  onFileSelected(event: any) {
    this.file = event.target.files[0];
    console.log(this.file);
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
          this.usersArray.push(resp.newUser);
          this.AddForm.reset();
          this.AddbuttonForm = false;
          this.getUserData();
          this.toastr.success(resp.message);
        },
        error: (error: any) => {
          console.log(error.error.message);
          this.toastr.error(error.message);
        },
      });
    } else {
      this.toastr.warning("All Fields are Required");
    }
  }

  deleteAdmin(userId: string): void {
    const confirmation = confirm("Are you sure you want to delete this user?");

    if (confirmation) {
      this._users.deleteUser(userId).subscribe({
        next: (response: any) => {
          this.usersArray.push(response.newUser);
          this.getUserData();
          this.toastr.success(response.message);
        },
        error: (error: any) => {
          console.log(error.error.message);
          this.toastr.error(error.error.message);
        },
      });
    }
  }

  updateBtnClick(user: any): void {
    this.id = user._id;
    this.updateForm = true;
    // console.log(user._id)
    // console.log(user)
    this.userupdateForm.patchValue({
      updateusername: user.username,
      updateuseremail: user.useremail,
      updatecountrycode: user.countrycode,
      updateuserphone: user.userphone,
    });
    // console.log(this.userupdateForm.value)
  }

  updateUSER(): void {
    const updatedData = this.userupdateForm.value;
    var formdata = new FormData();
    formdata.append("profile", this.file);
    formdata.append("updateusername", updatedData.updateusername);
    formdata.append("updateuseremail", updatedData.updateuseremail);
    formdata.append("updatecountrycode", updatedData.updatecountrycode);
    formdata.append("updateuserphone", updatedData.updateuserphone);
    console.log(formdata);
    this._users.updateUser(this.id, formdata).subscribe({
      next: (response: any) => {
        console.log(response);
        this.usersArray.push(response.updatedUser);
        this.getUserData();
        this.userupdateForm.reset();
        this.updateForm = !this.updateForm;
        this.toastr.success(response.message);
      },
      error: (error: any) => {
        console.log(error);
        this.toastr.error(error.error.message);
      },
    });
  }



  searchUsers() {
    // console.log(this.searchValue)
    this._users.searchUsers(this.searchValue, this.currentPage, this.limit).subscribe({
      next: (response: any) => {
        this.usersArray = response.userdata;
        this.totalPages = response.totalPages;
      },
      error: (error: any) => {
        console.log(error.error.message);
        alert(error.error.message);
      }
  });
  }
  
  updateCancel() {
    this.updateForm = !this.updateForm;
  }
  

  toggleFormVisibility() {
    this.AddbuttonForm = !this.AddbuttonForm;
  }

  // onPageChange(event: any): void {
  //   this.page = event;
  //   this.getUserData();
  // }

  // onPageSizeChange(event: any): void {
  //   this.tableSize = event.target.value;
  //   this.page = 1;
  //   this.getUserData();
  // }

  resetTimer() {
    this.authService.resetInactivityTimer();
  }
}
