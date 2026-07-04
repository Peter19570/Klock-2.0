package com.peter.klockapp.handler;

import com.peter.klockapp.features.auth.exceptions.AlreadyExistException;
import com.peter.klockapp.features.auth.exceptions.AuthenticationException;
import com.peter.klockapp.features.auth.exceptions.NotFoundException;
import com.peter.klockapp.features.auth.exceptions.ValidationException;
import com.peter.klockapp.features.session.exceptions.WriteToCSVException;
import com.peter.klockapp.features.shared.dto.ApiResponse;
import org.apache.coyote.BadRequestException;
import org.springframework.dao.InvalidDataAccessApiUsageException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<String>> handleServerException(Exception ex){
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Internal Server Error",
                        " Error caught: " + ex.getClass().getSimpleName()
                                + " Error Info: " + ex.getMessage()));
    }

    @ExceptionHandler(AlreadyExistException.class)
    public ResponseEntity<ApiResponse<String>> handleConflictException(Exception ex){
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error("Conflict", ex.getMessage()));
    }

    @ExceptionHandler({
            BadCredentialsException.class,
            UsernameNotFoundException.class,
            AuthorizationDeniedException.class,

    })
    public ResponseEntity<ApiResponse<String>> handleUnauthorizedException(Exception ex){
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Unauthorized", ex.getMessage()));
    }

    @ExceptionHandler({
            AuthenticationException.class,
            NotFoundException.class,
            ValidationException.class,
            BadRequestException.class,
            IllegalStateException.class,
            MethodArgumentTypeMismatchException.class,
            InvalidDataAccessApiUsageException.class,
            HttpMessageNotReadableException.class,
            MethodArgumentNotValidException.class,
            WriteToCSVException.class
    })
    public ResponseEntity<ApiResponse<String>> handleBadException(Exception ex){
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Bad Request", ex.getMessage()));
    }
}
