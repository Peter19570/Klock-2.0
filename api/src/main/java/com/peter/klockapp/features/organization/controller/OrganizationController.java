package com.peter.klockapp.features.organization.controller;

import com.peter.klockapp.features.organization.dto.request.OrganizationRequest;
import com.peter.klockapp.features.organization.dto.request.OrganizationUpdateRequest;
import com.peter.klockapp.features.organization.dto.response.OrganizationDetailedResponse;
import com.peter.klockapp.features.organization.dto.response.OrganizationResponse;
import com.peter.klockapp.features.organization.service.OrganizationService;
import com.peter.klockapp.features.shared.dto.ApiResponse;
import com.peter.klockapp.features.shared.dto.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/organization")
@RequiredArgsConstructor
@Tag(name = "Organization")
public class OrganizationController {

    private final OrganizationService organizationService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrganizationResponse>> createOrg(
            @RequestBody @Valid OrganizationRequest request){
        OrganizationResponse response = organizationService.createOrg(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Organization Created Successfully", response));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated() and hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<OrganizationDetailedResponse>> getDetailedOrg(
            @AuthenticationPrincipal CustomUserPrincipal principal){
        OrganizationDetailedResponse response = organizationService.getDetailedOrg(principal);
        return ResponseEntity.ok(ApiResponse.success("Organization Information", response));
    }

    @PatchMapping
    @PreAuthorize("isAuthenticated() and hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<OrganizationDetailedResponse>> updateOrg(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody OrganizationUpdateRequest request){
        OrganizationDetailedResponse response = organizationService.updateOrg(request, principal);
        return ResponseEntity.ok(ApiResponse.success("Organization Successfully Updated", response));
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated() and hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteOrg(
            @AuthenticationPrincipal CustomUserPrincipal principal){
        organizationService.deleteOrg(principal);
        return ResponseEntity.noContent().build();
    }
}
