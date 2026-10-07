package com.biofit.backend.support;

/** Which view of a ticket is being built. Filtering happens on the server for each audience. */
public enum TicketAudience {
    CLIENT,
    SUPPORT,
    SPECIALIST
}
