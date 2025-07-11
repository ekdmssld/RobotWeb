package com.tsei.www.service.robot;

import com.tsei.www.dto.robot.PredictionResultDTO;
import com.tsei.www.dto.robot.SensorVectorDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.http.HttpHeaders;

@Service
@RequiredArgsConstructor
public class AiPredictService {

    private final RestTemplate restTemplate;

    public PredictionResultDTO predict(SensorVectorDTO dto){
        String aiUrl = "http://localhost:5000/predict";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<SensorVectorDTO> entity = new HttpEntity<>(dto, headers);

        ResponseEntity<PredictionResultDTO> response = restTemplate.exchange(aiUrl, HttpMethod.POST, entity, PredictionResultDTO.class);

        return response.getBody();
    }
}
