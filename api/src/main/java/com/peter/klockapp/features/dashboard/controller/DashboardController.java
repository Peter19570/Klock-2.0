package com.peter.klockapp.features.dashboard.controller;

import com.peter.klockapp.features.dashboard.dto.response.DashboardAdminResponse;
import com.peter.klockapp.features.dashboard.dto.response.DashboardSuperAdminResponse;
import com.peter.klockapp.features.dashboard.service.DashboardService;
import com.peter.klockapp.features.shared.dto.ApiResponse;
import com.peter.klockapp.features.shared.dto.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Provides a summary overview of the activities happening in the organization")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/super")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<DashboardSuperAdminResponse>> getSuperAdminDashboard(
            @AuthenticationPrincipal CustomUserPrincipal principal){
        DashboardSuperAdminResponse response = dashboardService.getSuperAdminDashboard(principal);
        return ResponseEntity.ok(ApiResponse.success("Super Admin Dashboard Overview", response));
    }

//    Omo don't forget oo, client has to hit the backend with branchId to see dashboard of that specific branch
    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<DashboardAdminResponse>> getAdminDashBoard(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(required = false) UUID branchId){
        DashboardAdminResponse response = dashboardService.getAdminDashBoard(principal, branchId);
        return ResponseEntity.ok(ApiResponse.success("Admin (Branch) Dashboard Overview", response));
    }
}
