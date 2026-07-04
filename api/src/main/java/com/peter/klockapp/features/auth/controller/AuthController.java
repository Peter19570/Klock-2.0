package com.peter.klockapp.features.auth.controller;

import com.peter.klockapp.features.auth.dto.request.*;
import com.peter.klockapp.features.auth.dto.response.AuthResponse;
import com.peter.klockapp.features.auth.dto.response.TokenResponse;
import com.peter.klockapp.features.auth.service.AuthService;
import com.peter.klockapp.features.shared.dto.ApiResponse;
import com.peter.klockapp.features.shared.dto.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Maximum auth at hand | with event driven emails sent")
public class AuthController {

    private final AuthService authService;

//    =========================================================================================
//    MAJOR AUTHENTICATION METHODS HERE
//    =========================================================================================

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody AuthRequest request
    ) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login success", response));
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> logout(
            @Valid @RequestBody RefreshTokenRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        authService.logout(request, principal);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Logout success",
                        "You have successfully logged out of your account."));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request
    ) {
        TokenResponse response = authService.refresh(request);
        return ResponseEntity.ok(ApiResponse.success("Token refresh success", response));
    }

//    =========================================================================================
//    EMAIL RELATED METHODS HERE
//    =========================================================================================

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(
            @RequestParam @NotNull(message = "Token is required") String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(new ApiResponse<>(
                "Verification Complete",
                "Identity verification successful."));
    }

    @PostMapping("/change-email")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> requestChange(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody @Valid EmailChangeRequest request) {

        authService.requestEmailChange(principal, request);
        return ResponseEntity.ok(ApiResponse.success(
                "Verification Required",
                "Please check your new inbox and click the secure activation link we just sent you."));
    }

    @GetMapping("/confirm-email")
    public ResponseEntity<ApiResponse<String>> confirmChange(
            @RequestParam("token") @NotNull(message = "Token is required") String token) {
        authService.confirmEmailChange(token);
        return ResponseEntity.ok(ApiResponse.success(
                "Email Address Updated",
                "Your primary email address has been successfully changed."));
    }

//    =========================================================================================
//    PASSWORD RELATED METHODS HERE
//    =========================================================================================

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request);
        return ResponseEntity.ok(ApiResponse.success(
                "Password Reset Initiated",
                "An email containing further instructions has been dispatched to " +
                        "the provided address, provided a corresponding account exists."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(ApiResponse.success(
                "Password Updated",
                "Your password has been successfully reset." +
                        " You may now log in with your new credentials."));
    }
}
