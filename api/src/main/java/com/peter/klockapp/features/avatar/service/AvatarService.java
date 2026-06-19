package com.peter.klockapp.features.avatar.service;

import com.peter.klockapp.features.storage.dto.CloudinaryResponse;
import com.peter.klockapp.features.storage.service.CloudinaryService;
import com.peter.klockapp.features.user.dto.request.UserUpdateAvatarRequest;
import com.peter.klockapp.features.user.model.User;
import com.peter.klockapp.features.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AvatarService {

    private final CloudinaryService cloudinaryService;
    private final UserService userService;

    public CloudinaryResponse generateAvatarSignature(User currentUser){
        return cloudinaryService.generateUploadLinkInfo(currentUser);
    }

    public void handleCloudinaryWebhook(Map<String, Object> payload){
        String notificationType = (String) payload.get("notification_type");

        if ("upload".equals(notificationType)) {
            String secureUrl = (String) payload.get("secure_url");
            String publicId = (String) payload.get("public_id");

            Map<String, Object> context = (Map<String, Object>) payload.get("context");
            Map<String, Object> customData = (Map<String, Object>) context.get("custom");

            UUID userId = UUID.fromString((String) customData.get("user_id"));
            UUID orgId = UUID.fromString((String) customData.get("org_id"));

            userService.updateUserAvatar(
                    new UserUpdateAvatarRequest(userId, orgId, secureUrl, publicId));
        } else {
            throw new IllegalStateException("Invalid webhook");
        }
    }
}
