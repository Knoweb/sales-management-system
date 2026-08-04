package com.knoweb.salesmanagement.technicalproject.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class TechnicalProjectAlreadyExistsException extends RuntimeException {
    public TechnicalProjectAlreadyExistsException(String message) {
        super(message);
    }
}
