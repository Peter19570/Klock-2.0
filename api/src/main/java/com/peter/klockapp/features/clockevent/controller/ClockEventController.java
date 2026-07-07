package com.peter.klockapp.features.clockevent.controller;

import com.peter.klockapp.features.clockevent.dto.request.ClockInRequest;
import com.peter.klockapp.features.clockevent.dto.request.ClockOutRequest;
import com.peter.klockapp.features.clockevent.dto.response.ClockEventResponse;
import com.peter.klockapp.features.clockevent.service.ClockEventService;
import com.peter.klockapp.features.shared.dto.ApiResponse;
import com.peter.klockapp.features.shared.dto.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
@Tag(name = "Clock Event", description = "Performs the actual attendance and manages them")
public class ClockEventController {

    private final ClockEventService clockEventService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<ClockEventResponse>> clockIn(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody @Valid ClockInRequest request) throws BadRequestException {
        ClockEventResponse response = clockEventService.clockIn(request, principal);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Clock in successfully", response));
    }

    @PatchMapping("/active")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<ClockEventResponse>> clockOut(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody @Valid ClockOutRequest request){
        ClockEventResponse response = clockEventService.clockOut(request, principal);
        return ResponseEntity.ok(ApiResponse.success("Clock out successfully", response));
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<Boolean>> isActive(
            @AuthenticationPrincipal CustomUserPrincipal principal){
        Boolean response = clockEventService.isActive(principal);
        return ResponseEntity.ok(ApiResponse.success("Available clock event ?", response));
    }
}
