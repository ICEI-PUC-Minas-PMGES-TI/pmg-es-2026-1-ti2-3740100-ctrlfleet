package com.ctrlfleet.api.controller;

import com.ctrlfleet.api.dto.indicadores.AdminIndicadoresDTO;
import com.ctrlfleet.api.service.AdminIndicadoresService;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/indicadores")
public class AdminIndicadoresController {

    private final AdminIndicadoresService adminIndicadoresService;

    public AdminIndicadoresController(AdminIndicadoresService adminIndicadoresService) {
        this.adminIndicadoresService = adminIndicadoresService;
    }

    @GetMapping
    public ResponseEntity<AdminIndicadoresDTO> indicadores(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return ResponseEntity.ok(adminIndicadoresService.calcular(inicio, fim));
    }
}
