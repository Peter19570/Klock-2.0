package com.peter.klockapp.features.websocket.config;

import com.peter.klockapp.features.auth.config.jwt.JwtService;
import com.peter.klockapp.features.auth.config.userservice.CustomUserDetailsService;
import com.peter.klockapp.features.shared.dto.CustomUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    String userId = jwtService.extractUserId(token);
                    CustomUserPrincipal principal = customUserDetailsService.loadUserById(userId);

                    if (jwtService.isTokenValid(token, principal.id().toString())) {
                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities());
                        accessor.setUser(auth);
                    }
                } catch (Exception e) {
                    return null;
                }
            }
        }
        return message;
    }
}
