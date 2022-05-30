import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { NgxSpinnerService } from 'ngx-spinner';
import { of, Subject, timer } from 'rxjs';
import { map, share, switchMap, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { UserModel } from 'src/app/services/entitys/user.model';
import { MobileSupportServive } from 'src/app/services/mobile-support.service';
enum FormField {
  email = 'email',
  password = 'password',
}
class UserLogin {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FormField = FormField;
  form: FormGroup;
  submited = false;
  code;
  array = [1, 2, 3, 4];
  rxTime = new Date();
  localIp = '10.40.0.1';
  constructor(
    private route: ActivatedRoute,
    public mobiSupport: MobileSupportServive,
    private spiner: NgxSpinnerService,
    private router: Router,
    public alertController: AlertController,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}
  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params.email) {
        this.spiner.show();
        of({ email: params.email, token: '' } as UserModel)
          .pipe(
            switchMap((user) => this.authService.createAccountMikrotik(user))
          )
          .subscribe((data: UserModel) => {
            this.spiner.hide();
            if (data) {
              if (data.email.includes('.edu.vn')) {
                window.location.href =
                  'http://' +
                  this.localIp +
                  '/login?dst=https://google.com&username=' +
                  data.email +
                  '&password=' +
                  data.email;
              } else {
                this.notifyCreate(
                  'Vui lòng đăng nhập bằng tài khoản sinh viên',
                  'Tài khoản không hợp lệ'
                );
              }
            } else {
              this.notifyCreate('Server Error', 'Cannot connect Mikrotik');
            }
          });
      }
    });
    timer(0, 1000)
      .pipe(
        map(() => new Date()),
        share(),
        takeUntil(this.destroy$)
      )
      .subscribe((time) => {
        this.rxTime = time;
      });

    this.form = this.formBuilder.group({
      [FormField.email]: [null, [Validators.required, Validators.email]],
      [FormField.password]: [null, [Validators.required]],
    });
  }

  loginByCode() {
    if (this.code) {
      return this.authService
        .checkUserMikrotik(this.code)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: boolean) => {
          if (data) {
            window.location.href =
              'http://' +
              this.localIp +
              '/login?dst=https://google.com&username=' +
              this.code +
              '&password=' +
              this.code;
          } else {
            this.notifyCreate('Mã code không đúng', 'Vui lòng kiểm tra lại');
          }
        });
    } else {
      this.notifyCreate('Vui lòng nhập mã code', 'Mã code không được để trống');
    }
  }
  navigateHome() {
    this.router.navigate(['/home']);
  }

   iOS() {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform);
}


  loginGoogle() {
    if(this.iOS()) {
      // eslint-disable-next-line max-len
      window.location.href = 'https://accounts.google.com/signin/v2/identifier?hl=en&service=blogger&continue=https%3A%2F%2Fwww.blogger.com%2Fcomment%2Fredirect%3FblogId%3D8877218292843839309%26po%3D8740608166613385479&flowName=GlifWebSignIn&flowEntry=ServiceLogin';
      return;
    }
    this.spiner.show();
    this.authService
      .googleSignIn()
      .pipe(
        switchMap((user) => this.authService.createAccountMikrotik(user)),
        takeUntil(this.destroy$)
      )
      .subscribe((data: UserModel) => {
        this.spiner.hide();
        if (data) {
          if (data.email.includes('.edu.vn')) {
            window.location.href =
              'http://' +
              this.localIp +
              '/login?dst=https://google.com&username=' +
              data.email +
              '&password=' +
              data.email;
          } else {
            this.notifyCreate(
              'Vui lòng đăng nhập bằng tài khoản sinh viên',
              'Tài khoản không hợp lệ'
            );
          }
        } else {
          this.notifyCreate('Server Error', 'Cannot connect Mikrotik');
        }
      });
  }
  login() {
    this.spiner.show();
    this.submited = true;
    if (this.form.valid) {
      if (this.form.controls[FormField.email].status === 'INVALID') {
        this.notifyCreate(
          'Thông tin không hợp lệ',
          'Địa chỉ email không hợp lệ'
        );
        return;
      }
      const user: UserLogin = this.form.getRawValue() as UserLogin;
      this.authService
        .login(user.email, user.password)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res) => {
            this.spiner.hide();
            this.router.navigate(['/home/tabs/tab1']);
          },
          (error) => {
            this.spiner.hide();
            if (error.code === 'auth/user-not-found') {
              this.notifyCreate(
                'Vui lòng kiểm tra địa chỉ email',
                'Địa chỉ email không tồn tại'
              );
              return;
            }
            if (error.code === 'auth/wrong-password') {
              this.notifyCreate(
                'Vui lòng kiểm tra mật khẩu',
                'Mật khẩu không đúng'
              );
              return;
            }
          }
        );
    } else {
      this.spiner.hide();
    }
  }
  notifyCreate(header: string, massage: string) {
    this.alertController
      .create({
        mode: 'ios',
        header,
        message: massage,
        buttons: [
          {
            text: 'OK',
          },
        ],
      })
      .then((alert) => {
        alert.present();
      });
  }
}
