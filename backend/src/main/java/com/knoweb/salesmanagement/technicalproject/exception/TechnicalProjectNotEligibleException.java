package com.knoweb.salesmanagement.technicalproject.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class TechnicalProjectNotEligibleException extends RuntimeException {
    public TechnicalProjectNotEligibleException(String message) {
        super(message);
    }
}
