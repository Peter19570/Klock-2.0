package com.peter.klockapp.features.clockevent.background;

import com.peter.klockapp.features.audit.dto.AuditRequest;
import com.peter.klockapp.features.clockevent.repo.ClockEventRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AutoClockOut {

    private final ClockEventRepo clockEventRepo;

    @Scheduled(fixedRate = 300_000) // Currently set to 5 min
    public void autoClockOutAfterBranchEndShiftTime() {
        int totalUpdated = clockEventRepo.autoClockOutExpiredSessions();

        if (totalUpdated > 0) {
            log.info("Successfully auto-clocked out {} expired employee sessions.", totalUpdated);
        }
    }
}
