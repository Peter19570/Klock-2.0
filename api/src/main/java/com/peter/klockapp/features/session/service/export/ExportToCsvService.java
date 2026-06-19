package com.peter.klockapp.features.session.service.export;

import com.peter.klockapp.features.clockevent.model.ClockEvent;
import com.peter.klockapp.features.session.exceptions.WriteToCSVException;
import com.peter.klockapp.features.session.model.Session;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.Writer;
import java.util.stream.Stream;

@Component
public class ExportToCsvService {

    @Async
    public void writeToCsv(Writer writer, Stream<Session> sessions) {
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader(
                        "Date",
                        "Staff Name",
                        "Session Status",
                        "Clock In",
                        "Clock Out",
                        "Type",
                        "Branch",
                        "Arrival Status"
                )
                .build();

        try (CSVPrinter printer = new CSVPrinter(writer, format)) {
            sessions.forEach(session -> {
                String staffName = session.getUser().getFirstName() + " " + session.getUser().getLastName();

                for (ClockEvent event : session.getClockEvents()) {
                    try {
                        printer.printRecord(
                                session.getWorkDate(),
                                staffName,
                                session.getStatus(),
                                event.getClockInTime(),
                                event.getClockOutTime() != null ? event.getClockOutTime() : "STILL IN",
                                event.getClockOutType(),
                                event.getBranch().getDisplayName(),
                                session.getArrivalStatus()
                        );
                    } catch (IOException e) {
                        throw new WriteToCSVException("CSV Row Write Error", e.getMessage());
                    }
                }
            });
            printer.flush();
        } catch (IOException e) {
            throw new WriteToCSVException("CSV Initialization Error", e.getMessage());
        }
    }
}
