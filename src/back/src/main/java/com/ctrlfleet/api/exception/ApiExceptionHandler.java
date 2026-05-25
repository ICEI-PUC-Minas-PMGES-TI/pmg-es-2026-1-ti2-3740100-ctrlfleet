package com.ctrlfleet.api.exception;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> ilegal(IllegalArgumentException e) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("mensagem", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> status(ResponseStatusException e) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("mensagem", e.getReason() != null ? e.getReason() : e.getStatusCode().toString());
        return ResponseEntity.status(e.getStatusCode()).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validacao(MethodArgumentNotValidException e) {
        String detalhes =
                e.getBindingResult().getFieldErrors().stream()
                        .map(err -> err.getField() + ": " + err.getDefaultMessage())
                        .collect(Collectors.joining("; "));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("mensagem", detalhes);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
}
