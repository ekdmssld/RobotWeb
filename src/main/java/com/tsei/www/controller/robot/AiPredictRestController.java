package com.tsei.www.controller.robot;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import com.tsei.www.service.robot.RobotService;

import java.util.Map;

public class AiPredictController {
    @PostMapping("/predict")
    public ResponseEntity<?> predict(@RequestBody Map<String, Object> req) {
        int detailId = Integer.parseInt(req.get("detailId").toString());
        String carCode = req.get("carCode").toString();

        aiPredictManagerService.runFullPrediction(detailId, carCode);
        return ResponseEntity.ok("예측 완료");
    }


}
