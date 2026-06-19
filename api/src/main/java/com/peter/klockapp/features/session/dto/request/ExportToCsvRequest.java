package com.peter.klockapp.features.session.dto.request;

import com.peter.klockapp.features.session.model.Session;

import java.io.Writer;
import java.util.stream.Stream;

public record ExportToCsvRequest(
        Writer writer,
        Stream<Session> sessions
) {
}
