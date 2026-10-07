package com.biofit.backend.support;

/**
 * Who may read a ticket message.
 * CLIENT and SUPPORT replies are visible to the client.
 * INTERNAL_NOTE and SPECIALIST_INTERNAL stay on the staff side.
 */
public enum MessageVisibility {
    CLIENT,
    SUPPORT,
    INTERNAL_NOTE,
    SPECIALIST_INTERNAL
}
