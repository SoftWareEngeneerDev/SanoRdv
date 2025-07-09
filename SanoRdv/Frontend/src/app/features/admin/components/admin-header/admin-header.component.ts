import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Admin } from '../../models/admin.model';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent implements OnInit {

     admin!: Admin;
    @Input() isCollapsed: boolean = false;

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit(): void {
    this.adminService.getAdmin().subscribe((data) => {
      this.admin = data;
    });
  }

  allerAuProfil(): void {
    // navigation vers le profil
  }

  notification(): void {
    this.router.navigate(['/admin/notifications']);
  }

}
