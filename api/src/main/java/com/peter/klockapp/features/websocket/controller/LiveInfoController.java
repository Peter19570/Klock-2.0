package com.peter.klockapp.features.websocket.controller;

import com.peter.klockapp.features.shared.dto.CustomUserPrincipal;
import com.peter.klockapp.features.websocket.dto.request.LiveUserInfoRequest;
import com.peter.klockapp.features.websocket.dto.response.LiveUserInfoResponse;
import com.peter.klockapp.features.websocket.service.LiveInfoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class LiveInfoController {

    private final SimpMessagingTemplate simpMessagingTemplate;
    private final LiveInfoService liveInfoService;

    @MessageMapping("/location")
    public void broadcastUserInfo(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid LiveUserInfoRequest request){
        LiveUserInfoResponse response = liveInfoService.broadcastUserInfo(principal.user(), request);
        simpMessagingTemplate.convertAndSend("/topic/user-info", response);
    }
}
