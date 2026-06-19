package com.peter.klockapp.features.session.controller;

import com.peter.klockapp.features.session.dto.response.SessionResponse;
import com.peter.klockapp.features.session.enums.SessionArrivalStatus;
import com.peter.klockapp.features.session.enums.SessionStatus;
import com.peter.klockapp.features.session.filters.SessionFilter;
import com.peter.klockapp.features.session.service.SessionService;
import com.peter.klockapp.features.shared.dto.ApiResponse;
import com.peter.klockapp.features.shared.dto.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
@Tag(name = "Session")
public class SessionController {

    private final SessionService sessionService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SessionResponse>>> getSessions(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) UUID branchId,
            @RequestParam(required = false) LocalDate minWorkDate,
            @RequestParam(required = false) LocalDate maxWorkDate,
            @RequestParam(required = false) SessionArrivalStatus arrivalStatus,
            @RequestParam(required = false) SessionStatus status,
            @RequestParam(required = false) String sessionUser
    ){
        SessionFilter sessionFilter = SessionFilter.builder()
                .sessionUser(sessionUser)
                .status(status)
                .minWorkDate(minWorkDate)
                .maxWorkDate(maxWorkDate)
                .arrivalStatus(arrivalStatus)
                .userId(userId)
                .branchId(branchId)
                .build();

        Pageable pageable = PageRequest.of(page, 50, Sort.by("createdAt").descending());
        Page<SessionResponse> responses = sessionService.getAllSessions(
                principal.user(), pageable, sessionFilter);
        return ResponseEntity.ok(new ApiResponse<>("All Sessions", responses));
    }

    @PatchMapping("/{id}/terminate")
    public ResponseEntity<Void> forceEndSession(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable UUID id){
        sessionService.forceEndSession(principal.user(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteSession(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable UUID id){
        sessionService.deleteSession(principal.user(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<Void> exportSessions(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            HttpServletResponse response) throws IOException {

        LocalDate startDate = (start != null) ? start : LocalDate.now().withDayOfMonth(1);
        LocalDate endDate = (end != null) ? end : LocalDate.now();

        response.setContentType("text/csv");
        response.setCharacterEncoding("UTF-8");
        String filename = String.format("work_report_%s_to_%s.csv", startDate, endDate);
        response.setHeader("Content-Disposition", "attachment; filename=" + filename);

        sessionService.processExport(response.getWriter(), principal.user(), startDate, endDate);
        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }
}
