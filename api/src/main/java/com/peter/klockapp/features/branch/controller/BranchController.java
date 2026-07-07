package com.peter.klockapp.features.branch.controller;

import com.peter.klockapp.features.branch.dto.request.BranchRequest;
import com.peter.klockapp.features.branch.dto.response.BranchDetailedResponse;
import com.peter.klockapp.features.branch.dto.response.BranchResponse;
import com.peter.klockapp.features.branch.dto.response.BranchUserResponse;
import com.peter.klockapp.features.branch.enums.BranchStatus;
import com.peter.klockapp.features.branch.filters.BranchFilter;
import com.peter.klockapp.features.branch.service.BranchService;
import com.peter.klockapp.features.shared.dto.ApiResponse;
import com.peter.klockapp.features.shared.dto.CustomUserPrincipal;
import com.peter.klockapp.features.shared.dto.PageResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/branches")
@RequiredArgsConstructor
@Tag(name = "Branch", description = "Manage the branches with this APIs, Done by Admins and Super Admins")
public class BranchController {

    private final BranchService branchService;

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<BranchResponse>> createBranch(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody @Valid BranchRequest request){
        BranchResponse response = branchService.createBranch(principal, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Branch created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<BranchResponse>>> getBranches(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) String displayName,
            @RequestParam(required = false) BranchStatus branchStatus){

        BranchFilter branchFilter = BranchFilter.builder()
                .displayName(displayName)
                .branchStatus(branchStatus)
                .userOrgId(principal.orgId())
                .build();

        Pageable pageable = PageRequest.of(page, 50, Sort.by("createdAt").descending());
        PageResponse<BranchResponse> responses = branchService.getBranches(pageable, branchFilter);
        return ResponseEntity.ok(ApiResponse.success("All Branches", responses));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<BranchDetailedResponse>> getDetailedBranch(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable UUID id){
        BranchDetailedResponse response = branchService.getDetailedBranch(principal, id);
        return ResponseEntity.ok(ApiResponse.success("Branch Details", response));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<BranchUserResponse>> getDetailedBranchForUser(
            @AuthenticationPrincipal CustomUserPrincipal principal){
        BranchUserResponse response = branchService.getDetailedBranchForUser(principal);
        return ResponseEntity.ok(ApiResponse.success("Active Branch Details", response));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<BranchResponse>> updateBranch(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody @Valid BranchRequest request,
            @PathVariable UUID id){
        BranchResponse response = branchService.updateBranch(principal, id, request);
        return ResponseEntity.ok(ApiResponse.success("Branch updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteBranch(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable UUID id){
        branchService.deleteBranch(principal, id);
        return ResponseEntity.noContent().build();
    }
}
