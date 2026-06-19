package com.peter.klockapp.features.storage.dto;

public record CloudinaryResponse(
        String signature,
        long timeStamp,
        String customPublicId,
        String apiKey,
        String cloudName,
        String folder,
        String uploadPreset,
        String context
) {
}
