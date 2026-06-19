package com.peter.klockapp.features.shared.util;

public final class SnowflakeIdHelper {

    private static final long EPOCH = 1700000000000L; // custom start time
    private static final long NODE_ID = 1L; // change per server (0–1023)

    private static long sequence = 0L;
    private static long lastTimestamp = -1L;

    private static final long NODE_ID_BITS = 10L;
    private static final long SEQUENCE_BITS = 12L;

    private static final long MAX_SEQUENCE = (1L << SEQUENCE_BITS) - 1;

    private static final long NODE_ID_SHIFT = SEQUENCE_BITS;
    private static final long TIMESTAMP_SHIFT = SEQUENCE_BITS + NODE_ID_BITS;

    private SnowflakeIdHelper() {
        // prevent instantiation
    }

    public static synchronized long generateId() {
        long now = System.currentTimeMillis();

        if (now == lastTimestamp) {
            sequence = (sequence + 1) & MAX_SEQUENCE;

            if (sequence == 0) {
                while (now <= lastTimestamp) {
                    now = System.currentTimeMillis();
                }
            }
        } else {
            sequence = 0;
        }

        lastTimestamp = now;

        return ((now - EPOCH) << TIMESTAMP_SHIFT)
                | (NODE_ID << NODE_ID_SHIFT)
                | sequence;
    }
}
