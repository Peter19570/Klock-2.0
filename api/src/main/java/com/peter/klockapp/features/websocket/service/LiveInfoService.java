package com.peter.klockapp.features.websocket.service;

import com.peter.klockapp.features.auth.exceptions.NotFoundException;
import com.peter.klockapp.features.clockevent.repo.ClockEventRepo;
import com.peter.klockapp.features.session.model.Session;
import com.peter.klockapp.features.session.repo.SessionRepo;
import com.peter.klockapp.features.user.model.User;
import com.peter.klockapp.features.websocket.dto.request.LiveUserInfoRequest;
import com.peter.klockapp.features.websocket.dto.response.LiveUserInfoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LiveInfoService {

    private final ClockEventRepo clockEventRepo;
    private final SessionRepo sessionRepo;

    public LiveUserInfoResponse broadcastUserInfo(User currentUser, LiveUserInfoRequest request){
        String userId = currentUser.getId().toString();
        String email = currentUser.getEmail();
        String fullName = currentUser.getFirstName() + " " + currentUser.getLastName();
        String latitude = request.latitude().toString();
        String longitude = request.longitude().toString();
        String timeStamp = Instant.now().toString();
        String clockEventStatus = getClockEvent(currentUser);
        LiveUserInfoResponse.SessionInfo sessionInfo = getSessionInfo(currentUser);

        return new LiveUserInfoResponse(
                userId,
                email,
                fullName,
                latitude,
                longitude,
                timeStamp,
                clockEventStatus,
                sessionInfo
        );
    }

    private LiveUserInfoResponse.SessionInfo getSessionInfo(User user){
        Session session = sessionRepo.findByWorkDateAndUserIdAndUserOrganizationId(
                LocalDate.now(), user.getId(), user.getOrganization().getId())
                .orElseThrow(() -> new NotFoundException("Session not found"));
        return new LiveUserInfoResponse
                .SessionInfo(session.getStatus().toString(), session.getArrivalStatus().toString());
    }

    private String getClockEvent(User user){
        boolean active = clockEventRepo.existsBySessionUserIdAndUserOrganizationIdAndClockOutTimeIsNull(
                user.getId(), user.getOrganization().getId());
        return active ? "CLOCKED IN" : "CLOCKED OUT";
    }
}
