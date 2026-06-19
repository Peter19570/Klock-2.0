package com.peter.klockapp.features.session.service;

import com.peter.klockapp.features.audit.dto.AuditRequest;
import com.peter.klockapp.features.audit.enums.AuditAction;
import com.peter.klockapp.features.auth.exceptions.NotFoundException;
import com.peter.klockapp.features.branch.model.Branch;
import com.peter.klockapp.features.clockevent.enums.ClockOutType;
import com.peter.klockapp.features.clockevent.model.ClockEvent;
import com.peter.klockapp.features.clockevent.repo.ClockEventRepo;
import com.peter.klockapp.features.session.dto.request.ExportToCsvRequest;
import com.peter.klockapp.features.session.dto.response.SessionResponse;
import com.peter.klockapp.features.session.enums.SessionArrivalStatus;
import com.peter.klockapp.features.session.enums.SessionStatus;
import com.peter.klockapp.features.session.filters.SessionFilter;
import com.peter.klockapp.features.session.mapper.SessionMapper;
import com.peter.klockapp.features.session.model.Session;
import com.peter.klockapp.features.session.repo.SessionRepo;
import com.peter.klockapp.features.session.specification.SessionSpecification;
import com.peter.klockapp.features.shared.dto.CustomUserPrincipal;
import com.peter.klockapp.features.user.enums.UserRole;
import com.peter.klockapp.features.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.Writer;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional
public class SessionService {

    private final SessionRepo sessionRepo;
    private final SessionMapper sessionMapper;
    private final ClockEventRepo clockEventRepo;
    private final SessionSpecification sessionSpecification;
    private final ApplicationEventPublisher eventPublisher;

    public Session getOrCreateSession(Branch targetBranch, User currentUser){
        return sessionRepo.findByWorkDateAndUserIdAndUserOrganizationId(
                LocalDate.now(), currentUser.getId(), currentUser.getOrganization().getId())
                .orElseGet(() -> {
                    Session newSession = new Session();
                    newSession.setUser(currentUser);
                    newSession.setArrivalStatus(getArrivalStatus(targetBranch));
                    newSession.setOrganization(currentUser.getOrganization());
                    newSession.setBranch(targetBranch);
                    return sessionRepo.save(newSession);
                });
    }

    @Transactional(readOnly = true)
    public Page<SessionResponse> getAllSessions(
            User currentUser, Pageable pageable, SessionFilter filter) {

        UserRole role = currentUser.getUserRole();

        switch (role) {
            case USER -> {
                filter.setUserId(currentUser.getId());
                filter.setBranchId(currentUser.getBranch().getId());
                filter.setOrganizationId(currentUser.getOrganization().getId());
            }
            case ADMIN -> {
                filter.setBranchId(currentUser.getBranch().getId());
                filter.setOrganizationId(currentUser.getOrganization().getId());
            }
            case SUPER_ADMIN -> {
                filter.setOrganizationId(currentUser.getOrganization().getId());
            }
        }

        return sessionRepo.findAll(sessionSpecification.withFilter(filter), pageable)
                .map(sessionMapper::toDto);
    }

    public void forceEndSession(User currentUser, UUID sessionId){
        Session activeSession = sessionRepo.findByWorkDateAndUserIdAndUserOrganizationId(
                LocalDate.now(), currentUser.getId(), currentUser.getOrganization().getId())
                .orElseThrow(() -> new NotFoundException("Session not found"));

        ClockEvent activeClockEvent = clockEventRepo
                .findBySessionUserIdAndUserOrganizationIdAndClockOutTimeIsNull(
                        sessionId, currentUser.getOrganization().getId())
                .orElseThrow(() -> new NotFoundException("Clock event not found"));

        activeClockEvent.setClockOutTime(Instant.now());
        activeClockEvent.setClockOutType(ClockOutType.ADMIN_FORCE);

        activeSession.setStatus(SessionStatus.COMPLETED);

        eventPublisher.publishEvent(new AuditRequest(currentUser, AuditAction.ADMIN_FORCE_CLOCK_OUT,
                Map.of("message", "Admin successfully terminated session")));
    }

    public void deleteSession(User currentUser, UUID sessionId){
        sessionRepo.deleteByUserIdAndUserOrganizationIdAndId(
                currentUser.getId(), currentUser.getOrganization().getId(), sessionId);
    }

    @Transactional(readOnly = true)
    public void processExport(Writer writer, User currentUser, LocalDate start, LocalDate end) {
        boolean isSuperAdmin = currentUser.getUserRole().equals(UserRole.SUPER_ADMIN);

        UUID filterBranchId = isSuperAdmin ? null : currentUser.getBranch().getId();

        Stream<Session> sessions = sessionRepo
                .streamByBranchForExport(filterBranchId, start, end, currentUser.getOrganization().getId());

        eventPublisher.publishEvent(new ExportToCsvRequest(writer, sessions));
    }

    private SessionArrivalStatus getArrivalStatus(Branch branch) {
        LocalTime start = branch.getShiftStart();
        LocalTime graceEnd = start.plus(Duration.ofMinutes(5));

        if (LocalTime.now().isBefore(start)) {
            return SessionArrivalStatus.EARLY;
        } else if (!LocalTime.now().isAfter(graceEnd)) {
            return SessionArrivalStatus.ON_TIME;
        } else {
            return SessionArrivalStatus.LATE;
        }
    }
}
