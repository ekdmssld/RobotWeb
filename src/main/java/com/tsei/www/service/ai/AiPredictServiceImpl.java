package com.tsei.www.service.ai;


import com.tsei.www.dto.ai.AiPredictRequestDTO;
import com.tsei.www.dto.ai.AiPredictResponseDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiPredictServiceImpl implements AiPredictService {

    private final String AI_SERVER_URL = "http://localhost:5000/predict"; // Flask 서버 주소

    @Override
    public List<Double> predictChemicalProbabilities(List<Double> sensorVector) {
        RestTemplate restTemplate = new RestTemplate();

        AiPredictRequestDTO requestDTO = new AiPredictRequestDTO();
        requestDTO.setSensor_vector(sensorVector);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<AiPredictRequestDTO> request = new HttpEntity<>(requestDTO, headers);

        ResponseEntity<AiPredictResponseDTO> response = restTemplate.postForEntity(
                AI_SERVER_URL, request, AiPredictResponseDTO.class
        );

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return response.getBody().getPrediction();
        }

        throw new RuntimeException("AI 예측 실패");
    }
}
