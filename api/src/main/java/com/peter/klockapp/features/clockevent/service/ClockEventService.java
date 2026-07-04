package com.peter.klockapp.features.clockevent.service;

import com.peter.klockapp.features.audit.dto.AuditRequest;
import com.peter.klockapp.features.audit.enums.AuditAction;
import com.peter.klockapp.features.auth.exceptions.NotFoundException;
import com.peter.klockapp.features.branch.model.Branch;
import com.peter.klockapp.features.branch.service.BranchService;
import com.peter.klockapp.features.clockevent.dto.request.ClockInRequest;
import com.peter.klockapp.features.clockevent.dto.request.ClockOutRequest;
import com.peter.klockapp.features.clockevent.dto.response.ClockEventResponse;
import com.peter.klockapp.features.clockevent.enums.ClockOutType;
import com.peter.klockapp.features.clockevent.mapper.ClockEventMapper;
import com.peter.klockapp.features.clockevent.model.ClockEvent;
import com.peter.klockapp.features.clockevent.repo.ClockEventRepo;
import com.peter.klockapp.features.session.enums.SessionStatus;
import com.peter.klockapp.features.session.model.Session;
import com.peter.klockapp.features.session.repo.SessionRepo;
import com.peter.klockapp.features.session.service.SessionService;
import com.peter.klockapp.features.shared.dto.CustomUserPrincipal;
import com.peter.klockapp.features.shared.util.LocationUtility;
import com.peter.klockapp.features.user.model.User;
import com.peter.klockapp.features.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class ClockEventService {

    private final ClockEventRepo clockEventRepo;
    private final ClockEventMapper clockEventMapper;
    private final BranchService branchService;
    private final SessionService sessionService;
    private final UserService userService;
    private final SessionRepo sessionRepo;
    private final ApplicationEventPublisher eventPublisher;

    public ClockEventResponse clockIn(ClockInRequest request, CustomUserPrincipal principal)
            throws BadRequestException {

        User currentUser = userService.fetchCurrentUser(principal);

        Branch targetBranch = branchService.getTargetBranch(
                request.latitude(), request.longitude(), principal);

        double distance = LocationUtility.calculateDistance(
                request.latitude(), request.longitude(),
                targetBranch.getLatitude(), targetBranch.getLongitude());

        // Calculate time diff btw the client and server times in seconds
        long normalDiff = Math.abs(Duration.between(
                request.clientTimeStamp(), LocalTime.now()).getSeconds());

        long delayedDiff = Math.abs(Duration.between(
                request.clientTimeStamp(), LocalTime.now()).getSeconds());

        if (clockEventRepo.existsBySessionUserIdAndUserOrganizationIdAndClockOutTimeIsNull(
                currentUser.getId(), currentUser.getOrganization().getId())) {
            throw new IllegalStateException(
                    "You must clock out of your current branch before clocking in elsewhere.");
        }

        if (true == request.isDelaySync()){
            if (delayedDiff > 86400){
                throw new BadRequestException("Clock in request is expired");
            }
        } else {
            if (normalDiff > 30) {
                throw new BadRequestException("Time mismatch between client and server");
            }
        }

        if (request.accuracy() > 200){
            throw new BadRequestException("Location accuracy is low. Trying again.");
        }

        if (request.clientTimeStamp().isAfter(targetBranch.getShiftEnd())){
            throw new BadRequestException("Cannot clock-in at a branch past its end-shift");
        }

        if ("NOT SET".equals(currentUser.getDeviceId())){
            throw new BadRequestException("User has no saved device ID");
        }

        if (!(currentUser.getDeviceId().equals(request.deviceId()))){
            eventPublisher.publishEvent(new AuditRequest(currentUser, AuditAction.DIFFERENT_DEVICE_DETECT,
                    Map.of("message", "Saved device ID does not match current device ID")));

//            throw new BadRequestException("Saved device ID does not match current device ID");
        }

        Session session = sessionService.getOrCreateSession(targetBranch, currentUser);
        session.setStatus(SessionStatus.ACTIVE);
        ClockEvent event = clockEventMapper.toEntity(request);
        event.setSession(session);
        event.setUser(currentUser);
        event.setBranch(targetBranch);
        event.setClockInTime(Instant.now());
        event.setOrganization(currentUser.getOrganization());
        event.setClockInDistanceFromBranch(distance);

        eventPublisher.publishEvent(new AuditRequest(currentUser, AuditAction.CLOCK_IN_SUCCESS,
                Map.of(
                        "message", "User clocked in",
                        "deviceId", request.deviceId(),
                        "gps accuracy", request.accuracy(),
                        "batteryLevel", request.batteryLevel(),
//                        "signalStrength", request.signalStrength(),
                        "clientTimeStamp", request.clientTimeStamp(),
                        "isDelaySync", request.isDelaySync()
                )));

        return clockEventMapper.toDto(clockEventRepo.save(event));
    }

    public ClockEventResponse clockOut(ClockOutRequest request, CustomUserPrincipal principal){
        User currentUser = userService.fetchCurrentUser(principal);

        ClockEvent activeClockEvent = clockEventRepo
                .findBySessionUserIdAndUserOrganizationIdAndClockOutTimeIsNull(
                        principal.id(), principal.orgId())
                .orElseThrow(() -> new NotFoundException("No active clock-in session found."));

        Session activeSession = sessionRepo.findByWorkDateAndUserIdAndUserOrganizationId(
                LocalDate.now(), principal.id(), principal.orgId())
                .orElseThrow(() -> new NotFoundException("Session not found"));

        double distance = LocationUtility.calculateDistance(
                request.latitude(), request.longitude(),
                activeClockEvent.getLatitude(), activeClockEvent.getLongitude());

        Duration limit = Duration.ofMinutes(2);
        Duration eventDiff = Duration.between(activeClockEvent.getClockInTime(),Instant.now());

        if (distance > 100){
            eventPublisher.publishEvent(new AuditRequest(currentUser, AuditAction.SUSPICIOUS_CLOCK_OUT,
                    Map.of("message", "Suspicious clock out")));
        }

        if (eventDiff.compareTo(limit) < 0){
            clockEventRepo.delete(activeClockEvent);
            activeSession.setStatus(SessionStatus.COMPLETED);

            eventPublisher.publishEvent(new AuditRequest(currentUser, AuditAction.AMBIGUOUS_CLOCK_EVENT,
                    Map.of("message", "Ambiguous clock event deleted")));

            return null;
        }

        if (LocalTime.now().isBefore(activeClockEvent.getBranch().getShiftEnd())){
            activeClockEvent.setDepartedEarly(true);
        }

        activeClockEvent.setClockInOutDistance(distance);
        activeClockEvent.setClockOutTime(Instant.now());
        activeClockEvent.setClockOutType(request.clockOutType() != null ?
                request.clockOutType() : ClockOutType.MANUAL);

        activeSession.setStatus(SessionStatus.COMPLETED);

        eventPublisher.publishEvent(new AuditRequest(currentUser, AuditAction.CLOCK_OUT_SUCCESS,
                Map.of("message", "Clock out success")));

        return clockEventMapper.toDto(clockEventRepo.save(activeClockEvent));
    }

    @Transactional(readOnly = true)
    public Boolean isActive(CustomUserPrincipal principal) {
        return clockEventRepo.existsBySessionUserIdAndUserOrganizationIdAndClockOutTimeIsNull(
                principal.id(), principal.orgId());
    }
}
