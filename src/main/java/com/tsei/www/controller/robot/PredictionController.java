package com.tsei.www.controller.robot;

import com.tsei.www.service.robot.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/predict")
public class PredictionController {

    private final PredictionService predictionService;

    @PostMapping("/save")
    public ResponseEntity<Void> predictAndSave(@RequestParam Long startId) {
        predictionService.predictAndSave(startId);
        return ResponseEntity.ok().build();
    }


//    @GetMapping("/print")
//    public ResponseEntity<Void> predictPrint(@RequestParam Long startId) {
//        predictionService.predictAndPrint(startId);
//        return ResponseEntity.ok().build();
//    }




//    @GetMapping("/recent")
//    public ResponseEntity<List<PredictionResultEntity>> getRecentResults() {
//        List<PredictionResultEntity> results = predictionService.getRecentResults();
//        return ResponseEntity.ok(results);
//    }


}
