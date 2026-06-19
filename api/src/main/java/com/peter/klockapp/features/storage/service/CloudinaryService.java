package com.peter.klockapp.features.storage.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.peter.klockapp.features.storage.dto.CloudinaryResponse;
import com.peter.klockapp.features.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CloudinaryService {

    @Value("${app.cloudinary.folder.name}")
    private String folderName;

    @Value("${app.cloudinary.upload.preset}")
    private String uploadPreset;

    private final Cloudinary cloudinary;

    public CloudinaryResponse generateUploadLinkInfo(User currentUser){
        long timeStamp = System.currentTimeMillis()/1000L;
        String customPublicId = "file_" + UUID.randomUUID().toString().replace("-","");
        String userId = currentUser.getId().toString();
        String orgId = currentUser.getOrganization().getId().toString();

        Map<String, Object> params = new TreeMap<>();
        params.put("public_id", customPublicId);
        params.put("timestamp", timeStamp);
        params.put("folder", folderName);
        params.put("upload_preset", uploadPreset);

        String customContext = "user_id=" + userId + "|org_id=" + orgId;
        params.put("context", customContext);

        String signature = cloudinary.apiSignRequest(params, cloudinary.config.apiSecret, 1);

        return new CloudinaryResponse(
                signature,
                timeStamp,
                customPublicId,
                cloudinary.config.apiKey,
                cloudinary.config.cloudName,
                folderName,
                uploadPreset,
                customContext
        );
    }

    public void deletePhotoFromCloud(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
