package com.peter.klockapp.features.user.controller;

import com.peter.klockapp.features.auth.dto.request.AccountDeletionRequest;
import com.peter.klockapp.features.shared.dto.ApiResponse;
import com.peter.klockapp.features.shared.dto.CustomUserPrincipal;
import com.peter.klockapp.features.shared.dto.PageResponse;
import com.peter.klockapp.features.user.dto.request.AdminCreateUserRequest;
import com.peter.klockapp.features.user.dto.request.UserChangePassword;
import com.peter.klockapp.features.user.dto.request.UserDeviceIdRequest;
import com.peter.klockapp.features.user.dto.request.UserUpdateRequest;
import com.peter.klockapp.features.user.dto.response.UserDetailedResponse;
import com.peter.klockapp.features.user.dto.response.UserResponse;
import com.peter.klockapp.features.user.enums.UserRole;
import com.peter.klockapp.features.user.filters.UserFilter;
import com.peter.klockapp.features.user.service.UserService;
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

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "All user related actions happen here and is managed here as well")
public class UserController {

    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody AdminCreateUserRequest request){
        UserResponse response = userService.create(request, principal);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("New user created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAllUsers(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) UserRole userRole,
            @RequestParam(required = false) UUID branchId,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) Instant minCreatedAt,
            @RequestParam(required = false) Instant maxCreatedAt){

        UserFilter filter = UserFilter.builder()
                .email(email)
                .name(name)
                .userRole(userRole)
                .branchId(branchId)
                .phone(phone)
                .minCreatedAt(minCreatedAt)
                .maxCreatedAt(maxCreatedAt)
                .build();

        Pageable pageable = PageRequest.of(page, 50, Sort.by("createdAt").descending());
        PageResponse<UserResponse> userResponses = userService.findAll(pageable, filter, principal);
        return ResponseEntity.ok(ApiResponse.success("User list", userResponses));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<UserDetailedResponse>> getById(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable UUID id){
        UserDetailedResponse response = userService.findById(principal);
        return ResponseEntity.ok(ApiResponse.success("Selected user information", response));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> update(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody UserUpdateRequest request,
            @PathVariable UUID id){
        UserResponse response = userService.update(request, id, principal);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable UUID id){
        userService.delete(principal, id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/device-id")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> resetDeviceId(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable UUID id){
        userService.resetDeviceIdToDefault(id, principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDetailedResponse>> getCurrentUser(
            @AuthenticationPrincipal CustomUserPrincipal principal){
        UserDetailedResponse response = userService.findById(principal);
        return ResponseEntity.ok(ApiResponse.success("Current user information", response));
    }

    @PostMapping("/me/deletion-request")
    public ResponseEntity<Void> requestDeletion(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        userService.createDeletionRequest(principal);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> confirmDeletion(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody AccountDeletionRequest request) {
        userService.confirmDeletionRequest(principal, request);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me/device-id")
    public ResponseEntity<Void> updateDeviceId(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody UserDeviceIdRequest request){
        userService.updateDeviceId(request, principal);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me/avatar")
    public ResponseEntity<Void> deleteAvatar(
            @AuthenticationPrincipal CustomUserPrincipal principal) throws IOException {
        userService.deleteUserAvatar(principal);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/me/change-password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody @Valid UserChangePassword request){
        userService.changePasswordOnLogin(request, principal);
        return ResponseEntity.noContent().build();
    }
}
