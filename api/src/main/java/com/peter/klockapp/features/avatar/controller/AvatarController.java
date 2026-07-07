package com.peter.klockapp.features.avatar.controller;

import com.peter.klockapp.features.avatar.service.AvatarService;
import com.peter.klockapp.features.shared.dto.ApiResponse;
import com.peter.klockapp.features.shared.dto.CustomUserPrincipal;
import com.peter.klockapp.features.storage.dto.CloudinaryResponse;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/avatar")
@RequiredArgsConstructor
@Tag(name = "Avatar", description = "Handles profile photo uploads with Cloudinary as storage provider")
public class AvatarController {

    private final AvatarService avatarService;

    @PostMapping("/initialize")
    public ResponseEntity<ApiResponse<CloudinaryResponse>> initializeAvatarUpload(
            @AuthenticationPrincipal CustomUserPrincipal principal){
        CloudinaryResponse response = avatarService.generateAvatarSignature(principal);
        return ResponseEntity.ok(ApiResponse.success("Upload initiated successfully", response));
    }

    @PostMapping("/webhook")
    @Hidden
    public ResponseEntity<Void> cloudinaryWebhook(
            @RequestBody Map<String, Object> payload){
        avatarService.handleCloudinaryWebhook(payload);
        return ResponseEntity.ok().build();
    }
}
