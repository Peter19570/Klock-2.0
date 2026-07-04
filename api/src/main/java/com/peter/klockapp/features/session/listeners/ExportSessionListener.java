package com.peter.klockapp.features.session.listeners;

import com.peter.klockapp.features.session.dto.request.ExportToCsvRequest;
import com.peter.klockapp.features.session.service.export.ExportToCsvService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ExportSessionListener {

    @EventListener
    public void onExportSessionCsv(ExportToCsvRequest request){
        ExportToCsvService.writeToCsv(request.writer(), request.sessions());
    }
}
